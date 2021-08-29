import { useTranslation } from "react-i18next";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import LinearProgress from "@material-ui/core/LinearProgress";
import Typography from "@material-ui/core/Typography";
import useMediaQuery from "@material-ui/core/useMediaQuery"
import { makeStyles, useTheme } from "@material-ui/core/styles";

import {
    PencilIcon, KeyIcon, PaperAirplaneIcon
} from "@heroicons/react/outline";

import ProfileActionList from "./ProfileActionList";
import ComponentHeader from "../../components/ComponentHeader";

import { AuthStatus, useAuthState } from "../auth/AuthProvider";

const useStyles = makeStyles(() => ({
    root: {
        width: '100%', height: '100%'
    },
    wrapper: {
        height: '80%', padding: '1.4em'
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

    const changeName = () => {}
    const changePassword = () => {}
    const requestPasswordReset = () => {}

    const actions = [
        { key: 'action:name', icon: PencilIcon, title: "action.change_name", action: () => changeName() },
        { key: 'action:password', icon: KeyIcon, title: "action.change_password", action: () => changePassword() },
        { key: 'action:request', icon: PaperAirplaneIcon, title: "action.request_reset", action: () => requestPasswordReset() }
    ];
    
    return (
        <Box className={classes.root}>
            <ComponentHeader
                title={ t("navigation.profile") }
                onDrawerToggle={props.onDrawerToggle}/>

            { status === AuthStatus.FETCHED
                ? 
                <div className={classes.wrapper}>
                    <Grid 
                        container 
                        direction={isMobile ? "column" : "row"} 
                        spacing={2}>
                        <Grid item sm={6}>
                            <Typography variant="h4">{user?.firstName}</Typography>
                            <Typography variant="h4">{user?.lastName}</Typography>
                            <Typography variant="body1">{user?.email}</Typography>
                        </Grid>
                        <Grid item sm={6}>
                            <ProfileActionList actions={actions}/>
                        </Grid>
                    </Grid>
                </div>
                : <LinearProgress/>
            }
        </Box>
    );
}

export default ProfileScreen;