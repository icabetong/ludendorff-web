import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    makeStyles
} from "@material-ui/core";

const useStyles = makeStyles(() => ({
    textField: {
        margin: '0.6em 0',
        width: '100%'
    }
}));

type ChangePasswordPromptProps = {
    isOpen: boolean,
    onDismiss: () => void,
}

type FormValues = {
    oldPassword: string,
    newPassword: string,
    confirmPassword: string,
}
const ChangePasswordPrompt = (props: ChangePasswordPromptProps) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const { register, handleSubmit } = useForm<FormValues>();

    const onSubmit = (data: FormValues) => {}

    return (
        <Dialog
            open={props.isOpen}
            fullWidth={true}
            maxWidth="xs"
            onClose={props.onDismiss}>
            <DialogTitle>{t("action.change_password")}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Container disableGutters>
                        <TextField
                            autoFocus
                            id="old-password"
                            type="password"
                            label={t("field.old_password")}
                            className={classes.textField}
                            {...register("oldPassword", { required: true })}/>

                        <TextField
                            id="new-password"
                            type="password"
                            label={t("field.new_password")}
                            className={classes.textField}
                            {...register("newPassword", { required: true })}/>

                        <TextField
                            id="confirm-password"
                            type="password"
                            label={t("field.confirmation_password")}
                            className={classes.textField}
                            {...register("confirmPassword", { required: true })}/>
                    </Container>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={props.onDismiss}>{t("button.cancel")}</Button>
                    <Button color="primary" type="submit">{t("button.continue")}</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

export default ChangePasswordPrompt;