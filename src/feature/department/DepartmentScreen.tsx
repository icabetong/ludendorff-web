import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";

import { Department } from "./Department";
import DepartmentList from "./DepartmentList";

type DepartmentScreenProps = {
    isOpen: boolean,
    departments: Department[],
    isLoading: boolean,
    hasPrevious: boolean,
    hasNext: boolean,
    onPrevious: () => void,
    onNext: () => void,
    onDismiss: () => void,
    onAddItem: () => void,
    onSelectItem: (department: Department) => void,
    onDeleteItem: (department: Department) => void
}

const DepartmentScreen = (props: DepartmentScreenProps) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

    return (
        <Dialog
            fullScreen={isMobile}
            fullWidth={true}
            maxWidth="xs"
            open={props.isOpen}
            onClose={() => props.onDismiss() }>
            <DialogTitle>{ t("departments") }</DialogTitle>
            <DialogContent dividers={true}>
                <DepartmentList
                    departments={props.departments}
                    hasPrevious={props.hasPrevious}
                    hasNext={props.hasNext}
                    onPrevious={props.onPrevious}
                    onNext={props.onNext}
                    onItemSelect={props.onSelectItem}
                    onItemRemove={props.onDeleteItem}/>
            </DialogContent>
            <DialogActions>
            <Button color="primary" onClick={() => props.onAddItem()}>{ t("add") }</Button>
                <div style={{flex: '1 0 0'}}></div>
                <Button color="primary" onClick={() => props.onDismiss()}>{ t("close") }</Button>
            </DialogActions>
        </Dialog>
    )
}

export default DepartmentScreen;