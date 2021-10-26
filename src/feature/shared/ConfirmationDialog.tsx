import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

type ConfirmationDialogProps = {
    isOpen: boolean,
    title: string,
    summary: string,
    positiveButtonText?: string,
    negativeButtonText?: string,
    onConfirm: () => void,
    onDismiss: () => void,
}

const ConfirmationDialog = (props: ConfirmationDialogProps) => {
    const { t } = useTranslation();
    const positiveButtonText = props.positiveButtonText === undefined ? "button.ok" : props.positiveButtonText;
    const negativeButtonText = props.negativeButtonText === undefined ? "button.cancel" : props.negativeButtonText;

    return (
        <Dialog
            maxWidth="xs"
            fullWidth={true}
            open={props.isOpen}
            onClose={() => props.onDismiss()}>
            <DialogTitle>{ t(props.title) }</DialogTitle>
            <DialogContent>
                <DialogContentText>{ t(props.summary) }</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button 
                    color="primary"
                    onClick={() => props.onDismiss()}>
                        { t(negativeButtonText) }
                </Button>
                <Button
                    color="primary"
                    onClick={() => props.onConfirm()}>
                        { t(positiveButtonText) }
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ConfirmationDialog;