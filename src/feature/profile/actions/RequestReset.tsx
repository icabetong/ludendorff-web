import { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";

import { useAuthState } from "../../auth/AuthProvider";

const useStyles = makeStyles(() => ({
    textField: {
        margin: '0.6em 0',
        width: '100%'
    }
}))

type RequestResetPromptProps = {
    isOpen: boolean,
    email: string
    onDismiss: () => void,
    onSubmit: () => void,
    onEmailChanged: (email: string) => void
}

const RequestResetPrompt = (props: RequestResetPromptProps) => {
    const { t } = useTranslation();
    const { user } = useAuthState();
    const classes = useStyles();

    const [emailError, setEmailError] = useState(false);
    const [emailChanged, setEmailChanged] = useState(false);

    const email = user !== undefined ? user.email : '';

    const onEmailChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!emailChanged)
            setEmailChanged(true)

        const email = event.target.value;
        if (email !== '' && emailError)
            setEmailError(false);

        props.onEmailChanged(email);
    }

    const onPreDismiss = () => {
        setEmailChanged(false);
        props.onDismiss();
    }

    const onPreSubmit = () => {
        if (props.email === '') {
            setEmailError(true);
            return;
        }
    }

    return (
        <Dialog
            open={props.isOpen}
            fullWidth={true}
            maxWidth="xs"
            onClose={onPreDismiss}>
            <DialogTitle>{t("dialog.send_reset_link_title")}</DialogTitle>
            <DialogContent>
                <DialogContentText>{t("dialog.send_reset_link_message")}</DialogContentText>
                <Container disableGutters>
                    <TextField
                        autoFocus
                        id="request-reset-email"
                        type="text"
                        value={emailChanged ? props.email: email}
                        label={t("field.email")}
                        error={emailError}
                        helperText={emailError ? t("feedback.empty_email_address") : undefined}
                        onChange={onEmailChanged}
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

export default RequestResetPrompt;