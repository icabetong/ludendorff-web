import { useReducer } from "react";
import { useTranslation } from "react-i18next";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    LinearProgress,
    useMediaQuery,
    useTheme,
    makeStyles
} from "@material-ui/core";

import { Department } from "./Department";
import DepartmentEditor from "./DepartmentEditor";
import { ActionType, initialState, reducer } from "./DepartmentEditorReducer";
import DepartmentList from "./DepartmentList";
import { usePermissions } from "../auth/AuthProvider";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { departmentCollection, departmentName } from "../../shared/const";
import { usePagination } from "../../shared/pagination";
import { firestore } from "../../index";

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
    onDismiss: () => void
}

const DepartmentScreen = (props: DepartmentScreenProps) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
    const classes = useStyles();
    const { canRead, canWrite } = usePermissions();
    const [state, dispatch] = useReducer(reducer, initialState);
    
    const onEditorCreate = () => dispatch({ type: ActionType.CREATE })
    const onEditorDismiss = () => dispatch({ type: ActionType.DISMISS })
    const onEditorUpdate = (department: Department) => dispatch({
        type: ActionType.UPDATE,
        payload: department
    })

    const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Department>(
        firestore
            .collection(departmentCollection)
            .orderBy(departmentName, "asc"), { limit: 15 } 
    );

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
                        ? !isLoading
                            ? <DepartmentList
                                departments={items}
                                hasPrevious={isStart}
                                hasNext={isEnd}
                                onPrevious={getPrev}
                                onNext={getNext}
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