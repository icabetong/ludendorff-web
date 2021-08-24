import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

type ItemRemoveDialogProps = {
    isOpen: boolean,
    title?: string,
    summary?: string
    onConfirm: () => void,
    onDismiss: () => void,
}

const ItemRemoveDialog = (props: ItemRemoveDialogProps) => {
    const { t } = useTranslation();
    const title = props.title !== undefined ? props.title : "confirm_generic_remove";
    const summary = props.summary !== undefined ? props.summary : "confirm_generic_remove_summary";

    return (
        <Dialog
            maxWidth="xs"
            fullWidth={true}
            open={props.isOpen}
            onClose={() => props.onDismiss()}>
            <DialogTitle>{ t(title) }</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    { t(summary) }
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button 
                    color="primary"
                    onClick={() => props.onDismiss()}>
                        { t("cancel") }
                </Button>
                <Button
                    color="primary"
                    onClick={() => props.onConfirm()}>
                        { t("delete") }
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ItemRemoveDialog;