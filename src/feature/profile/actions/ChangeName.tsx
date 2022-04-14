import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, TextField, } from "@mui/material";
import { useSnackbar } from "notistack";
import { useAuthState } from "../../auth/AuthProvider";
import { updateDoc, doc } from "firebase/firestore";
import { firestore } from "../../../index";
import { userCollection } from "../../../shared/const";

type FormData = {
  firstName: string,
  lastName: string
}

type ChangeNamePromptProps = {
  isOpen: boolean,
  onDismiss: () => void
}

const ChangeNamePrompt = (props: ChangeNamePromptProps) => {
  const { t } = useTranslation();
  const { user } = useAuthState();
  const { enqueueSnackbar } = useSnackbar();
  const [hasBackgroundWork, setHasBackgroundWork] = useState(false);
  const { handleSubmit, formState: { errors }, control, reset } = useForm<FormData>();

  useEffect(() => {
    if (props.isOpen) {
      reset({
        lastName: user?.lastName,
        firstName: user?.firstName,
      })
    }
  }, [props.isOpen, user, reset])

  const onSubmit = async (data: FormData) => {
    if (!user || !user.userId)
      return;

    setHasBackgroundWork(true);
    await updateDoc(doc(firestore, userCollection, user.userId), data)

    enqueueSnackbar(t('feedback.name_changed'));
    setHasBackgroundWork(false);
    props.onDismiss();
  }

  return (
    <Dialog
      open={props.isOpen}
      fullWidth={true}
      maxWidth="xs"
      onClose={props.onDismiss}>
      <DialogTitle>{t("action.change_name")}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Container disableGutters>
            <Controller
              name="firstName"
              control={control}
              render={({ field: { ref, ...inputProps }}) => (
                <TextField
                  {...inputProps}
                  autoFocus
                  type="text"
                  inputRef={ref}
                  label={t("field.first_name")}
                  error={errors.firstName !== undefined}
                  helperText={errors.firstName?.message && t(errors.firstName.message)}
                  disabled={hasBackgroundWork}/>
              )}
              rules={{ required: { value: true, message: "feedback.empty_first_name" }}}/>
            <Controller
              name="lastName"
              control={control}
              render={({ field: { ref, ...inputProps }}) => (
                <TextField
                  {...inputProps}
                  autoFocus
                  type="text"
                  inputRef={ref}
                  label={t("field.last_name")}
                  error={errors.lastName !== undefined}
                  helperText={errors.lastName?.message && t(errors.lastName.message)}
                  disabled={hasBackgroundWork}/>
              )}
              rules={{ required: { value: true, message: "feedback.empty_lirst_name" }}}/>
          </Container>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            disabled={hasBackgroundWork}
            onClick={props.onDismiss}>
            {t("button.cancel")}
          </Button>
          <Button
            color="primary"
            type="submit"
            disabled={hasBackgroundWork}>
            {hasBackgroundWork ? t("feedback.saving") : t("button.continue")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default ChangeNamePrompt;