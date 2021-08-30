import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import LinearProgress from "@material-ui/core/LinearProgress";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme, makeStyles } from "@material-ui/core/styles";

import { usePermissions } from "../auth/AuthProvider";
import { Department } from "./Department";
import DepartmentList from "./DepartmentList";
import { ErrorNoPermissionState } from "../state/ErrorStates";

const useStyles = makeStyles(() => ({
    container: {
        paddingTop: 0,
        paddingBottom: 0,
        '& .MuiList-padding': {
            padding: 0
        }
    }
}));

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
    const classes = useStyles();
    const { canRead, canWrite } = usePermissions();

    return (
        <Dialog
            fullScreen={isMobile}
            fullWidth={true}
            maxWidth="xs"
            open={props.isOpen}
            onClose={props.onDismiss}>
            <DialogTitle>{ t("navigation.departments") }</DialogTitle>
            <DialogContent dividers={true} className={classes.container}>
                { props.isLoading && <LinearProgress/> }
                { canRead
                    ? <DepartmentList
                        departments={props.departments}
                        hasPrevious={props.hasPrevious}
                        hasNext={props.hasNext}
                        onPrevious={props.onPrevious}
                        onNext={props.onNext}
                        onItemSelect={props.onSelectItem}
                        onItemRemove={props.onDeleteItem}/>
                    : <ErrorNoPermissionState/>
                }
            </DialogContent>
            <DialogActions>
            <Button color="primary" onClick={props.onAddItem} disabled={!canWrite}>{ t("button.add") }</Button>
                <div style={{flex: '1 0 0'}}></div>
                <Button color="primary" onClick={props.onDismiss}>{ t("button.close") }</Button>
            </DialogActions>
        </Dialog>
    )
}

export default DepartmentScreen;