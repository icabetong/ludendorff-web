import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import { useSnackbar } from "notistack";
import { sendPasswordResetEmail } from "firebase/auth";
import { useAuthState } from "../../auth/AuthProvider";
import { auth } from "../../../index";

type RequestResetPromptProps = {
  isOpen: boolean,
  onDismiss: () => void
}

const RequestResetPrompt = (props: RequestResetPromptProps) => {
  const { t } = useTranslation();
  const { user } = useAuthState();
  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = () => {
    if (user?.email !== undefined) {
      sendPasswordResetEmail(auth, user.email)
        .then(() => enqueueSnackbar(t("feedback.reset_link_set")))
        .catch(() => enqueueSnackbar(t("error.generic")))
        .finally(props.onDismiss)
    }
  }

  return (
    <Dialog
      open={ props.isOpen }
      fullWidth={ true }
      maxWidth="xs"
      onClose={ props.onDismiss }>
      <DialogTitle>{ t("dialog.send_reset_link_title") }</DialogTitle>
      <DialogContent>
        <DialogContentText>{ t("dialog.send_reset_link_message") }</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={ props.onDismiss }>{ t("button.cancel") }</Button>
        <Button color="primary" onClick={ onSubmit }>{ t("button.continue") }</Button>
      </DialogActions>
    </Dialog>
  );
}

export default RequestResetPrompt;