import { useEffect, useState, useReducer } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Hidden,
  LinearProgress,
  MenuItem,
  makeStyles
} from "@material-ui/core";
import {
  DataGrid,
  GridOverlay,
  GridValueGetterParams
} from "@material-ui/data-grid";
import {
  EmailRounded,
  AddRounded,
  DevicesRounded,
} from "@material-ui/icons";
import { query, collection, orderBy, where, onSnapshot } from "firebase/firestore";
import RequestScreen from "./RequestScreen";
import { Assignment } from "../assignment/Assignment";
import AssignmentList from "../assignment/AssignmentList";
import PageHeader from "../../components/PageHeader";
import ComponentHeader from "../../components/ComponentHeader";
import GridLinearProgress from "../../components/GridLinearProgress";
import GridToolbar from "../../components/GridToolbar";
import { useAuthState } from "../auth/AuthProvider";
import RequestEditor from "../requests/RequestEditor";
import { ActionType, reducer, initialState } from "../requests/RequestEditorReducer";
import EmptyStateComponent from "../state/EmptyStates";
import {
  assignmentCollection,
  assignmentId,
  assignmentAssetName,
  assignmentAssetCategoryName,
  assignmentUserId,
  dateAssigned,
  dateReturned,
  location,
} from "../../shared/const";
import { formatDate } from "../../shared/utils";
import { firestore } from "../../index";
import { getDataGridTheme } from "../core/Core";

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    width: '100%',
  },
  wrapper: {
    height: '80%',
    padding: '1.4em',
    ...getDataGridTheme(theme),
  },
}))

type HomeScreenProps = {
  onDrawerToggle: () => void
}

const HomeScreen = (props: HomeScreenProps) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { user } = useAuthState();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onSnapshot(query(collection(firestore, assignmentCollection),
      where(assignmentUserId, '==', user?.userId),
      orderBy(assignmentAssetName, "asc")), (snapshot) => {
        if (mounted) {
          setAssignments(snapshot.docs.map((doc) => doc.data() as Assignment));
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
      unsubscribe();
    }
  }, [user?.userId]);

  const columns = [
    { field: assignmentId, headerName: t("field.id"), hide: true },
    {
      field: assignmentAssetName,
      headerName: t("field.asset_name"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => params.row.asset.assetName
    },
    {
      field: assignmentAssetCategoryName,
      headerName: t("field.category"),
      flex: 0.5,
      valueGetter: (params: GridValueGetterParams) => params.row.asset.category.categoryName
    },
    {
      field: dateAssigned,
      headerName: t("field.date_assigned"),
      flex: 0.75,
      valueGetter: (params: GridValueGetterParams) => formatDate(params.row.dateAssigned)
    },
    {
      field: dateReturned,
      headerName: t("field.date_returned"),
      flex: 0.75,
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
  ]

  const [state, dispatch] = useReducer(reducer, initialState);

  const onAssignmentSelected = (assignment: Assignment) => { }

  const onEditorCreate = () => dispatch({ type: ActionType.CREATE })
  const onEditorDismiss = () => dispatch({ type: ActionType.DISMISS })

  const [isRequestsOpen, setRequestsOpen] = useState<boolean>(false);
  const onRequestsView = () => setRequestsOpen(true);
  const onRequestsDismiss = () => setRequestsOpen(false);

  const menuItems = [
    <MenuItem key={0} onClick={onRequestsView}>{t("navigation.sent_requests")}</MenuItem>
  ]

  return (
    <Box className={classes.root}>
      <Hidden smDown>
        <PageHeader 
          title={t("navigation.home")}
          buttonText={t("button.request_asset")}
          buttonIcon={AddRounded}
          buttonOnClick={onEditorCreate}/>
      </Hidden>
      <Hidden mdUp>
        <ComponentHeader
          title={t("navigation.home")}
          buttonText={t("button.request_asset")}
          buttonIcon={AddRounded}
          buttonOnClick={onEditorCreate}
          onDrawerToggle={props.onDrawerToggle}
          menuItems={menuItems}/>
      </Hidden>
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
                    onClick={onRequestsView}>
                    {t("navigation.sent_requests")}
                  </Button>
                ]
              }
            }}
            rows={assignments}
            columns={columns}
            pageSize={15}
            loading={isLoading}
            paginationMode="client"
            getRowId={(r) => r.assignmentId}/>
        </div>
      </Hidden>
      <Hidden smUp>
        {!isLoading
          ? assignments.length < 1
            ? <HomeEmptyState />
            : <AssignmentList assignments={assignments} onItemSelect={onAssignmentSelected} />
          : <LinearProgress />
        }
      </Hidden>
      {state.isOpen &&
        <RequestEditor
          isOpen={state.isOpen}
          isCreate={state.isCreate}
          onDismiss={onEditorDismiss} />
      }
      {isRequestsOpen &&
        <RequestScreen
          isOpen={isRequestsOpen}
          onDismiss={onRequestsDismiss} />
      }
    </Box>
  )
}

const EmptyStateOverlay = () => {
  return (
    <GridOverlay>
      <HomeEmptyState />
    </GridOverlay>
  )
}

const HomeEmptyState = () => {
  const { t } = useTranslation();

  return (
    <EmptyStateComponent
      icon={DevicesRounded}
      title={t("empty_home")}
      subtitle={t("empty_home_summary")} />
  )
}

export default HomeScreen;