import { useEffect, useState, useReducer } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Hidden,
  IconButton,
  LinearProgress,
  MenuItem,
  Tooltip,
  makeStyles,
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
  DomainRounded,
  VisibilityOffOutlined,
  VisibilityOutlined,
  AddRounded,
  DeleteOutline,
  PeopleOutlineRounded,
} from "@material-ui/icons";
import { query, collection, orderBy, onSnapshot } from "firebase/firestore";

import ComponentHeader from "../../components/ComponentHeader";
import GridLinearProgress from "../../components/GridLinearProgress";
import GridToolbar from "../../components/GridToolbar";
import EmptyStateComponent from "../state/EmptyStates";
import { getDataGridTheme } from "../core/Core";

import { usePermissions } from "../auth/AuthProvider";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { usePreferences } from "../settings/Preference";
import { User, UserRepository } from "./User";
import UserList from "./UserList";

import {
  ActionType,
  initialState,
  reducer
} from "./UserEditorReducer";

import {
  userCollection,
  userId,
  firstName,
  lastName,
  email,
  position,
  department,
} from "../../shared/const";

import UserEditor from "./UserEditor";
import UserSearchScreen from "./UserSearchScreen";
import DepartmentScreen from "../department/DepartmentScreen";
import ConfirmationDialog from "../shared/ConfirmationDialog";
import PageHeader from "../../components/PageHeader";
import { firestore } from "../../index";

const useStyles = makeStyles((theme) => ({
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

type UserScreenProps = {
  onDrawerToggle: () => void
}

const UserScreen = (props: UserScreenProps) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { canRead, canManageUsers } = usePermissions();
  const preferences = usePreferences();
  const [isLoading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onSnapshot(query(collection(firestore, userCollection), orderBy(lastName, "asc")), (snapshot) => {
      if (mounted) {
        setUsers(snapshot.docs.map((doc) => doc.data() as User));
        setLoading(false);
      }
    })
    
    return () => {
      mounted = false;
      unsubscribe();
    }
  }, []);

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
          <Tooltip title={<>{t(user.disabled ? "button.enable" : "button.disable")}</>} placement="bottom">
            <span>
              <IconButton
                aria-label={params.row.disabled ? t("button.enable") : t("button.disable")}
                onClick={() => onModificationInvoke(user)}>
                { params.row.disabled ? <VisibilityOutlined/> : <VisibilityOffOutlined/> }
              </IconButton>
            </span>
          </Tooltip>
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
            onClick={() => onRemoveInvoke(params.row as User)}>
            <DeleteOutline/>
          </IconButton>
        )
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

  const [search, setSearch] = useState<boolean>(false);
  const onSearchInvoke = () => setSearch(true);
  const onSearchDismiss = () => setSearch(false);

  const [isDepartmentOpen, setDepartmentOpen] = useState(false);

  const onDepartmentView = () => { setDepartmentOpen(true) }
  const onDepartmentDismiss = () => { setDepartmentOpen(false) }

  const menuItems = [
    <MenuItem key={0} onClick={onDepartmentView}>{t("navigation.departments")}</MenuItem>
  ]

  return (
    <Box className={classes.root}>
      <Hidden smDown>
        <PageHeader
          title={t("navigation.users")}
          buttonText={t("button.create_user")}
          buttonIcon={AddRounded}
          buttonOnClick={onUserEditorView}
          onSearch={onSearchInvoke}/>
      </Hidden>
      <Hidden mdUp>
        <ComponentHeader
          title={t("navigation.users")}
          onDrawerToggle={props.onDrawerToggle}
          buttonText={
            canManageUsers
              ? t("button.create_user")
              : undefined
          }
          buttonIcon={AddRounded}
          buttonOnClick={onUserEditorView}
          onSearch={onSearchInvoke}
          menuItems={menuItems}
        />
      </Hidden>
      {canRead || canManageUsers
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
                        key="departments"
                        color="primary"
                        size="small"
                        startIcon={<DomainRounded fontSize="small"/>}
                        onClick={onDepartmentView}>
                        {t("navigation.departments")}
                      </Button>
                    ]
                  }
                }}
                rows={users}
                columns={columns}
                density={preferences.density}
                pageSize={20}
                loading={isLoading}
                paginationMode="client"
                getRowId={(r) => r.userId}
                onRowDoubleClick={onDataGridRowDoubleClick}/>
            </div>
          </Hidden>
          <Hidden smUp>
            {!isLoading
              ? users.length < 1
                ? <UserEmptyStateComponent />
                : <UserList users={users} onItemSelect={onUserSelected} />
              : <LinearProgress />
            }
          </Hidden>

        </>
        : <ErrorNoPermissionState />
      }
      {state.isOpen &&
        <UserEditor
          isOpen={state.isOpen}
          isCreate={state.isCreate}
          user={state.user}
          onDismiss={onUserEditorDismiss} />
      }
      {search &&
        <UserSearchScreen
          isOpen={search}
          onDismiss={onSearchDismiss}
          onEditorInvoke={onUserSelected} />
      }
      {userModify &&
        <ConfirmationDialog
          isOpen={userModify !== undefined}
          title={userModify?.disabled ? "dialog.user_enable" : "dialog.user_disable"}
          summary={userModify?.disabled ? "dialog.user_enable_summary" : "dialog.user_disable_summary"}
          onDismiss={onModificationDismiss}
          onConfirm={onModificationConfirmed} />
      }
      {userRemove &&
        <ConfirmationDialog
          isOpen={userRemove !== undefined}
          title="dialog.user_remove"
          summary="dialog.user_remove_summary"
          onDismiss={onRemoveDismiss}
          onConfirm={onRemoveConfirmed} />
      }
      <DepartmentScreen
        isOpen={isDepartmentOpen}
        onDismiss={onDepartmentDismiss} />
    </Box>
  )
}

const EmptyStateOverlay = () => {
  return (
    <GridOverlay>
      <UserEmptyStateComponent />
    </GridOverlay>
  )
}

const UserEmptyStateComponent = () => {
  const { t } = useTranslation();

  return (
    <EmptyStateComponent
      icon={PeopleOutlineRounded}
      title={t("empty_user")}
      subtitle={t("empty_user_summary")} />
  );
}

export default UserScreen;