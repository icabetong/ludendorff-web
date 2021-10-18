import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
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

import { User, Permission } from "./User";
import { Department, DepartmentCore, minimize } from "../department/Department";
import DepartmentPicker from "../department/DepartmentPicker";
import { usePagination } from "../../shared/pagination";
import {
    departmentCollection,
    departmentName
} from "../../shared/const";
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
    id?: string,
    lastName?: string,
    firstName?: string,
    email?: string,
    permissions: number[],
    position?: string,
    department?: DepartmentCore,
    onCancel: () => void,
    onSubmit: () => void,
    onLastNameChanged: (lastName: string) => void,
    onFirstNameChanged: (firstName: string) => void,
    onEmailChanged: (email: string) => void,
    onPermissionsChanged: (permissions: number[]) => void,
    onPositionChanged: (position: string) => void
}

type FormValues = {
    lastName: string,
    firstName: string,
    email: string,
    permissions: number[],
    position: string
}

const UserEditor = (props: UserEditorProps) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
    const [isPickerOpen, setPickerOpen] = useState(false);
    const [department, setDepartment] = useState<DepartmentCore | undefined>(props.user?.department)
    const [permissions, setPermissions] = useState<number[]>(props.user?.permissions !== undefined ? props.user?.permissions : []);

    const onSubmit = (data: FormValues) => {
        console.log(data)
    }

    const onPickerView = () => setPickerOpen(true);
    const onPickerDismiss = () => setPickerOpen(false);

    const onDepartmentSelected = (department: Department) => {
        setDepartment(minimize(department))
    }

    const {
        items: departments,
        isLoading: isDepartmentsLoading,
        isStart: atDepartmentStart,
        isEnd: atDepartmentEnd,
        getPrev: getPreviousDepartments,
        getNext: getNextDepartments,
    } = usePagination<Department>(
        firestore
            .collection(departmentCollection)
            .orderBy(departmentName, "asc"), { limit: 15 } 
    );

    const hasPermission = (permission: Permission) => {
        return permissions.includes(permission);
    }

    const onPermissionsChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        let _permissions = permissions;
        switch(event.target.name) {
            case "editor-read": 
                if (isChecked)
                    _permissions.push(Permission.READ);
                else _permissions = _permissions.filter((v: number) => v !== Permission.READ);
                break;
            case "editor-write":
                if (isChecked)
                    _permissions.push(Permission.WRITE);
                else _permissions = _permissions.filter((v: number) => v !== Permission.WRITE);
                break;
            case "editor-delete":
                if (isChecked)
                    _permissions.push(Permission.DELETE);
                else _permissions = _permissions.filter((v: number) => v !== Permission.DELETE);
                break;
            case "editor-manage-users":
                if (isChecked)
                    _permissions.push(Permission.MANAGE_USERS);
                else _permissions = _permissions.filter((v: number) => v !== Permission.MANAGE_USERS);
                break;
            case "editor-administrative":
                if (isChecked)
                    _permissions.push(Permission.ADMINISTRATIVE);
                else _permissions = _permissions.filter((v: number) => v !== Permission.ADMINISTRATIVE);
                break;
        }
        setPermissions(_permissions)
    }

    return (
        <>
            <Dialog
                fullScreen={isMobile}
                fullWidth={true}
                maxWidth={isMobile ? "xs" : "md"}
                open={props.isOpen}
                onClose={() => props.onCancel()}>
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
                                        defaultValue={props.lastName}
                                        className={classes.textField}
                                        error={errors.lastName !== undefined}
                                        helperText={errors.lastName?.message !== undefined ? t(errors.lastName?.message) : undefined}
                                        {...register("lastName", { required: "feedback.empty_last_name" })}/>

                                    <TextField
                                        id="firstName"
                                        type="text"
                                        label={ t("field.first_name") }
                                        defaultValue={props.firstName}
                                        className={classes.textField}
                                        error={errors.firstName !== undefined}
                                        helperText={errors.firstName?.message !== undefined ? t(errors.firstName?.message) : undefined}
                                        {...register("firstName", { required: "feedback.empty_first_name" })}/>

                                    <TextField
                                        id="email"
                                        type="text"
                                        label={ t("field.email") }
                                        value={props.email}
                                        className={classes.textField}
                                        error={errors.email !== undefined}
                                        helperText={errors.email?.message !== undefined ? t(errors.email?.message) : undefined}
                                        {...register("email", { required: "feedback.empty_email" })} />

                                    <TextField
                                        id="position"
                                        type="text"
                                        label={ t("field.position") }
                                        value={props.position}
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
                                                { department?.name !== undefined ? department?.name : t("not_set")  }
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
                                                <Checkbox 
                                                    checked={hasPermission(Permission.READ)} 
                                                    onChange={onPermissionsChanged}
                                                    name="editor-read"/>
                                            }/>
                                        <FormControlLabel
                                            label={t("permission.write")}
                                            control={
                                                <Checkbox 
                                                    checked={hasPermission(Permission.WRITE)} 
                                                    onChange={onPermissionsChanged}
                                                    name="editor-write"/>
                                            }/>
                                        <FormControlLabel
                                            label={t("permission.delete")}
                                            control={
                                                <Checkbox 
                                                    checked={hasPermission(Permission.DELETE)} 
                                                    onChange={onPermissionsChanged}
                                                    name="editor-delete"/>
                                            }/>
                                        <FormControlLabel
                                            label={t("permission.manage_users")}
                                            control={
                                                <Checkbox 
                                                    checked={hasPermission(Permission.MANAGE_USERS)} 
                                                    onChange={onPermissionsChanged}
                                                    name="editor-manage-users"/>
                                            }/>
                                        <FormControlLabel
                                            label={t("permission.administrative")}
                                            control={
                                                <Checkbox 
                                                    checked={hasPermission(Permission.ADMINISTRATIVE)} 
                                                    onChange={onPermissionsChanged}
                                                    name="editor-administrative"/>
                                            }/>
                                    </FormGroup>
                                </FormControl>
                                { props.permissions.includes(Permission.ADMINISTRATIVE) &&
                                    <Card variant="outlined" className={classes.card}>
                                        {t("info.user_editor_admin_permission")}
                                    </Card>
                                }
                                </Grid>
                            </Grid>
                        </Container>
                    </DialogContent>

                    <DialogActions>
                        <Button color="primary" onClick={props.onCancel}>{ t("cancel") }</Button>
                        <Button color="primary" type="submit">{ t("save") }</Button>
                    </DialogActions>
                </form>
            </Dialog>
            <DepartmentPicker
                isOpen={isPickerOpen}
                departments={departments}
                isLoading={isDepartmentsLoading}
                hasPrevious={atDepartmentStart}
                hasNext={atDepartmentEnd}
                onPrevious={getPreviousDepartments}
                onNext={getNextDepartments}
                onDismiss={onPickerDismiss}
                onSelectItem={onDepartmentSelected}/>
        </>
    );
}

export default UserEditor;