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

import { firestore } from "../../index";
import { usePagination } from "../../shared/pagination";
import { Assignment } from "./Assignment";
import AssignmentList from "./AssignmentList";
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

    const onAssignmentSelected = (assignment: Assignment) => {

    }

    return (
        <Box className={classes.root}>
            <ComponentHeader 
                title={ t("navigation.assignments") }
                buttonText={ t("add") }
                buttonIcon={PlusIcon}
                onDrawerToggle={props.onDrawerToggle}
            />
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