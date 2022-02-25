import { useEffect, useState, useReducer } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Hidden,
  IconButton,
  LinearProgress,
  MenuItem,
  makeStyles,
  Button
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
  EmailRounded,
  DeleteOutlined,
  AddRounded,
  AssignmentRounded,
  SaveAltOutlined,
} from "@material-ui/icons";
import { jsPDF } from "jspdf";
import { onSnapshot, query, collection, orderBy } from "firebase/firestore";

import PageHeader from "../../components/PageHeader";
import ComponentHeader from "../../components/ComponentHeader";
import GridLinearProgress from "../../components/GridLinearProgress";
import GridToolbar from "../../components/GridToolbar";
import EmptyStateComponent from "../state/EmptyStates";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { getDataGridTheme } from "../core/Core";

import { usePermissions } from "../auth/AuthProvider";
import { Assignment, AssignmentRepository } from "./Assignment";
import AssignmentList from "./AssignmentList";
import RequestScreen from "../requests/RequestScreen";
import { usePreferences } from "../settings/Preference";
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

import { firestore } from "../../index";

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%', height: '100%'
  },
  wrapper: {
    height: '90%',
    padding: '1.4em',
    ...getDataGridTheme(theme)
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
  const [isLoading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onSnapshot(query(collection(firestore, assignmentCollection), orderBy(assignmentAssetName, "asc")), (snapshot) => {
      if (mounted) {
        setAssignments(snapshot.docs.map((doc) => doc.data() as Assignment));
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    }
  }, []);

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
      field: "export",
      headerName: t("button.export"),
      flex: 0.4,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        return (
          <IconButton
            aria-label={t("button.export")}
            onClick={() => onExport(params.row as Assignment)}>
            <SaveAltOutlined/>
          </IconButton>
        )
      }
    },
    {
      field: "delete",
      headerName: t("button.delete"),
      flex: 0.4,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        return (
          <IconButton
            aria-label={t("button.delete")}
            onClick={() => onRemoveInvoke(params.row as Assignment)}>
            <DeleteOutlined/>
          </IconButton>
        )
      }
    }
  ];

  const onExport = (assignment: Assignment) => {
    const catSize = 18;
    const dataSize = 14;
    const addHeader = (category: string, x: number, y: number): jsPDF => {
      return doc.setFontSize(catSize).setFont('', 'bold').text(category, x, y);
    }
    const addData = (header: string, data: string | null | undefined, x: number, y: number): jsPDF => {
      return data ? doc.setFontSize(dataSize).setFont('', 'normal').text(`${header}: ${data}`, x, y) : doc;
    }

    const doc = new jsPDF('portrait', undefined, 'b5');
    doc.setFontSize(20);
    doc.setFont('', 'bold');
    doc.text(t("assignment_details"), 20, 20);

    addData(t("field.location"), assignment.location ? assignment?.location : t("no_location_data"), 20, 30);
    addData(t("field.date_assigned"), formatDate(assignment.dateAssigned), 20, 35);
    addData(t("field.date_returned"), assignment.dateReturned ? formatDate(assignment.dateReturned) : t("not_yet_returned"), 20, 40);
    //
    addHeader(t("field.asset"), 20, 50);
    addData(t("field.name"), assignment.asset?.assetName, 20, 60);
    addData(t("field.status"), assignment.asset?.status?.toString(), 20, 65);
    addData(t("field.category"), assignment.asset?.category?.categoryName, 20, 70);

    //
    addHeader(t("field.user"), 20, 80);
    addData(t("field.name"), assignment?.user?.name, 20, 90);
    addData(t("field.email"), assignment.user?.email, 20, 95);
    addData(t("field.position"), assignment?.user?.position, 20, 100);

    addData(t("field.remarks"), assignment?.remarks ? assignment?.remarks : t("no_remarks"), 20, 110);

    doc.save("b5.pdf");
  }

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
  
  const menuItems = [
    <MenuItem key={0} onClick={onRequestListView}>{t("navigation.requests")}</MenuItem>
  ];

  return (
    <Box className={classes.root}>
      <Hidden smDown>
        <PageHeader
          title={t("navigation.assignments")}
          buttonText={isAdmin ? t("button.create_assignment") : undefined}
          buttonIcon={AddRounded}
          buttonOnClick={onAssignmentEditorView}
          onSearch={onSearchInvoke}/>
      </Hidden>
      <Hidden mdUp>
        <ComponentHeader
          title={t("navigation.assignments")}
          buttonText={isAdmin ? t("button.create_assignment") : undefined}
          buttonIcon={AddRounded}
          buttonOnClick={onAssignmentEditorView}
          onSearch={onSearchInvoke}
          onDrawerToggle={props.onDrawerToggle}
          menuItems={menuItems}
        />
      </Hidden>
      {isAdmin
        ? <>
          <Hidden xsDown>
            <div className={classes.wrapper}>
              <DataGrid
                components={{
                  LoadingOverlay: GridLinearProgress,
                  NoRowsOverlay: EmptyStateOverlay,
                  Toolbar: GridToolbar
                }}
                componentsProps={{
                  toolbar: {
                    destinations: [
                      <Button
                        key="requests"
                        color="primary"
                        size="small"
                        startIcon={<EmailRounded fontSize="small"/>}
                        onClick={onRequestListView}>
                        {t("navigation.requests")}
                      </Button>
                    ]
                  }
                }}
                rows={assignments}
                columns={columns}
                density={preferences.density}
                pageSize={20}
                loading={isLoading}
                paginationMode="client"
                getRowId={(r) => r.assignmentId}
                onRowDoubleClick={onDataGridRowDoubleClicked}/>
            </div>
          </Hidden>
          <Hidden smUp>
            {!isLoading
              ? assignments.length < 1
                ? <AssignmentEmptyState />
                : <AssignmentList assignments={assignments} onItemSelect={onAssignmentSelected} />
              : <LinearProgress />
            }
          </Hidden>
        </>
        : <ErrorNoPermissionState />
      }
      {editorState.isOpen &&
        <AssignmentEditor
          isOpen={editorState.isOpen}
          isCreate={editorState.isCreate}
          assignment={editorState.assignment}
          onCancel={onAssignmentEditorDismiss} />
      }
      {search &&
        <AssignmentSearchScreen
          isOpen={search}
          onDismiss={onSearchDismiss}
          onEditorInvoke={onAssignmentSelected} />
      }
      {assignment &&
        <ConfirmationDialog
          isOpen={assignment !== undefined}
          title="dialog.assignment_remove"
          summary="dialog.assignment_remove_summary"
          onDismiss={onRemoveDismiss}
          onConfirm={onRemoveAssignment} />
      }
      <RequestScreen
        isOpen={isRequestListOpen}
        onDismiss={onRequestListDismiss} />
    </Box>
  )
}

const EmptyStateOverlay = () => {
  return (
    <GridOverlay>
      <AssignmentEmptyState />
    </GridOverlay>
  );
}

const AssignmentEmptyState = () => {
  const { t } = useTranslation();

  return (
    <EmptyStateComponent
      icon={AssignmentRounded}
      title={t("empty_assignment")}
      subtitle={t("empty_assignment_summary")} />
  );
}

export default AssignmentScreen;