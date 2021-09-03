import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import Container from "@material-ui/core/Container";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormGroup from "@material-ui/core/FormGroup";
import FormLabel from "@material-ui/core/FormLabel";
import Grid from "@material-ui/core/Grid";
import ListItem from "@material-ui/core/ListItem";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles, useTheme } from "@material-ui/core/styles";

import { Permission } from "./User";
import { DepartmentCore } from "../department/Department";

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
    }
}));

type UserEditorProps = {
    isOpen: boolean,
    id?: string,
    lastName?: string,
    firstName?: string,
    email?: string,
    permissions: number[],
    position?: string,
    department?: DepartmentCore,
    onCancel: () => void,
    onSubmit: () => void,
    onDepartmentSelect: () => void,
    onLastNameChanged: (lastName: string) => void,
    onFirstNameChanged: (firstName: string) => void,
    onEmailChanged: (email: string) => void,
    onPermissionsChanged: (permissions: number[]) => void,
    onPositionChanged: (position: string) => void
}

const UserEditor = (props: UserEditorProps) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

    const [firstNameError, setFirstNameError] = useState(false);
    const [lastNameError, setLastNameError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [positionError, setPositionError] = useState(false);

    const onLastNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const lastName = event.target.value;
        if (lastName !== '' && lastNameError)
            setLastNameError(false);

        props.onLastNameChanged(lastName);
    }

    const onFirstNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const firstName = event.target.value;
        if (firstName !== '' && firstNameError)
            setFirstNameError(false);

        props.onFirstNameChanged(firstName);
    }

    const onEmailAddressChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const email = event.target.value;
        if (email !== '' && emailError)
            setEmailError(false);

        props.onEmailChanged(email);
    }

    const onPositionChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const position = event.target.value;
        if (position !== '' && positionError)
            setPositionError(false);

        props.onPositionChanged(position);
    }

    const onPreSubmit = () => {
        if (props.lastName === undefined) {
            setLastNameError(true);
            return;
        }

        if (props.firstName === undefined) {
            setFirstNameError(true);
            return;
        }

        if (props.email === undefined) {
            setEmailError(true);
            return;
        }

        if (props.position === undefined) {
            setPositionError(true);
            return;
        }

        props.onSubmit();
    }

    const hasPermission = (permissions: number[], permission: Permission) => {
        return permissions.includes(permission);
    }

    const onPermissionsChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        let permissions = props.permissions;
        switch(event.target.name) {
            case "editor-read": 
                if (isChecked)
                    permissions.push(Permission.READ);
                else permissions = permissions.filter((v: number) => v !== Permission.READ);
                break;
            case "editor-write":
                if (isChecked)
                    permissions.push(Permission.WRITE);
                else permissions = permissions.filter((v: number) => v !== Permission.WRITE);
                break;
            case "editor-delete":
                if (isChecked)
                    permissions.push(Permission.DELETE);
                else permissions = permissions.filter((v: number) => v !== Permission.DELETE);
                break;
            case "editor-audit":
                if (isChecked)
                    permissions.push(Permission.AUDIT);
                else permissions = permissions.filter((v: number) => v !== Permission.AUDIT);
                break;
            case "editor-manage-users":
                if (isChecked)
                    permissions.push(Permission.MANAGE_USERS);
                else permissions = permissions.filter((v: number) => v !== Permission.MANAGE_USERS);
                break;
            case "editor-administrative":
                if (isChecked)
                    permissions.push(Permission.ADMINISTRATIVE);
                else permissions = permissions.filter((v: number) => v !== Permission.ADMINISTRATIVE);
                break;
        }
        props.onPermissionsChanged(permissions);
    }

    return (
        <Dialog
            fullScreen={isMobile}
            fullWidth={true}
            maxWidth={isMobile ? "xs" : "md"}
            open={props.isOpen}
            onClose={() => props.onCancel()}>
            <DialogTitle>{t("user_details")}</DialogTitle>
            <DialogContent dividers={true}>
                <Container>
                    <Grid container direction={isMobile ? "column" : "row"} alignItems="stretch" justifyContent="center" spacing={isMobile ? 0 : 4}>
                        <Grid item xs={6} className={classes.gridItem}>
                            <TextField
                                autoFocus
                                id="editor-user-last-name"
                                type="text"
                                label={ t("field.last_name") }
                                value={props.lastName}
                                className={classes.textField}
                                error={lastNameError}
                                helperText={lastNameError ? t("feedback.empty_last_name") : undefined}
                                onChange={onLastNameChanged}/>

                            <TextField
                                id="editor-user-first-name"
                                type="text"
                                label={ t("field.first_name") }
                                value={props.firstName}
                                className={classes.textField}
                                error={firstNameError}
                                helperText={firstNameError ? t("feedback.empty_first_name") : undefined}
                                onChange={onFirstNameChanged}/>

                            <TextField
                                id="editor-user-email"
                                type="text"
                                label={ t("field.email") }
                                value={props.email}
                                className={classes.textField}
                                error={emailError}
                                helperText={emailError ? t("feedback.empty_email_address") : undefined}
                                onChange={onEmailAddressChanged} />

                            <TextField
                                id="editor-user-position"
                                type="text"
                                label={ t("field.position") }
                                value={props.position}
                                className={classes.textField}
                                error={positionError}
                                helperText={positionError ? t("feedback.empty_position") : undefined}
                                onChange={onPositionChanged} />

                            <FormControl component="fieldset" className={classes.textField}>
                                <FormLabel component="legend">
                                    <Typography variant="body2">{ t("field.department") }</Typography>
                                </FormLabel>
                                <ListItem button onClick={props.onDepartmentSelect}>
                                    <Typography variant="body2">
                                        { props.department?.name !== undefined ? props.department?.name : t("not_set")  }
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
                                            checked={hasPermission(props.permissions, Permission.READ)} 
                                            onChange={onPermissionsChanged}
                                            name="editor-read"/>
                                    }/>
                                <FormControlLabel
                                    label={t("permission.write")}
                                    control={
                                        <Checkbox 
                                            checked={hasPermission(props.permissions, Permission.WRITE)} 
                                            onChange={onPermissionsChanged}
                                            name="editor-write"/>
                                    }/>
                                <FormControlLabel
                                    label={t("permission.delete")}
                                    control={
                                        <Checkbox 
                                            checked={hasPermission(props.permissions, Permission.DELETE)} 
                                            onChange={onPermissionsChanged}
                                            name="editor-delete"/>
                                    }/>
                                <FormControlLabel
                                    label={t("permission.audit")}
                                    control={
                                        <Checkbox 
                                            checked={hasPermission(props.permissions, Permission.AUDIT)} 
                                            onChange={onPermissionsChanged}
                                            name="editor-audit"/>
                                    }/>
                                <FormControlLabel
                                    label={t("permission.manage_users")}
                                    control={
                                        <Checkbox 
                                            checked={hasPermission(props.permissions, Permission.MANAGE_USERS)} 
                                            onChange={onPermissionsChanged}
                                            name="editor-manage-users"/>
                                    }/>
                                <FormControlLabel
                                    label={t("permission.administrative")}
                                    control={
                                        <Checkbox 
                                            checked={hasPermission(props.permissions, Permission.ADMINISTRATIVE)} 
                                            onChange={onPermissionsChanged}
                                            name="editor-administrative"/>
                                    }/>
                                <FormHelperText>{t("info.user_editor_admin_permission")}</FormHelperText>
                            </FormGroup>
                        </FormControl>
                        </Grid>
                    </Grid>
                </Container>
            </DialogContent>

            <DialogActions>
                <Button color="primary" onClick={props.onCancel}>{ t("cancel") }</Button>
                <Button color="primary" onClick={onPreSubmit}>{ t("save") }</Button>
            </DialogActions>
        </Dialog>
    );
}

export default UserEditor;