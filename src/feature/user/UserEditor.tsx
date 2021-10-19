import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import {
    Button,
    Card,
    Checkbox,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormGroup,
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

import { User, Permission, UserRepository } from "./User";
import { Department, DepartmentCore, minimize } from "../department/Department";
import DepartmentPicker from "../department/DepartmentPicker";
import { usePagination } from "../../shared/pagination";
import {
    departmentCollection,
    departmentName
} from "../../shared/const";
import { newId } from "../../shared/utils";
import { firestore } from "../..";

const useStyles = makeStyles((theme) => ({
    textField: {
        width: '100%',
        margin: '0.6em 0',
        '& .MuiListItem-root': {
            borderRadius: theme.spacing(1)
        }
    },
    icon: {
        width: '1em',
        height: '1em',
        color: theme.palette.text.primary
    },
    gridItem: {
        maxWidth: '100%'
    },
    card: {
        padding: '1em'
    }
}));

type UserEditorProps = {
    isOpen: boolean,
    isCreate: boolean,
    user?: User,
    onDismiss: () => void,
}

type FormValues = {
    lastName: string,
    firstName: string,
    email: string,
    position: string,
    permissionRead: boolean,
    permissionWrite: boolean,
    permissionDelete: boolean,
    permissionManageUsers: boolean,
    permissionAdmin: boolean
}

const UserEditor = (props: UserEditorProps) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
    const { register, handleSubmit, formState: { errors }, control } = useForm<FormValues>();
    const [isPickerOpen, setPickerOpen] = useState(false);
    const [department, setDepartment] = useState<DepartmentCore | undefined>(props.user?.department)

    const onSubmit = (data: FormValues) => {
        const permissions = [];
        if (data.permissionRead) permissions.push(Permission.READ)
        if (data.permissionWrite) permissions.push(Permission.WRITE)
        if (data.permissionDelete) permissions.push(Permission.DELETE)
        if (data.permissionManageUsers) permissions.push(Permission.MANAGE_USERS)
        if (data.permissionAdmin) permissions.push(Permission.ADMINISTRATIVE)

        const user: User = {
            userId: props.user !== undefined ? props.user?.userId : newId(),
            department: department,
            disabled: props.user !== undefined ? props.user?.disabled : false,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            position: data.position,
            permissions: permissions
        }

        if (props.isCreate) {
            UserRepository.create(user)
                .then(() => enqueueSnackbar(t("feedback.user_created")))
                .catch(() => enqueueSnackbar(t("feedback.asset_create_error")))
                .finally(props.onDismiss)
        } else {
            UserRepository.update(user)
                .then(() => enqueueSnackbar(t("feedback.user_updated")))
                .catch(() => enqueueSnackbar(t("feedback.asset_update_error")))
                .finally(props.onDismiss)
        }
    }

    const onPickerView = () => setPickerOpen(true);
    const onPickerDismiss = () => setPickerOpen(false);

    const onDepartmentSelected = (department: Department) => {
        setDepartment(minimize(department))
        onPickerDismiss()
    }

    const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Department>(
        firestore
            .collection(departmentCollection)
            .orderBy(departmentName, "asc"), { limit: 15 } 
    );

    const hasPermission = (permission: Permission) => {
        return props.user?.permissions.includes(permission);
    }

    return (
        <>
            <Dialog
                fullScreen={isMobile}
                fullWidth={true}
                maxWidth={isMobile ? "xs" : "md"}
                open={props.isOpen}
                onClose={() => props.onDismiss()}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>{t("user_details")}</DialogTitle>
                    <DialogContent dividers={true}>
                        <Container>
                            <Grid container direction={isMobile ? "column" : "row"} alignItems="stretch" justifyContent="center" spacing={isMobile ? 0 : 4}>
                                <Grid item xs={6} className={classes.gridItem}>
                                    <TextField
                                        autoFocus
                                        id="lastName"
                                        type="text"
                                        label={ t("field.last_name") }
                                        defaultValue={props.user?.lastName}
                                        className={classes.textField}
                                        error={errors.lastName !== undefined}
                                        helperText={errors.lastName?.message !== undefined ? t(errors.lastName?.message) : undefined}
                                        {...register("lastName", { required: "feedback.empty_last_name" })}/>

                                    <TextField
                                        id="firstName"
                                        type="text"
                                        label={ t("field.first_name") }
                                        defaultValue={props.user?.firstName}
                                        className={classes.textField}
                                        error={errors.firstName !== undefined}
                                        helperText={errors.firstName?.message !== undefined ? t(errors.firstName?.message) : undefined}
                                        {...register("firstName", { required: "feedback.empty_first_name" })}/>

                                    <TextField
                                        id="email"
                                        type="text"
                                        label={ t("field.email") }
                                        defaultValue={props.user?.email}
                                        className={classes.textField}
                                        error={errors.email !== undefined}
                                        helperText={errors.email?.message !== undefined ? t(errors.email?.message) : undefined}
                                        {...register("email", { required: "feedback.empty_email" })} />

                                    <TextField
                                        id="position"
                                        type="text"
                                        label={ t("field.position") }
                                        defaultValue={props.user?.position}
                                        className={classes.textField}
                                        error={errors.position !== undefined}
                                        helperText={errors.position?.message !== undefined ? t(errors.position?.message) : undefined}
                                        {...register("position", { required: "feedback.empty_postion"})} />

                                    <FormControl component="fieldset" className={classes.textField}>
                                        <FormLabel component="legend">
                                            <Typography variant="body2">{ t("field.department") }</Typography>
                                        </FormLabel>
                                        <ListItem button onClick={onPickerView}>
                                            <Typography variant="body2">
                                                { department !== undefined ? department?.name : t("not_set")  }
                                            </Typography>
                                        </ListItem>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} className={classes.gridItem}>
                                    <FormControl component="fieldset" className={classes.textField}>
                                    <FormLabel component="legend">
                                        <Typography variant="body2">{ t("field.permissions") }</Typography>
                                    </FormLabel>
                                    <FormGroup>
                                        <FormControlLabel
                                            label={t("permission.read")}
                                            control={
                                                <Controller
                                                    name="permissionRead"
                                                    control={control}
                                                    render={({ field: { onChange, value } }) => (
                                                        <Checkbox 
                                                            defaultChecked={hasPermission(Permission.READ)}
                                                            checked={value} 
                                                            onChange={onChange}/>
                                                    )} />
                                            }/>
                                        <FormControlLabel
                                            label={t("permission.write")}
                                            control={
                                                <Controller
                                                    name="permissionWrite"
                                                    control={control}
                                                    render={({ field: { onChange, value }}) => (
                                                        <Checkbox 
                                                            defaultChecked={hasPermission(Permission.WRITE)}
                                                            checked={value} 
                                                            onChange={onChange}/>
                                                    )}/>
                                            }/>
                                        <FormControlLabel
                                            label={t("permission.delete")}
                                            control={
                                                <Controller
                                                    name="permissionDelete"
                                                    control={control}
                                                    render={({ field: { onChange, value }}) => (
                                                        <Checkbox 
                                                            defaultChecked={hasPermission(Permission.DELETE)}
                                                            checked={value} 
                                                            onChange={onChange}/>
                                                    )} />
                                                
                                            }/>
                                        <FormControlLabel
                                            label={t("permission.manage_users")}
                                            control={
                                                <Controller
                                                    name="permissionManageUsers"
                                                    control={control}
                                                    render={({ field: { onChange, value }}) => (
                                                        <Checkbox 
                                                            defaultChecked={hasPermission(Permission.MANAGE_USERS)}
                                                            checked={value} 
                                                            onChange={onChange}/>
                                                    )} />
                                            }/>
                                        <FormControlLabel
                                            label={t("permission.administrative")}
                                            control={
                                                <Controller
                                                    name="permissionAdmin"
                                                    control={control}
                                                    render={({ field: { onChange, value }}) => (
                                                        <Checkbox
                                                            defaultChecked={hasPermission(Permission.ADMINISTRATIVE)}
                                                            checked={value} 
                                                            onChange={onChange}/>
                                                    )} />
                                            }/>
                                    </FormGroup>
                                </FormControl>
                                { props.user?.permissions.includes(Permission.ADMINISTRATIVE) &&
                                    <Card variant="outlined" className={classes.card}>
                                        {t("info.user_editor_admin_permission")}
                                    </Card>
                                }
                                </Grid>
                            </Grid>
                        </Container>
                    </DialogContent>

                    <DialogActions>
                        <Button color="primary" onClick={props.onDismiss}>{ t("cancel") }</Button>
                        <Button color="primary" type="submit">{ t("save") }</Button>
                    </DialogActions>
                </form>
            </Dialog>
            <DepartmentPicker
                isOpen={isPickerOpen}
                departments={items}
                isLoading={isLoading}
                hasPrevious={isStart}
                hasNext={isEnd}
                onPrevious={getPrev}
                onNext={getNext}
                onDismiss={onPickerDismiss}
                onSelectItem={onDepartmentSelected}/>
        </>
    );
}

export default UserEditor;