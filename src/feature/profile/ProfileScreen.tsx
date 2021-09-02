import { useRef, useReducer, lazy } from "react";
import { useTranslation } from "react-i18next";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import LinearProgress from "@material-ui/core/LinearProgress";
import Typography from "@material-ui/core/Typography";
import useMediaQuery from "@material-ui/core/useMediaQuery"
import { makeStyles, useTheme } from "@material-ui/core/styles";

import {
    PencilIcon, KeyIcon, PaperAirplaneIcon, PhotographIcon
} from "@heroicons/react/outline";

import ProfileActionList from "./ProfileActionList";
import ComponentHeader from "../../components/ComponentHeader";
import { ReactComponent as Avatar } from "../../shared/user.svg"

import { AuthStatus, useAuthState } from "../auth/AuthProvider";

import {
    ChangeNameActionType,
    changeNameInitialState,
    changeNameReducer
} from "./actions/ChangeNameReducer";

import {
    RequestResetActionType,
    requestResetInitialState,
    requestResetReducer
} from "./actions/RequestResetReducer";

const ChangeNamePrompt = lazy(() => import('./actions/ChangeName'));
const RequestResetPrompt = lazy(() => import('./actions/RequestReset'));

const useStyles = makeStyles(() => ({
    root: {
        width: '100%', height: '100%'
    },
    wrapper: {
        height: '80%', padding: '1.4em'
    },
    avatar: {
        width: '40vw', height: '40vh' 
    }
}))

type ProfileScreenProps = {
    onDrawerToggle: () => void
}


const ProfileScreen = (props: ProfileScreenProps) => {
    const { status, user } = useAuthState();
    const classes = useStyles();
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
    const fileInput = useRef<HTMLInputElement | null>(null);

    const [changeNameState, changeNameDispatch] = useReducer(changeNameReducer, changeNameInitialState);
    const onChangeNamePromptView = () => {
        changeNameDispatch({
            type: ChangeNameActionType.INVOKE
        })
    }
    const onChangeNamePromptDismiss = () => {
        changeNameDispatch({
            type: ChangeNameActionType.DISMISS
        })
    }

    const onFirstNameChanged = (firstName: string) => {
        let name = changeNameState.name;
        if (name === undefined)
            name = ['', ''];
        name[0] = firstName;
        changeNameDispatch({
            type: ChangeNameActionType.CHANGED,
            payload: name
        })
    }
    const onLastNameChanged = (lastName: string) => {
        let name = changeNameState.name;
        if (name === undefined)
            name = ['', ''];
        name[1] = lastName;
        changeNameDispatch({
            type: ChangeNameActionType.CHANGED,
            payload: name
        })
    }

    const onChangeNamePromptCommit = () => {}

    const [requestResetState, requestResetDispatch] = useReducer(requestResetReducer, requestResetInitialState);
    const onRequestResetPromptView = () => {
        requestResetDispatch({
            type: RequestResetActionType.INVOKE
        });
    }
    const onRequestResetPromptDismiss = () => {
        requestResetDispatch({
            type: RequestResetActionType.DISMISS
        });
    }

    const onEmailChanged = (email: string) => {
        requestResetDispatch({
            type: RequestResetActionType.CHANGED,
            payload: email
        })
    }

    const onRequestResetPromptSubmit = () => {}

    const changePassword = () => {}

    const actions = [
        { key: 'action:avatar', icon: PhotographIcon, title: "action.update_avatar", action: () => fileInput?.current?.click() },
        { key: 'action:name', icon: PencilIcon, title: "action.change_name", action: onChangeNamePromptView },
        { key: 'action:password', icon: KeyIcon, title: "action.change_password", action: () => changePassword() },
        { key: 'action:request', icon: PaperAirplaneIcon, title: "action.request_reset", action: onRequestResetPromptView }
    ];
    
    return (
        <Box className={classes.root}>
            <ComponentHeader
                title={ t("navigation.profile") }
                onDrawerToggle={props.onDrawerToggle}/>
            <input ref={fileInput} type="file" accept="image/*" hidden/>

            { status === AuthStatus.FETCHED
                ? 
                <div className={classes.wrapper}>
                    <Grid 
                        container 
                        direction={isMobile ? "column" : "row"} 
                        spacing={2}>
                        <Grid item sm={6}>
                            { user?.imageUrl 
                                ? <LazyLoadImage
                                    className={classes.avatar}
                                    alt={t("info.profile_image")}
                                    src={user?.imageUrl}/>
                                : <Avatar className={classes.avatar}/>
                            }
                            <Typography align="center" variant="h4">
                                {t("template.full_name", { first: user?.firstName, last: user?.lastName })}
                            </Typography>
                            <Typography align="center" variant="body1">{user?.email}</Typography>
                        </Grid>
                        <Grid item sm={6}>
                            <ProfileActionList actions={actions}/>
                        </Grid>
                    </Grid>
                </div>
                : <LinearProgress/>
            }

            <ChangeNamePrompt
                isOpen={changeNameState.isOpen}
                firstName={changeNameState.name !== undefined ? changeNameState.name[0] : ''}
                lastName={changeNameState.name !== undefined ? changeNameState.name[1] : ''}
                onDismiss={onChangeNamePromptDismiss}
                onSubmit={onChangeNamePromptCommit}
                onFirstNameChanged={onFirstNameChanged}
                onLastNameChanged={onLastNameChanged}/>

            <RequestResetPrompt
                isOpen={requestResetState.isOpen}
                email={requestResetState.email !== undefined ? requestResetState.email : ''}
                onDismiss={onRequestResetPromptDismiss}
                onSubmit={onRequestResetPromptSubmit}
                onEmailChanged={onEmailChanged}/>
        </Box>
    );
}

export default ProfileScreen;