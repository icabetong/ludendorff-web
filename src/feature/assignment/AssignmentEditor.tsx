import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormLabel,
    Grid,
    ListItem,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
    makeStyles
} from "@material-ui/core";
import { useSnackbar } from "notistack";
import { MuiPickersUtilsProvider, KeyboardDateTimePicker } from "@material-ui/pickers";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import DateFnsUtils  from "@date-io/date-fns";
import firebase from "firebase";

import { useAuthState } from "../auth/AuthProvider";
import { Assignment, AssignmentRepository } from "./Assignment";
import { Asset, AssetCore, minimize as minimizeAsset } from "../asset/Asset";
import AssetPicker from "../asset/AssetPicker";
import { User, UserCore, minimize as minimizeUser } from "../user/User";
import UserPicker from "../user/UserPicker";
import { newId } from "../../shared/utils";
import { usePagination } from "../../shared/pagination";
import {
    assetCollection,
    userCollection,
    assetName,
    lastName
} from "../../shared/const";
import { firestore } from "../../index";

const useStyles = makeStyles((theme) => ({
    gridItem: {
        maxWidth: '100%'
    }
}));

type AssignmentEditorProps = {
    isOpen: boolean,
    isCreate: boolean,
    assignment?: Assignment,
    onCancel: () => void
}

type FormValues = {
    location: string,
    remarks: string
}

