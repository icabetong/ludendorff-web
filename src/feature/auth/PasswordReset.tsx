import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

type PasswordResetProps = {
  isOpen: boolean,
  email?: string,
  working: boolean,
  onSubmit: (email: string) => void,
  onDismiss: () => void
}

type FormValues = {
  email: string
}
const PasswordReset = (props: PasswordResetProps) => {
  const { t } = useTranslation();
  const { handleSubmit, formState: { errors }, setValue, control } = useForm<FormValues>();

  useEffect(() => {
    if (props.isOpen)
      setValue("email", props.email ? props.email : "");
  }, [props.isOpen, props.email, setValue]);

  const onSubmit = (data: FormValues) => {
    props.onSubmit(data.email);
  }

  return (
    <Dialog open={props.isOpen} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{t("dialog.send_reset_link_title")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("dialog.send_reset_link_message")}</DialogContentText>
          <Box sx={{ marginTop: 2 }}>
            <Controller
              name="email"
              control={control}
              render={({ field: { ref, ...inputProps }}) => (
                <TextField
                  {...inputProps}
                  type="email"
                  inputRef={ref}
                  label={t("field.email")}
                  error={errors.email !== undefined}
                  disabled={props.working}
                  helperText={errors.email?.message !== undefined ? t(errors.email.message) : undefined}/>
              )}
              rules={{ required: { value: true, message: "feedback.empty_email_address"}}}/>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onDismiss} disabled={props.working}>{t("button.cancel")}</Button>
          <LoadingButton type="submit" loading={props.working}>{t("button.send")}</LoadingButton>
        </DialogActions>
        </form>
    </Dialog>
  );
}

export default PasswordReset;