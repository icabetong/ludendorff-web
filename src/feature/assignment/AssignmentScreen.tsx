import { useState, useReducer, lazy } from "react";
import { useTranslation } from "react-i18next";
import Box from "@material-ui/core/Box";
import Hidden from "@material-ui/core/Hidden";
import LinearProgress from "@material-ui/core/LinearProgress";
import MenuItem from "@material-ui/core/MenuItem";
import { DataGrid, GridOverlay, GridRowParams, GridValueGetterParams } from "@material-ui/data-grid";
import { makeStyles } from "@material-ui/core/styles";

import {
    PlusIcon,
    IdentificationIcon
} from "@heroicons/react/outline";

import ComponentHeader from "../../components/ComponentHeader";
import GridLinearProgress from "../../components/GridLinearProgress";
import GridToolbar from "../../components/GridToolbar";
import PaginationController from "../../components/PaginationController";
import EmptyStateComponent from "../state/EmptyStates";
import { ErrorNoPermissionState } from "../state/ErrorStates";

import { usePermissions } from "../auth/AuthProvider";
import { Assignment } from "./Assignment";
import AssignmentList from "./AssignmentList";
import { Request } from "../requests/Request";
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
    location,
    requestCollection,
    requestedAssetName
} from "../../shared/const";

import {
    AssignmentEditorActionType,
    assignmentEditorInitialState,
    assignmentEditorReducer
} from "./AssignmentEditorReducer";

const AssignmentEditor = lazy(() => import('./AssignmentEditor'));

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
            valueGetter: (params: GridValueGetterParams) => {
                const formatted = formatDate(params.row.dateAssigned);
                return formatted === 'unknown' ? t("not_yet_returned") : formatted;
            }                
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

    const [editorState, editorDispatch] = useReducer(assignmentEditorReducer, assignmentEditorInitialState);

    const onDataGridRowDoubleClicked = (params: GridRowParams) => {
        onAssignmentSelected(params.row as Assignment);
    }

    const onAssignmentEditorView = () => {
        editorDispatch({
            type: AssignmentEditorActionType.CREATE
        })
    }
    const onAssignmentEditorDismiss = () => {
        editorDispatch({
            type: AssignmentEditorActionType.DISMISS
        })
    }

    const onAssignmentSelected = (assignment: Assignment) => {
        editorDispatch({
            type: AssignmentEditorActionType.UPDATE,
            payload: assignment
        })
    }

    const {
        items: requests,
        isLoading: isRequestsLoading,
        isStart: atRequestStart,
        isEnd: atRequestEnd,
        getPrev: getPreviousRequests,
        getNext: getNextRequests
    } = usePagination<Request>(
        firestore
            .collection(requestCollection)
            .orderBy(requestedAssetName, "asc"), { limit: 15 }
    )

    const [isRequestListOpen, setRequestListOpen] = useState(false);

    const onRequestListView = () => { setRequestListOpen(true) }
    const onRequestListDismiss = () => { setRequestListOpen(false) }

    const onRequestItemSelected = (request: Request) => {}

    return (
        <Box className={classes.root}>
            <ComponentHeader 
                title={ t("navigation.assignments") }
                buttonText={isAdmin ? t("add") : undefined }
                buttonIcon={PlusIcon}
                buttonOnClick={onAssignmentEditorView}
                onDrawerToggle={props.onDrawerToggle}
                menuItems={[
                    <MenuItem key={0} onClick={onRequestListView}>{t("navigation.requests")}</MenuItem>
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

            <RequestScreen
                isOpen={isRequestListOpen}
                requests={requests}
                isLoading={isRequestsLoading}
                hasPrevious={atRequestStart}
                hasNext={atRequestEnd}
                onPreviousBatch={getPreviousRequests}
                onNextBatch={getNextRequests}
                onDismiss={onRequestListDismiss}
                onSelectItem={onRequestItemSelected}/>

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