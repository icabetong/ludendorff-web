import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useSnackbar } from "notistack";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { auth } from "../../../index";
import { LoadingButton } from "@mui/lab";

type ChangePasswordPromptProps = {
  isOpen: boolean,
  onDismiss: () => void,
}

type FormData = {
  current: string,
  new: string,
  confirm: string,
}

const ChangePasswordPrompt = (props: ChangePasswordPromptProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [hasBackgroundWork, setBackgroundWork] = useState(false);
  const { handleSubmit, getValues, formState: { errors }, control } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setBackgroundWork(true);
    const user = auth.currentUser;
    if (!user || !user?.email)
      return;

    let credential = EmailAuthProvider.credential(user?.email, data.current)
    if (auth.currentUser) {
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, data.new);
    } else {
      throw Error("There are no user signed in");
    }

    enqueueSnackbar(t("feedback.changed_password_success"));
    setBackgroundWork(false);
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
            <Controller
              name="current"
              control={control}
              render={({ field: { ref, ...inputProps } }) => (
                <TextField
                  {...inputProps}
                  autoFocus
                  type="password"
                  disabled={hasBackgroundWork}
                  error={errors.current !== undefined}
                  label={t("field.current_password")}
                  helperText={errors.current?.message && t(errors.current?.message)}/>
              )}
              rules={{ required: { value: true, message: "feedback.empty_current_password" }}}/>
            <Controller
              name="new"
              control={control}
              render={({ field: { ref, ...inputProps } }) => (
                <TextField
                  {...inputProps}
                  type="password"
                  inputRef={ref}
                  disabled={hasBackgroundWork}
                  label={t("field.new_password")}
                  error={errors.new !== undefined}
                  helperText={errors.new?.message && t(errors.new.message)}/>
              )}
              rules={{
                required: { value: true, message: "feedback.empty_new_password" },
                validate: value => value === getValues('confirm')
              }}/>
            <Controller
              name="confirm"
              control={control}
              render={({ field: { ref, ...inputProps } }) => (
                <TextField
                  {...inputProps}
                  type="password"
                  inputRef={ref}
                  disabled={hasBackgroundWork}
                  label={t("field.confirm_password")}
                  error={errors.confirm !== undefined}
                  helperText={errors.confirm?.message && t(errors.confirm.message)}/>
              )}
              rules={{
                required: { value: true, message: "feedback.empty_confirm_password" },
                validate: value => value === getValues('new')
              }}/>
          </Container>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            disabled={hasBackgroundWork}
            onClick={props.onDismiss}>{t("button.cancel")}</Button>
          <LoadingButton
            type="submit"
            loading={hasBackgroundWork}>
            {t("button.continue")}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default ChangePasswordPrompt;