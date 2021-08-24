import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

type CategoryRemoveProps = {
    isOpen: boolean,
    onDismiss: () => void,
    onConfirm: () => void,
}

const CategoryRemove = (props: CategoryRemoveProps) => {
    const { t } = useTranslation();

    return (
        <Dialog
            maxWidth="xs"
            fullWidth={true}
            open={props.isOpen}
            onClose={() => props.onDismiss()}>
            <DialogTitle>{ t("confirm_category_remove") }</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    { t("confirm_category_remove_summary") }
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

export default CategoryRemove;