const AssignmentEditor = (props: AssignmentEditorProps) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();
    const { user: currentUser } = useAuthState();
    const { register, handleSubmit } = useForm<FormValues>();
    const [isWritePending, setWritePending] = useState<boolean>(false);
    const [asset, setAsset] = useState<AssetCore | undefined>(props.assignment?.asset);
    const [user, setUser] = useState<UserCore | undefined>(props.assignment?.user);
    const [dateAssigned, setDateAssigned] = useState<Date | undefined>(props.assignment?.dateAssigned?.toDate());
    const [dateReturned, setDateReturned] = useState<Date | undefined>(props.assignment?.dateReturned?.toDate());
    const [isAssetPickerOpen, setAssetPickerOpen] = useState<boolean>(false);
    const [isUserPickerOpen, setUserPickerOpen] = useState<boolean>(false);

    const onAssetPickerView = () => setAssetPickerOpen(true);
    const onAssetPickerDismiss = () => setAssetPickerOpen(false);

    const onUserPickerView = () => setUserPickerOpen(true);
    const onUserPickerDismiss = () => setUserPickerOpen(false);

    const onDateAssignedChanged = (date: MaterialUiPickersDate) => {
        if (date?.toUTCString())
            setDateAssigned(new Date(date?.toUTCString()))
    }
    const onDateReturnedChanged = (date: MaterialUiPickersDate) => {
        if (date?.toUTCString())
            setDateReturned(new Date(date?.toUTCString()))
    }

    const onAssetChange = (a: Asset) => {
        if (asset?.assetId !== a.assetId) {
            previousAssetId = asset?.assetId;
        }
        setAsset(minimizeAsset(a));
    }

    const onUserChange = (u: User) => {
        if (user?.userId !== u.userId) {
            previousUserId = user?.userId;
        }
        setUser(minimizeUser(u));
    }

    const {
        items: assets,
        isLoading: isAssetsLoading,
        isStart: atAssetStart,
        isEnd: atAssetEnd,
        getPrev: getPreviousAssets,
        getNext: getNextAssets
    } = usePagination<Asset>(
        firestore
            .collection(assetCollection)
            .orderBy(assetName, "asc"), { limit: 15 }
    );

    const {
        items: users,
        isLoading: isUsersLoading,
        isStart: atUserStart,
        isEnd: atUserEnd,
        getPrev: getPreviousUsers,
        getNext: getNextUsers,
    } = usePagination<User>(
        firestore.collection(userCollection)
        .orderBy(lastName, "asc"), { limit: 15 }
    );

    let previousAssetId: string | undefined;
    let previousUserId: string | undefined;
    const onSubmit = (data: FormValues) => {
        setWritePending(true);
        const assignment: Assignment = {
            assignmentId: props.assignment ? props.assignment.assignmentId : newId(),
            asset: asset ? asset : undefined,
            user: user ? user : undefined,
            dateAssigned: dateAssigned ? firebase.firestore.Timestamp.fromDate(dateAssigned) : firebase.firestore.Timestamp.now(),
            dateReturned: dateReturned ? firebase.firestore.Timestamp.fromDate(dateReturned) : undefined,
            ...data
        }

        if (props.isCreate) {
            AssignmentRepository.create(assignment, currentUser ? currentUser?.userId : "")
                .then(() => enqueueSnackbar(t("feedback.assignment_created")))
                .catch(() => enqueueSnackbar(t("feedback.assignment_create_error")))
                .finally(onDestroy)
        } else {
            AssignmentRepository.update(assignment, 
                currentUser ? currentUser?.userId : "", previousAssetId, previousUserId)
                .then(() => enqueueSnackbar(t("feedback.assignment_updated")))
                .catch(() => enqueueSnackbar(t("feedback.assignment_update_error")))
                .finally(onDestroy)
        }
    }

    const onDestroy = () => {
        setWritePending(false);
        props.onCancel();
    }

    return (
        <>
            <Dialog
                fullScreen={isMobile}
                fullWidth={true}
                maxWidth={isMobile ? "xs" : "md"}
                open={props.isOpen}
                onClose={props.onCancel}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>{ t("assignment_details") }</DialogTitle>
                    <DialogContent dividers={true}>
                        <Container>
                            <Grid container direction={isMobile ? "column" : "row"} alignItems="stretch" justifyContent="center" spacing={isMobile ? 0 : 4}>
                                <Grid item xs={6} className={classes.gridItem}>
                                    <FormControl component="fieldset" fullWidth>
                                        <FormLabel component="legend">
                                            <Typography variant="body2">{ t("field.asset") }</Typography>
                                        </FormLabel>
                                        <ListItem button onClick={onAssetPickerView} disabled={isWritePending}>
                                            <Typography variant="body2">
                                                { asset !== undefined ? asset?.assetName : t("not_set") }
                                            </Typography>
                                        </ListItem>
                                    </FormControl>

                                    <FormControl component="fieldset" fullWidth>
                                        <FormLabel component="legend">
                                            <Typography variant="body2">{ t("field.user") }</Typography>
                                        </FormLabel>
                                        <ListItem button onClick={onUserPickerView} disabled={isWritePending}>
                                            <Typography variant="body2">
                                                { user !== undefined ? `${user?.name}` : t("not_set") }
                                            </Typography>
                                        </ListItem>
                                    </FormControl>

                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>

                                        <FormControl component="fieldset" fullWidth>
                                            <FormLabel component="legend">
                                                <Typography variant="body2">{t("field.date_assigned")}</Typography>
                                            </FormLabel>
                                            <KeyboardDateTimePicker
                                                id="date-assigned"
                                                variant="inline"
                                                inputVariant="outlined"
                                                disabled={isWritePending}
                                                value={dateAssigned === undefined ? null : props.assignment?.dateAssigned?.toDate()}
                                                onChange={onDateAssignedChanged}/>
                                        </FormControl>

                                        { dateReturned &&
                                            <FormControl component="fieldset" fullWidth>
                                                <FormLabel component="legend">
                                                    <Typography variant="body2">{t("field.date_returned")}</Typography>
                                                </FormLabel>
                                                <KeyboardDateTimePicker
                                                    id="date-assigned"
                                                    variant="inline"
                                                    inputVariant="outlined"
                                                    disabled={isWritePending}
                                                    value={dateReturned === undefined ? null : props.assignment?.dateReturned?.toDate()}
                                                    onChange={onDateReturnedChanged}/>
                                            </FormControl>
                                        }

                                    </MuiPickersUtilsProvider>
                                </Grid>
                                <Grid item xs={6} className={classes.gridItem}>
                                    <TextField
                                        id="location"
                                        type="text"
                                        label={t("field.location")}
                                        disabled={isWritePending}
                                        defaultValue={props.assignment !== undefined ? props.assignment?.location : ""}
                                        fullWidth
                                        {...register("location")}/>

                                    <TextField
                                        multiline
                                        rows={10}
                                        id="remarks"
                                        type="text"
                                        label={t("field.remarks")}
                                        disabled={isWritePending}
                                        defaultValue={props.assignment !== undefined ? props.assignment?.remarks : ""}
                                        fullWidth
                                        {...register("remarks")}/>
                                </Grid>
                            </Grid>
                        </Container>
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            color="primary"
                            disabled={isWritePending}
                            onClick={props.onCancel}>
                            { t("cancel") }
                        </Button>
                        <Button
                            color="primary" 
                            disabled={isWritePending}
                            type="submit">
                            { isWritePending ? t("feedback.saving") : t("button.save") }
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
            <AssetPicker
                isOpen={isAssetPickerOpen}
                assets={assets}
                isLoading={isAssetsLoading}
                hasPrevious={atAssetStart}
                hasNext={atAssetEnd}
                onPrevious={getPreviousAssets}
                onNext={getNextAssets}
                onDismiss={onAssetPickerDismiss}
                onSelectItem={onAssetChange}/>
            <UserPicker
                isOpen={isUserPickerOpen}
                users={users}
                isLoading={isUsersLoading}
                hasPrevious={atUserStart}
                hasNext={atUserEnd}
                onPrevious={getPreviousUsers}
                onNext={getNextUsers}
                onDismiss={onUserPickerDismiss}
                onSelectItem={onUserChange}/>
        </>    
    );
}

export default AssignmentEditor;