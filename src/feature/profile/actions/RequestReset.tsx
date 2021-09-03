import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

type RequestResetPromptProps = {
    isOpen: boolean,
    onDismiss: () => void,
    onSubmit: () => void,
}

const RequestResetPrompt = (props: RequestResetPromptProps) => {
    const { t } = useTranslation();

    return (
        <Dialog
            open={props.isOpen}
            fullWidth={true}
            maxWidth="xs"
            onClose={props.onDismiss}>
            <DialogTitle>{t("dialog.send_reset_link_title")}</DialogTitle>
            <DialogContent>
                <DialogContentText>{t("dialog.send_reset_link_message")}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={props.onDismiss}>{t("button.cancel")}</Button>
                <Button color="primary" onClick={props.onSubmit}>{t("button.continue")}</Button>
            </DialogActions>
        </Dialog>
    );
}

export default RequestResetPrompt;