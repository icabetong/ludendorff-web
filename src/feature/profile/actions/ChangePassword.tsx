import React from "react";
import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
    textField: {
        margin: '0.6em 0',
        width: '100%'
    }
}));

type ChangePasswordPromptProps = {
    isOpen: boolean,
    oldPassword?: string,
    newPassword?: string,
    confirmationPassword?: string,
    onDismiss: () => void,
    onSubmit: () => void,
    onOldPasswordChanged: (oldPassword: string) => void,
    onNewPasswordChanged: (newPassword: string) => void,
    onConfirmationPasswordChanged: (confirmationPassword: string) => void 
}

const ChangePasswordPrompt = (props: ChangePasswordPromptProps) => {
    const { t } = useTranslation();
    const classes = useStyles();

    const onOldPasswordChanged = (event: React.ChangeEvent<HTMLInputElement>) => {

    }

    const onNewPasswordChanged = (event: React.ChangeEvent<HTMLInputElement>) => {

    }

    const onConfirmationPasswordChanged = (event: React.ChangeEvent<HTMLInputElement>) => {

    }

    const onPreDismiss = () => {
        props.onDismiss();
    }
    const onPreSubmit = () => {}

    return (
        <Dialog
            open={props.isOpen}
            fullWidth={true}
            maxWidth="xs"
            onClose={onPreDismiss}>
            <DialogTitle>{t("action.change_password")}</DialogTitle>
            <DialogContent>
                <Container disableGutters>
                    <TextField
                        autoFocus
                        id="change-password-old"
                        type="password"
                        label={t("field.old_password")}
                        value={props.oldPassword === undefined ? '' : props.oldPassword}
                        onChange={onOldPasswordChanged}
                        className={classes.textField}/>

                    <TextField
                        id="change-password-new"
                        type="password"
                        label={t("field.new_password")}
                        value={props.newPassword === undefined ? '' : props.newPassword}
                        onChange={onNewPasswordChanged}
                        className={classes.textField}/>

                    <TextField
                        id="change-password-confirm"
                        type="password"
                        label={t("field.confirmation_password")}
                        value={props.confirmationPassword === undefined ? '' : props.confirmationPassword}
                        onChange={onConfirmationPasswordChanged}
                        className={classes.textField}/>
                </Container>
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={onPreDismiss}>{t("button.cancel")}</Button>
                <Button color="primary" onClick={onPreSubmit}>{t("button.continue")}</Button>
            </DialogActions>
        </Dialog>
    );
}

export default ChangePasswordPrompt;