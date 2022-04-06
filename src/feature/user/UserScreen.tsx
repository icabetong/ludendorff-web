import { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Fab, Hidden, IconButton, LinearProgress, MenuItem, Theme, Tooltip } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { DataGrid, GridCellParams, GridRowParams, GridValueGetterParams } from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import {
  AddRounded,
  DeleteOutline,
  DomainRounded,
  PeopleOutlineRounded,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { collection, orderBy, query } from "firebase/firestore";

import GridLinearProgress from "../../components/GridLinearProgress";
import GridToolbar from "../../components/GridToolbar";
import EmptyStateComponent from "../state/EmptyStates";
import { getDataGridTheme } from "../core/Core";

import { usePermissions } from "../auth/AuthProvider";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { usePreferences } from "../settings/Preference";
import { User, UserRepository } from "./User";
import UserList from "./UserList";

import { ActionType, initialState, reducer } from "./UserEditorReducer";

import { department, email, firstName, lastName, position, userCollection, userId, } from "../../shared/const";

import UserEditor from "./UserEditor";
import DepartmentScreen from "../department/DepartmentScreen";
import ConfirmationDialog from "../shared/ConfirmationDialog";
import { firestore } from "../../index";
import { usePagination } from "use-pagination-firestore";
import { DataGridPaginationController } from "../../components/PaginationController";
import { HitsProvided } from "react-instantsearch-core";
import { connectHits, InstantSearch } from "react-instantsearch-dom";
import { Provider } from "../../components/Search";
import { ScreenProps } from "../shared/ScreenProps";
import GridEmptyRow from "../../components/GridEmptyRows";
import AdaptiveHeader from "../../components/AdaptiveHeader";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: '100%',
    width: '100%'
  },
  wrapper: {
    height: '90%',
    padding: '1.4em',
    ...getDataGridTheme(theme)
  }
}));

