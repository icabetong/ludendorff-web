import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { reauthenticateWithCredential, updatePassword, EmailAuthProvider } from "firebase/auth";
import { updateDoc, doc } from "firebase/firestore";
import { auth, firestore } from "../../index";
import { userCollection } from "../../shared/const";

type FormData = {
  current: string,
  new: string,
  confirm: string,
}

type FinishAccountDialogProps = {
  isOpen: boolean
}
const FinishAccountDialog = (props: FinishAccountDialogProps) => {
  const { t } = useTranslation();
  const [hasBackgroundWork, setBackgroundWork] = useState(false);
  const { handleSubmit, formState: { errors }, control, getValues } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setBackgroundWork(true);
    const user = auth.currentUser;
    if (!user || !user?.email)
      return;

    let credential = EmailAuthProvider.credential(user?.email, data.current);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, data.new);
    await updateDoc(doc(firestore, userCollection, user.uid), { setupCompleted: true });

    setBackgroundWork(false);
  }

  return (
    <Dialog open={props.isOpen} maxWidth="sm">
      <DialogTitle>{t("dialog.finish_account_setup")}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t("dialog.finish_account_setup_summary")}</DialogContentText>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ my: 4 }}>
          <Controller
            name="current"
            control={control}
            render={({ field: { ref, ...inputProps } }) => (
              <TextField
                {...inputProps}
                autoFocus
                type="password"
                inputRef={ref}
                disabled={hasBackgroundWork}
                label={t("field.current_password")}
                error={errors.current !== undefined}
                helperText={errors.current?.message && t(errors.current.message)}/>
            )}
            rules={{ required: { value: true, message: "feedback.empty_current_password" } }}/>
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
          <LoadingButton
            sx={{ mt: 2, width: '100%' }}
            type="submit"
            size="large"
            variant="contained"
            loading={hasBackgroundWork}>
            {t("button.continue")}
          </LoadingButton>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default FinishAccountDialog;