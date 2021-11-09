import { useState, useReducer } from "react";
import { useTranslation } from "react-i18next";
import {
    Box,
    Hidden,
    LinearProgress,
    MenuItem,
    makeStyles
} from "@material-ui/core";
import { 
    DataGrid, 
    GridOverlay, 
    GridRowParams, 
    GridValueGetterParams, 
    GridCellParams 
} from "@material-ui/data-grid";
import { useSnackbar } from "notistack";
import { 
    PlusIcon, 
    IdentificationIcon, 
    TrashIcon 
} from "@heroicons/react/outline";
import { jsPDF } from "jspdf";

import ComponentHeader from "../../components/ComponentHeader";
import GridLinearProgress from "../../components/GridLinearProgress";
import GridToolbar from "../../components/GridToolbar";
import PaginationController from "../../components/PaginationController";
import EmptyStateComponent from "../state/EmptyStates";
import HeroIconButton from "../../components/HeroIconButton";
import { ErrorNoPermissionState } from "../state/ErrorStates";

import { usePermissions } from "../auth/AuthProvider";
import { Assignment, AssignmentRepository } from "./Assignment";
import AssignmentList from "./AssignmentList";
import RequestScreen from "../requests/RequestScreen"; 
import { usePreferences } from "../settings/Preference";

import { firestore } from "../../index";
import { usePagination } from "../../shared/pagination";
import { formatDate } from "../../shared/utils";

import {
    assignmentCollection,
    assignmentId,
    assignmentAsset,
    assignmentAssetName,
    assignmentUser,
    dateAssigned,
    dateReturned,
    location
} from "../../shared/const";

import AssignmentEditor from './AssignmentEditor';
import AssignmentSearchScreen from "./AssignmentSearchScreen";
import { ActionType, initialState, reducer } from "./AssignmentEditorReducer";
import ConfirmationDialog from "../shared/ConfirmationDialog";

const useStyles = makeStyles(() => ({
    root: {
        width: '100%', height: '100%'
    },
    wrapper: {
        height: '80%',
        padding: '1.4em'
    }
}))

type AssignmentScreenProps = {
    onDrawerToggle: () => void
}