type UserScreenProps = ScreenProps
const UserScreen = (props: UserScreenProps) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { canRead, canManageUsers } = usePermissions();
  const preferences = usePreferences();
  const [size, setSize] = useState(15);
  const [searchMode, setSearchMode] = useState(false);

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<User>(
    query(collection(firestore, userCollection), orderBy(lastName, "asc")), { limit: 15 }
  );

  const columns = [
    { field: userId, headerName: t("field.id"), hide: true },
    { field: lastName, headerName: t("field.last_name"), flex: 1 },
    { field: firstName, headerName: t("field.first_name"), flex: 1 },
    { field: email, headerName: t("field.email"), flex: 1 },
    {
      field: position,
      headerName: t("field.position"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        let user = params.row as User;
        return user.position === undefined ? t("unknown") : user.position;
      }
    },
    {
      field: department,
      headerName: t("field.department"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        let user = params.row as User;
        return user.department?.name === undefined ? t("unknown") : user.department?.name;
      }
    }, {
      field: "manage",
      headerName: t("navigation.manage"),
      flex: 0.4,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const user = params.row as User;
        return (
          <Tooltip
            title={ <>{ t(user.disabled ? "button.enable" : "button.disable") }</> }
            placement="bottom">
            <span>
              <IconButton
                aria-label={ params.row.disabled ? t("button.enable") : t("button.disable") }
                onClick={ () => onModificationInvoke(user) }
                size="large">
                { params.row.disabled ? <VisibilityOutlined/> : <VisibilityOffOutlined/> }
              </IconButton>
            </span>
          </Tooltip>
        );
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
            aria-label={ t("button.delete") }
            onClick={ () => onRemoveInvoke(params.row as User) }
            size="large">
            <DeleteOutline/>
          </IconButton>
        );
      }
    }
  ]

  const [state, dispatch] = useReducer(reducer, initialState);
  const [userModify, setUserModify] = useState<User | undefined>(undefined);
  const [userRemove, setUserRemove] = useState<User | undefined>(undefined);

  const onModificationInvoke = (user: User) => setUserModify(user);
  const onModificationDismiss = () => setUserModify(undefined);
  const onModificationConfirmed = () => {
    if (userModify !== undefined) {
      UserRepository.modify(userModify.userId, !userModify.disabled)
        .then(() => enqueueSnackbar(t("feedback.user_modified")))
        .catch(() => enqueueSnackbar(t("feedback.user_modify_error")))
        .finally(onModificationDismiss)
    }
  }

  const onRemoveInvoke = (user: User) => setUserRemove(user);
  const onRemoveDismiss = () => setUserRemove(undefined);
  const onRemoveConfirmed = () => {
    if (userRemove !== undefined) {
      UserRepository.remove(userRemove)
        .then(() => enqueueSnackbar(t("feedback.user_removed")))
        .catch(() => enqueueSnackbar(t("feedback.user_remove_error")))
        .finally(onRemoveDismiss)
    }
  }

  const onDataGridRowDoubleClick = (params: GridRowParams) => {
    onUserSelected(params.row as User)
  }

  const onUserEditorView = () => dispatch({ type: ActionType.CREATE })
  const onUserEditorDismiss = () => dispatch({ type: ActionType.DISMISS })

  const onUserSelected = (user: User) => {
    dispatch({
      type: ActionType.UPDATE,
      payload: user
    })
  }
  const [isDepartmentOpen, setDepartmentOpen] = useState(false);

  const onDepartmentView = () => {
    setDepartmentOpen(true)
  }
  const onDepartmentDismiss = () => {
    setDepartmentOpen(false)
  }

  const menuItems = [
    <MenuItem
      key={ 0 }
      onClick={ onDepartmentView }>{ t("navigation.departments") }</MenuItem>
  ]

  const pagination = () => {
    return (
      <DataGridPaginationController
        size={ size }
        canBack={ isStart }
        canForward={ isEnd }
        onBackward={ getPrev }
        onForward={ getNext }
        onPageSizeChanged={ setSize }/>
    )
  }

  const dataGrid = (
    <DataGrid
      components={ {
        LoadingOverlay: GridLinearProgress,
        NoRowsOverlay: UserDataGridEmptyRows,
        Toolbar: GridToolbar,
        Pagination: pagination
      } }
      componentsProps={ {
        toolbar: {
          destinations: [
            <Button
              key="departments"
              color="primary"
              size="small"
              startIcon={ <DomainRounded fontSize="small"/> }
              onClick={ onDepartmentView }>
              { t("navigation.departments") }
            </Button>
          ]
        }
      } }
      rows={ items }
      columns={ columns }
      density={ preferences.density }
      loading={ isLoading }
      paginationMode="client"
      getRowId={ (r) => r.userId }
      onRowDoubleClick={ onDataGridRowDoubleClick }/>
  )

  return (
    <Box className={ classes.root }>
      <InstantSearch
        searchClient={ Provider }
        indexName="users">
        <AdaptiveHeader
          title={t("navigation.users")}
          menuItems={menuItems}
          actionText={canManageUsers ? t("button.create_user") : undefined}
          onActionEvent={onUserEditorView}
          onDrawerTriggered={props.onDrawerToggle}
          onSearchFocusChanged={setSearchMode}/>
        { canRead || canManageUsers
          ? <>
            <Hidden smDown>
              <Box className={ classes.wrapper }>
                { searchMode
                  ? <UserDataGrid
                    onItemSelect={ onDataGridRowDoubleClick }
                    onModificationInvoke={ onModificationInvoke }
                    onRemoveInvoke={ onRemoveInvoke }
                    onDepartmentInvoke={ onDepartmentView }/>
                  : dataGrid
                }
              </Box>
            </Hidden>
            <Hidden smUp>
              { !isLoading
                ? items.length < 1
                  ? <UserEmptyStateComponent/>
                  : <UserList
                    users={ items }
                    onItemSelect={ onUserSelected }/>
                : <LinearProgress/>
              }
              <Fab
                color="primary"
                aria-label={t("button.add")}
                onClick={() => dispatch({ type: ActionType.CREATE })}>
                <AddRounded/>
              </Fab>
            </Hidden>
          </>
          : <ErrorNoPermissionState/>
        }
      </InstantSearch>
      <UserEditor
        isOpen={ state.isOpen }
        isCreate={ state.isCreate }
        user={ state.user }
        onDismiss={ onUserEditorDismiss }/>
      <ConfirmationDialog
        isOpen={ userModify !== undefined }
        title={ userModify?.disabled ? "dialog.user_enable" : "dialog.user_disable" }
        summary={ userModify?.disabled ? "dialog.user_enable_summary" : "dialog.user_disable_summary" }
        onDismiss={ onModificationDismiss }
        onConfirm={ onModificationConfirmed }/>
      <ConfirmationDialog
        isOpen={ userRemove !== undefined }
        title="dialog.user_remove"
        summary="dialog.user_remove_summary"
        onDismiss={ onRemoveDismiss }
        onConfirm={ onRemoveConfirmed }/>
      <DepartmentScreen
        isOpen={ isDepartmentOpen }
        onDismiss={ onDepartmentDismiss }/>
    </Box>
  );
}

