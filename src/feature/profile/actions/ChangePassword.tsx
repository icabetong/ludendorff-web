import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from "@material-ui/core";
import { useSnackbar } from "notistack";
import firebase from "firebase/app";
import { auth } from "../../../index";

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
    const { enqueueSnackbar } = useSnackbar();
    const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormValues>();

    const onSubmit = async (data: FormValues) => {
        const user = auth.currentUser;

        if (user?.email) {
            try {
                const credential = firebase.auth.EmailAuthProvider.credential(user?.email, data.oldPassword)
                await user.reauthenticateWithCredential(credential);

                await user.updatePassword(data.newPassword)

                enqueueSnackbar(t("feedback.changed_password_success"));
            } catch (error) {
                enqueueSnackbar(t("feedback.error_generic"));
            }
        }
    }

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
                            error={errors.oldPassword !== undefined}
                            label={t("field.old_password")}
                            {...register("oldPassword", { required: true })}/>

                        <TextField
                            id="new-password"
                            type="password"
                            label={t("field.new_password")}
                            error={errors.newPassword !== undefined}
                            {...register("newPassword", { required: true, validate: value => value === getValues('confirmPassword') })}/>

                        <TextField
                            id="confirm-password"
                            type="password"
                            error={errors.confirmPassword !== undefined}
                            label={t("field.confirmation_password")}
                            {...register("confirmPassword", { required: true, validate: value => value === getValues('newPassword') })}/>
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