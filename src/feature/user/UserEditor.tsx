import React from "react";
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
import FormGroup from "@material-ui/core/FormGroup";
import FormLabel from "@material-ui/core/FormLabel";
import Grid from "@material-ui/core/Grid";
import ListItem from "@material-ui/core/ListItem";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles, useTheme } from "@material-ui/core/styles";

import { User, Permission } from "./User";
import { DepartmentCore } from "../department/Department";

const useStyles = makeStyles((theme) => ({
    textField: {
        width: '100%',
        margin: '0.6em 0'
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
    permissions: number,
    position?: string,
    department?: DepartmentCore,
    onCancel: () => void,
    onSubmit: (user: User) => void,
    onLastNameChanged: (lastName: string) => void,
    onFirstNameChanged: (firstName: string) => void,
    onEmailChanged: (email: string) => void,
    onPermissionsChanged: (permissions: number) => void,
    onPositionChanged: (position: string) => void
}

const UserEditor = (props: UserEditorProps) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

    const onPreSubmit = () => {}

    const onPermissionsChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        let permissions = props.permissions;
        switch(event.target.name) {
            case "editor-read": 
                if (isChecked)
                    permissions += Permission.READ;
                else permissions -= Permission.READ;
                break;
            case "editor-write":
                if (isChecked)
                    permissions += Permission.WRITE;
                else permissions -= Permission.WRITE;
                break;
            case "editor-delete":
                if (isChecked)
                    permissions += Permission.DELETE;
                else permissions -= Permission.DELETE;
                break;
            case "editor-audit":
                if (isChecked)
                    permissions += Permission.AUDIT;
                else permissions -= Permission.AUDIT;
                break;
            case "editor-manage-users":
                if (isChecked)
                    permissions += Permission.MANAGE_USERS;
                else permissions -= Permission.MANAGE_USERS;
                break;
            case "editor-administrative":
                if (isChecked)
                    permissions += Permission.ADMINISTRATIVE;
                else permissions -= Permission.ADMINISTRATIVE;
                break;
        }
        props.onPermissionsChanged(permissions);
    }

    const hasPermission = (permission: number): boolean => {
        let result = props.permissions & permission;
        return result === permission;
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
                <Container disableGutters>
                    <Grid container direction={isMobile ? "column" : "row"} alignItems="stretch" justifyContent="center" spacing={isMobile ? 0 : 4}>
                        <Grid item xs={6} className={classes.gridItem}>
                            <TextField
                                autoFocus
                                id="editor-user-last-name"
                                type="text"
                                label={ t("last_name") }
                                value={props.lastName}
                                className={classes.textField}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                    props.onLastNameChanged(e.target.value)
                                } />

                            <TextField
                                id="editor-user-first-name"
                                type="text"
                                label={ t("first_name") }
                                value={props.firstName}
                                className={classes.textField}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                    props.onFirstNameChanged(e.target.value)
                                } />

                            <TextField
                                id="editor-user-email"
                                type="text"
                                label={ t("email") }
                                value={props.email}
                                className={classes.textField}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                    props.onEmailChanged(e.target.value)
                                } />

                            <TextField
                                id="editor-user-position"
                                type="text"
                                label={ t("position") }
                                value={props.position}
                                className={classes.textField}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                    props.onPositionChanged(e.target.value)
                                } />

                            <FormControl component="fieldset" className={classes.textField}>
                                <FormLabel component="legend">
                                    <Typography variant="body2">{ t("department") }</Typography>
                                </FormLabel>
                                <ListItem button>
                                    <Typography variant="body2">
                                        { props.department?.name !== undefined ? props.department?.name : t("not_set")  }
                                    </Typography>
                                </ListItem>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} className={classes.gridItem}>
                            <FormControl component="fieldset" className={classes.textField}>
                            <FormLabel component="legend">
                                <Typography variant="body2">{ t("permissions") }</Typography>
                            </FormLabel>
                            <FormGroup>
                                <FormControlLabel
                                    label={t("permission_read")}
                                    control={
                                        <Checkbox 
                                            checked={hasPermission(Permission.READ)} 
                                            onChange={onPermissionsChanged}
                                            name="editor-read"/>
                                    }/>
                                <FormControlLabel
                                    label={t("permission_write")}
                                    control={
                                        <Checkbox 
                                            checked={hasPermission(Permission.WRITE)} 
                                            onChange={onPermissionsChanged}
                                            name="editor-write"/>
                                    }/>
                                <FormControlLabel
                                    label={t("permission_delete")}
                                    control={
                                        <Checkbox 
                                            checked={hasPermission(Permission.DELETE)} 
                                            onChange={onPermissionsChanged}
                                            name="editor-delete"/>
                                    }/>
                                <FormControlLabel
                                    label={t("permission_audit")}
                                    control={
                                        <Checkbox 
                                            checked={hasPermission(Permission.AUDIT)} 
                                            onChange={onPermissionsChanged}
                                            name="editor-audit"/>
                                    }/>
                                <FormControlLabel
                                    label={t("permission_manage_users")}
                                    control={
                                        <Checkbox 
                                            checked={hasPermission(Permission.MANAGE_USERS)} 
                                            onChange={onPermissionsChanged}
                                            name="editor-manage-users"/>
                                    }/>
                                <FormControlLabel
                                    label={t("permission_administrative")}
                                    control={
                                        <Checkbox 
                                            checked={hasPermission(Permission.ADMINISTRATIVE)} 
                                            onChange={onPermissionsChanged}
                                            name="editor-administrative"/>
                                    }/>
                            </FormGroup>
                        </FormControl>
                        </Grid>
                    </Grid>
                </Container>
            </DialogContent>

            <DialogActions>
                <Button color="primary" onClick={() => props.onCancel()}>{ t("cancel") }</Button>
                <Button color="primary" onClick={() => onPreSubmit()}>{ t("save") }</Button>
            </DialogActions>
        </Dialog>
    );
}

export default UserEditor;