const UserDataGridEmptyRows = () => {
  return (
    <GridEmptyRow>
      <UserEmptyStateComponent/>
    </GridEmptyRow>
  )
}

const UserEmptyStateComponent = () => {
  const { t } = useTranslation();

  return (
    <EmptyStateComponent
      icon={ PeopleOutlineRounded }
      title={ t("empty.user") }
      subtitle={ t("empty.user_summary") }/>
  );
}

type UserDataGridCoreProps = HitsProvided<User> & {
  onItemSelect: (params: GridRowParams) => void,
  onModificationInvoke: (user: User) => void,
  onRemoveInvoke: (user: User) => void,
  onDepartmentInvoke: () => void,
}
const UserDataGridCore = (props: UserDataGridCoreProps) => {
  const { t } = useTranslation();
  const userPreference = usePreferences();

  const columns = [
    { field: userId, headerName: t("field.id"), hide: true },
    { field: lastName, headerName: t("field.last_name"), flex: 1 },
    { field: firstName, headerName: t("field.first_name"), flex: 1 },
    { field: email, headerName: t("field.email"), flex: 1 },
    {
      field: position,
      headerName: t("field.position"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        let user = params.row as User;
        return user.position === undefined ? t("unknown") : user.position;
      }
    },
    {
      field: department,
      headerName: t("field.department"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        let user = params.row as User;
        return user.department?.name === undefined ? t("unknown") : user.department?.name;
      }
    }, {
      field: "manage",
      headerName: t("navigation.manage"),
      flex: 0.4,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const user = params.row as User;
        return (
          <Tooltip
            title={ <>{ t(user.disabled ? "button.enable" : "button.disable") }</> }
            placement="bottom">
            <span>
              <IconButton
                aria-label={ params.row.disabled ? t("button.enable") : t("button.disable") }
                onClick={ () => props.onModificationInvoke(user) }
                size="large">
                { params.row.disabled ? <VisibilityOutlined/> : <VisibilityOffOutlined/> }
              </IconButton>
            </span>
          </Tooltip>
        );
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
            aria-label={ t("button.delete") }
            onClick={ () => props.onRemoveInvoke(params.row as User) }
            size="large">
            <DeleteOutline/>
          </IconButton>
        );
      }
    }
  ]

  return (
    <DataGrid
      hideFooterPagination
      components={ {
        LoadingOverlay: GridLinearProgress,
        NoRowsOverlay: UserDataGridEmptyRows,
        Toolbar: GridToolbar
      } }
      componentsProps={ {
        toolbar: {
          destinations: [
            <Button
              key="departments"
              color="primary"
              size="small"
              startIcon={ <DomainRounded fontSize="small"/> }
              onClick={ props.onDepartmentInvoke }>
              { t("navigation.departments") }
            </Button>
          ]
        }
      } }
      columns={ columns }
      rows={ props.hits }
      density={ userPreference.density }
      getRowId={ (r) => r.userId }
      onRowDoubleClick={ props.onItemSelect }/>
  )
}

const UserDataGrid = connectHits<UserDataGridCoreProps, User>(UserDataGridCore)

export default UserScreen;