import { useState } from "react";
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
} from "@material-ui/core";
import { useSnackbar } from "notistack";
import { useAuthState } from "../../auth/AuthProvider";
import { User, UserRepository } from "../../user/User";

type FormValues = {
  firstName: string,
  lastName: string
}

type ChangeNamePromptProps = {
  isOpen: boolean
  user: User | undefined,
  onDismiss: () => void
}

const ChangeNamePrompt = (props: ChangeNamePromptProps) => {
  const { t } = useTranslation();
  const { user } = useAuthState();
  const { enqueueSnackbar } = useSnackbar();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const onSubmit = (data: FormValues) => {
    if (props.user) {
      setSubmitting(true);
      let user: User = {
        ...props.user,
        firstName: data.firstName,
        lastName: data.lastName,
      }

      UserRepository.update(user)
        .then(() => enqueueSnackbar(t('feedback.name_changed')))
        .catch(() => enqueueSnackbar(t('feedback.name_change_error')))
        .finally(() => {
          setSubmitting(false);
          props.onDismiss();
        })
    }
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
            <TextField
              autoFocus
              id="firstname"
              type="text"
              defaultValue={user?.firstName}
              label={t("field.first_name")}
              error={errors.firstName !== undefined}
              helperText={errors.firstName?.message && t(errors.firstName.message)}
              disabled={submitting}
              {...register("firstName", { required: "feedback.empty_first_name" })} />

            <TextField
              id="lastname"
              type="text"
              defaultValue={user?.lastName}
              label={t("field.last_name")}
              error={errors.lastName !== undefined}
              helperText={errors.lastName?.message && t(errors.lastName.message)}
              disabled={submitting}
              {...register("lastName", { required: "feedback.empty_last_name" })} />
          </Container>
        </DialogContent>
        <DialogActions>
          <Button 
            color="primary" 
            disabled={submitting}
            onClick={props.onDismiss}>
            {t("button.cancel")}
          </Button>
          <Button 
            color="primary"
            type="submit"
            disabled={submitting}>
            {submitting ? t("feedback.saving") :t("button.continue")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default ChangeNamePrompt;