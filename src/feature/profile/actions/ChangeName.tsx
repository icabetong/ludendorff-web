import { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
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

type ChangeNamePromptProps = {
    isOpen: boolean,
    firstName: string,
    lastName: string,
    onDismiss: () => void,
    onSubmit: () => void,
    onFirstNameChanged: (firstName: string) => void,
    onLastNameChanged: (lastName: string) => void,
}

const ChangeNamePrompt = (props: ChangeNamePromptProps) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const { user } = useAuthState();

    const [firstNameError, setFirstNameError] = useState(false);
    const [lastNameError, setLastNameError] = useState(false);
    const [firstNameChanged, setFirstNameChanged] = useState(false);
    const [lastNameChanged, setLastNameChanged] = useState(false);

    const firstName = user !== undefined ? user.firstName : '';
    const lastName = user !== undefined ? user.lastName : '';

    const onFirstNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!firstNameChanged)
            setFirstNameChanged(true);
        
        const firstName = event.target.value;
        if (firstName !== '' && firstNameError)
            setFirstNameError(false);

        props.onFirstNameChanged(firstName);
    }
    const onLastNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!lastNameChanged)
            setLastNameChanged(true);

        const lastName = event.target.value;
        if (lastName !== '' && lastNameError)
            setLastNameError(false);

        props.onLastNameChanged(lastName);
    }

    const onPreDismiss = () => {
        setFirstNameChanged(false);
        setLastNameChanged(false);
        props.onDismiss();
    }

    const onPreSubmit = () => {
        if (props.firstName === '') {
            setFirstNameError(true);
            return;
        }

        if (props.lastName === '') {
            setLastNameError(true);
            return;
        }
    }

    return (
        <Dialog
            open={props.isOpen}
            fullWidth={true}
            maxWidth="xs"
            onClose={onPreDismiss}>
            <DialogTitle>{t("action.change_name")}</DialogTitle>
            <DialogContent>
                <Container disableGutters>
                    <TextField
                        autoFocus
                        id="change-name-firstname"
                        type="text"
                        value={firstNameChanged ? props.firstName : firstName}
                        label={t("field.first_name")}
                        error={firstNameError}
                        helperText={firstNameError ? t("feedback.empty_first_name") : undefined}
                        onChange={onFirstNameChanged}
                        className={classes.textField}/>
                        
                    <TextField
                        id="change-name-lastname"
                        type="text"
                        value={lastNameChanged ? props.lastName: lastName}
                        label={t("field.last_name")}
                        error={lastNameError}
                        helperText={lastNameError ? t("feedback.empty_last_name") : undefined}
                        onChange={onLastNameChanged}
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

export default ChangeNamePrompt;