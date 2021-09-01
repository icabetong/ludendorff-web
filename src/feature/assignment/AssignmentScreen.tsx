import { useState, useReducer, lazy } from "react";
import { useTranslation } from "react-i18next";
import Box from "@material-ui/core/Box";
import Hidden from "@material-ui/core/Hidden";
import LinearProgress from "@material-ui/core/LinearProgress";
import { DataGrid, GridOverlay, GridValueGetterParams } from "@material-ui/data-grid";
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
import { Asset, minimize as minimizeAsset } from "../asset/Asset";
import { Assignment } from "./Assignment";
import AssignmentList from "./AssignmentList";
import { usePreferences } from "../settings/Preference";
import { User, minimize as minimizeUser } from "../user/User";

import { firestore } from "../../index";
import { usePagination } from "../../shared/pagination";
import { formatDate, newId } from "../../shared/utils";

import {
    assetCollection,
    assetName,
    userCollection,
    lastName,
    assignmentCollection,
    assignmentId,
    assignmentAsset,
    assignmentAssetName,
    assignmentUser,
    dateAssigned,
    dateReturned,
    location
} from "../../shared/const";

import {
    AssignmentEditorActionType,
    assignmentEditorInitialState,
    assignmentEditorReducer
} from "./AssignmentEditorReducer";

const AssignmentEditor = lazy(() => import('./AssignmentEditor'));

const AssetPicker = lazy(() => import('../asset/AssetPicker'));
const UserPicker = lazy(() => import('../user/UserPicker'));

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
        { field: assignmentAsset, headerName: t("field.name"), flex: 1 },
        { field: assignmentUser, headerName: t("field.user"), flex: 1 },
        { 
            field: dateAssigned, 
            headerName: t("field.date_assigned"), 
            flex: 1,
            valueGetter: (params: GridValueGetterParams) => 
                t(formatDate(params.row.dateAssigned))
        },
        { 
            field: dateReturned, 
            headerName: t("field.date_returned"), 
            flex: 1,
            valueGetter: (params: GridValueGetterParams) =>
                t(formatDate(params.row.dateReturned))
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

    const onAssignmentEditorCommit = () => {

    }

    const onAssignmentLocationChanged = (location: string) => {
        let assignment = editorState.assignment;
        if (assignment === undefined)
            assignment = { assignmentId: newId() }
        assignment!.location = location;
        editorDispatch({
            type: AssignmentEditorActionType.CHANGED,
            payload: assignment
        })
    }

    const onAssignmentRemarksChanged = (remarks: string) => {
        let assignment = editorState.assignment;
        if (assignment === undefined)
            assignment = { assignmentId: newId() }
        assignment!.remarks = remarks; 
        editorDispatch({
            type: AssignmentEditorActionType.CHANGED,
            payload: assignment
        })
    } 

    const onAssignmentAssetSelected = (asset: Asset) => {
        let assignment = editorState.assignment;
        if (assignment === undefined)
            assignment = { assignmentId: newId() }
        assignment!.asset = minimizeAsset(asset);
        onAssetPickerDismiss()
        editorDispatch({
            type: AssignmentEditorActionType.CHANGED,
            payload: assignment
        })
    }

    const onAssignmentUserSelected = (user: User) => {
        let assignment = editorState.assignment;
        if (assignment === undefined)
            assignment = { assignmentId: newId() }
        assignment!.user = minimizeUser(user);
        onUserPickerDismiss()
        editorDispatch({
            type: AssignmentEditorActionType.CHANGED,
            payload: assignment
        })
    }

    const onAssignmentSelected = (assignment: Assignment) => {

    }

    const {
        items: assets,
        isLoading: isAssetsLoading,
        isStart: atAssetStart,
        isEnd: atAssetEnd,
        getPrev: getPreviousAssets,
        getNext: getNextAssets
    } = usePagination<Asset>(
        firestore
            .collection(assetCollection)
            .orderBy(assetName, "asc"), { limit: 15 }
    );

    const [isAssetPickerOpen, setAssetPickerOpen] = useState(false);
    const onAssetPickerView = () => { setAssetPickerOpen(true) }
    const onAssetPickerDismiss = () => { setAssetPickerOpen(false) }

    const {
        items: users,
        isLoading: isUsersLoading,
        isStart: atUserStart,
        isEnd: atUserEnd,
        getPrev: getPreviousUsers,
        getNext: getNextUsers
    } = usePagination<User>(
        firestore.collection(userCollection)
            .orderBy(lastName, "asc"), { limit: 15 }
    )

    const [isUserPickerOpen, setUserPickerOpen] = useState(false);
    const onUserPickerView = () => { setUserPickerOpen(true) }
    const onUserPickerDismiss = () => { setUserPickerOpen(false) }

    return (
        <Box className={classes.root}>
            <ComponentHeader 
                title={ t("navigation.assignments") }
                buttonText={isAdmin ? t("add") : undefined }
                buttonIcon={PlusIcon}
                buttonOnClick={onAssignmentEditorView}
                onDrawerToggle={props.onDrawerToggle}
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

            <AssignmentEditor
                isOpen={editorState.isOpen}
                id={editorState.assignment?.assignmentId}
                asset={editorState.assignment?.asset}
                user={editorState.assignment?.user}
                dateAssigned={editorState.assignment?.dateAssigned}
                dateReturned={editorState.assignment?.dateReturned}
                location={editorState.assignment?.location}
                remarks={editorState.assignment?.remarks}
                onCancel={onAssignmentEditorDismiss}
                onSubmit={onAssignmentEditorCommit}
                onAssetSelect={onAssetPickerView}
                onUserSelect={onUserPickerView}
                onLocationChanged={onAssignmentLocationChanged}
                onRemarksChanged={onAssignmentRemarksChanged}/>

            <AssetPicker
                isOpen={isAssetPickerOpen}
                assets={assets}
                isLoading={isAssetsLoading}
                hasPrevious={atAssetStart}
                hasNext={atAssetEnd}
                onPrevious={getPreviousAssets}
                onNext={getNextAssets}
                onDismiss={onAssetPickerDismiss}
                onSelectItem={onAssignmentAssetSelected}/>

            <UserPicker
                isOpen={isUserPickerOpen}
                users={users}
                isLoading={isUsersLoading}
                hasPrevious={atUserStart}
                hasNext={atUserEnd}
                onPrevious={getPreviousUsers}
                onNext={getNextUsers}
                onDismiss={onUserPickerDismiss}
                onSelectItem={onAssignmentUserSelected}/>

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