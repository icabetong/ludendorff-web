import { useReducer } from "react";
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

import DepartmentEditor from "./DepartmentEditor";
import {
    DepartmentEditorActionType,
    departmentEditorInitialState,
    departmentEditorReducer
} from "./DepartmentEditorReducer";

const useStyles = makeStyles(() => ({
    root: {
        minHeight: '60vh',
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
    onSelectItem: (department: Department) => void
}

const DepartmentScreen = (props: DepartmentScreenProps) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
    const classes = useStyles();
    const { canRead, canWrite } = usePermissions();
    const [state, dispatch] = useReducer(departmentEditorReducer, departmentEditorInitialState);
    
    const onEditorCreate = () => dispatch({ type: DepartmentEditorActionType.CREATE })
    const onEditorDismiss = () => dispatch({ type: DepartmentEditorActionType.DISMISS })
    const onEditorUpdate = (department: Department) => dispatch({
        type: DepartmentEditorActionType.UPDATE,
        payload: department
    })

    return (
        <>
            <Dialog
                fullScreen={isMobile}
                fullWidth={true}
                maxWidth="xs"
                open={props.isOpen}
                onClose={props.onDismiss}>
                <DialogTitle>{ t("navigation.departments") }</DialogTitle>
                <DialogContent dividers={true} className={classes.root}>
                    { canRead
                        ? !props.isLoading
                            ? <DepartmentList
                                departments={props.departments}
                                hasPrevious={props.hasPrevious}
                                hasNext={props.hasNext}
                                onPrevious={props.onPrevious}
                                onNext={props.onNext}
                                onItemSelect={onEditorUpdate}/>
                            : <LinearProgress/>
                        : <ErrorNoPermissionState/>
                    }
                </DialogContent>
                <DialogActions>
                <Button color="primary" onClick={onEditorCreate} disabled={!canWrite}>{ t("button.add") }</Button>
                    <div style={{flex: '1 0 0'}}></div>
                    <Button color="primary" onClick={props.onDismiss}>{ t("button.close") }</Button>
                </DialogActions>
            </Dialog>
            { state.isOpen &&
                <DepartmentEditor
                    isOpen={state.isOpen}
                    isCreate={state.isCreate}
                    department={state.department}
                    onDismiss={onEditorDismiss}/>
            }
        </>
    )
}

export default DepartmentScreen;