const AssignmentScreen = (props: AssignmentScreenProps) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const { isAdmin } = usePermissions();
    const preferences = usePreferences();
    const { enqueueSnackbar } = useSnackbar(); 

    const columns = [
        { field: assignmentId, headerName: t("field.id"), hide: true },
        { 
            field: assignmentAsset, 
            headerName: t("field.name"), 
            flex: 1,
            valueGetter: (params: GridValueGetterParams) => 
                params.row.asset.assetName
        },
        { 
            field: assignmentUser, 
            headerName: t("field.user"), 
            flex: 1,
            valueGetter: (params: GridValueGetterParams) =>
                params.row.user.name
        },
        { 
            field: dateAssigned, 
            headerName: t("field.date_assigned"), 
            flex: 1,
            valueGetter: (params: GridValueGetterParams) => t(formatDate(params.row.dateAssigned))
        },
        { 
            field: dateReturned, 
            headerName: t("field.date_returned"), 
            flex: 1,
            valueGetter: (params: GridValueGetterParams) => {
                const formatted = formatDate(params.row.dateReturned);
                return formatted === 'unknown' ? t("not_yet_returned") : formatted;
            }
        },
        { 
            field: location,
            headerName: t("field.location"),
            flex: 1
        },
        {
            field: "delete",
            headerName: t("button.delete"),
            flex: 0.4,
            disableColumnMenu: true,
            sortable: false,
            renderCell: (params: GridCellParams) => {
                return (
                    <HeroIconButton
                        icon={TrashIcon}
                        aria-label={t("button.delete")}
                        onClick={() => onRemoveInvoke(params.row as Assignment)}/>
                )
            }
        }
    ];

    const {
        items: assignments,
        isLoading: isAssignmentsLoading,
        isStart: atAssignmentStart,
        isEnd: atAssignmentEnd,
        getPrev: getPreviousAssignments,
        getNext: getNextAssignments
    } = usePagination<Assignment>(
        firestore
            .collection(assignmentCollection)
            .orderBy(assignmentAssetName, "asc"), { limit: 15 }
    );

    const [editorState, editorDispatch] = useReducer(reducer, initialState);
    const [assignment, setAssignment] = useState<Assignment | undefined>(undefined);

    const onRemoveInvoke = (assignment: Assignment) => setAssignment(assignment);
    const onRemoveDismiss = () => setAssignment(undefined);

    const onRemoveAssignment = () => {
        if (assignment !== undefined) {
            AssignmentRepository.remove(assignment)
                .then(() => enqueueSnackbar(t("feedback.assignment_removed")))
                .catch(() => enqueueSnackbar(t("feedback.assignment_remove_error")))
                .finally(onRemoveDismiss)
        }
    }

    const onDataGridRowDoubleClicked = (params: GridRowParams) => onAssignmentSelected(params.row as Assignment);
    
    const onAssignmentEditorView = () => editorDispatch({ type: ActionType.CREATE })
    const onAssignmentEditorDismiss = () => editorDispatch({ type: ActionType.DISMISS })

    const onAssignmentSelected = (assignment: Assignment) => {
        editorDispatch({
            type: ActionType.UPDATE,
            payload: assignment
        })
    }

    const [search, setSearch] = useState(false);
    const onSearchInvoke = () => setSearch(true)
    const onSearchDismiss = () => setSearch(false)

    const [isRequestListOpen, setRequestListOpen] = useState(false);
    const onRequestListView = () => setRequestListOpen(true)
    const onRequestListDismiss = () => setRequestListOpen(false)

    const onTest = () => {
        const doc = new jsPDF('p', 'px', 'letter');
        doc.text('Information', 10, 10);

        const frameworks = [
            {name: 'react', author: 'facebook', platform: 'web'},
            {name: 'svelte', author: 'inde', platform: 'web'},
            {name: 'android', author: 'google', platform: 'android'}
        ]
        doc.table(10, 20, frameworks, ['name', 'author', 'platform'], { autoSize: true })
        doc.save();
    }
    
    return (
        <Box className={classes.root}>
            <ComponentHeader 
                title={ t("navigation.assignments") }
                buttonText={isAdmin ? t("add") : undefined }
                buttonIcon={PlusIcon}
                buttonOnClick={onAssignmentEditorView}
                onSearch={onSearchInvoke}
                onDrawerToggle={props.onDrawerToggle}
                menuItems={[
                    <MenuItem key={0} onClick={onRequestListView}>{t("navigation.requests")}</MenuItem>,
                    <MenuItem key={1} onClick={onTest}>Generate Report</MenuItem>
                ]}
            />
            { isAdmin
                ? <>
                    <Hidden xsDown>
                        <div className={classes.wrapper}>
                            <DataGrid
                                components={{
                                    LoadingOverlay: GridLinearProgress,
                                    NoRowsOverlay: EmptyStateOverlay,
                                    Toolbar: GridToolbar
                                }}
                                rows={assignments}
                                columns={columns}
                                density={preferences.density}
                                pageSize={15}
                                loading={isAssignmentsLoading}
                                paginationMode="server"
                                getRowId={(r) => r.assignmentId}
                                onRowDoubleClick={onDataGridRowDoubleClicked}
                                hideFooter/>
                        </div>
                    </Hidden>
                    <Hidden smUp>
                        { !isAssignmentsLoading 
                            ? assignments.length < 1
                                ? <AssignmentEmptyState/>
                                : <AssignmentList assignments={assignments} onItemSelect={onAssignmentSelected}/>
                            : <LinearProgress/>
                        }
                    </Hidden>
                    { !atAssignmentStart && !atAssignmentEnd &&
                        <PaginationController
                            hasPrevious={atAssignmentStart}
                            hasNext={atAssignmentEnd}
                            getPrevious={getPreviousAssignments}
                            getNext={getNextAssignments}/>
                    }
                </>
                : <ErrorNoPermissionState/>
            }
            { editorState.isOpen &&
                <AssignmentEditor
                    isOpen={editorState.isOpen}
                    isCreate={editorState.isCreate}
                    assignment={editorState.assignment}
                    onCancel={onAssignmentEditorDismiss}/>
            }
            { search &&
                <AssignmentSearchScreen
                    isOpen={search}
                    onDismiss={onSearchDismiss}
                    onEditorInvoke={onAssignmentSelected}/>
            }
            { assignment &&
                <ConfirmationDialog
                    isOpen={assignment !== undefined}
                    title="dialog.assignment_remove"
                    summary="dialog.assignment_remove_summary"
                    onDismiss={onRemoveDismiss}
                    onConfirm={onRemoveAssignment}/>
            }
            <RequestScreen
                isOpen={isRequestListOpen}
                onDismiss={onRequestListDismiss}/>
        </Box>
    )
}

const EmptyStateOverlay = () => {
    return (
        <GridOverlay>
            <AssignmentEmptyState/>
        </GridOverlay>
    );
}

const AssignmentEmptyState = () => {
    const { t } = useTranslation();

    return (
        <EmptyStateComponent
            icon={IdentificationIcon}
            title={ t("empty_assignment") }
            subtitle={ t("empty_assignment_summary") }/>
    );
}

export default AssignmentScreen;