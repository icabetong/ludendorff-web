import { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Fab, LinearProgress, MenuItem, Theme } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { GridRowParams } from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import { AddRounded } from "@mui/icons-material";
import { collection, orderBy, query } from "firebase/firestore";
import { getDataGridTheme } from "../core/Core";
import { usePermissions } from "../auth/AuthProvider";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { User, UserRepository } from "./User";
import UserList from "./UserList";
import { ActionType, initialState, reducer } from "./UserEditorReducer";
import { lastName, userCollection } from "../../shared/const";
import UserEditor from "./UserEditor";
import DepartmentScreen from "../department/DepartmentScreen";
import ConfirmationDialog from "../shared/ConfirmationDialog";
import { firestore } from "../../index";
import { usePagination } from "use-pagination-firestore";
import { InstantSearch } from "react-instantsearch-dom";
import { Provider } from "../../components/Search";
import { ScreenProps } from "../shared/types/ScreenProps";
import AdaptiveHeader from "../../components/AdaptiveHeader";
import useQueryLimit from "../shared/hooks/useQueryLimit";
import { UserEmptyState } from "./UserEmptyState";
import UserDataGrid from "./UserDataGrid";
import useSort from "../shared/hooks/useSort";
import { OrderByDirection } from "@firebase/firestore-types";

const useStyles = makeStyles((theme: Theme) => ({
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
  const { limit, onLimitChanged } = useQueryLimit('userQueryLimit');
  const [searchMode, setSearchMode] = useState(false);
  const { sortMethod, onSortMethodChange } = useSort('userSort');

  const onParseQuery = () => {
    let field = lastName;
    let direction: OrderByDirection = "asc";
    if (sortMethod.length > 0) {
      field = sortMethod[0].field;
      switch(sortMethod[0].sort) {
        case "asc":
        case "desc":
          direction = sortMethod[0].sort;
          break;
      }
    }

    return query(collection(firestore, userCollection), orderBy(field, direction));
  }

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<User>(
    onParseQuery(), { limit: limit }
  );
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
      key={0}
      onClick={onDepartmentView}>{t("navigation.departments")}</MenuItem>
  ]

  return (
    <Box sx={{width: '100%'}}>
      <InstantSearch
        searchClient={Provider}
        indexName="users">
        <AdaptiveHeader
          title={t("navigation.users")}
          menuItems={menuItems}
          actionText={canManageUsers ? t("button.create_user") : undefined}
          onActionEvent={onUserEditorView}
          onDrawerTriggered={props.onDrawerToggle}
          onSearchFocusChanged={setSearchMode}/>
        {canRead || canManageUsers
          ? <>
            <Box className={classes.wrapper} sx={{ display: { xs: "none", sm: "block" }}}>
              <UserDataGrid
                items={items}
                size={limit}
                canBack={isStart}
                canForward={isEnd}
                isLoading={isLoading}
                isSearching={searchMode}
                sortMethod={sortMethod}
                onBackward={getPrev}
                onForward={getNext}
                onPageSizeChanged={onLimitChanged}
                onItemSelect={onDataGridRowDoubleClick}
                onRemoveInvoke={onRemoveInvoke}
                onDepartmentInvoke={onDepartmentView}
                onModificationInvoke={onModificationInvoke}
                onSortMethodChanged={onSortMethodChange}/>
            </Box>
            <Box sx={{ display: { xs: "block", sm: "none" }}}>
              {!isLoading
                ? items.length < 1
                  ? <UserEmptyState/>
                  : <UserList
                      users={items}
                      onItemSelect={onUserSelected}/>
                : <LinearProgress/>
              }
              <Fab
                color="primary"
                aria-label={t("button.add")}
                onClick={() => dispatch({ type: ActionType.CREATE })}>
                <AddRounded/>
              </Fab>
            </Box>
          </>
          : <ErrorNoPermissionState/>
        }
      </InstantSearch>
      <UserEditor
        isOpen={state.isOpen}
        isCreate={state.isCreate}
        user={state.user}
        onDismiss={onUserEditorDismiss}/>
      <ConfirmationDialog
        isOpen={userModify !== undefined}
        title={userModify?.disabled ? "dialog.user_enable" : "dialog.user_disable"}
        summary={userModify?.disabled ? "dialog.user_enable_summary" : "dialog.user_disable_summary"}
        onDismiss={onModificationDismiss}
        onConfirm={onModificationConfirmed}/>
      <ConfirmationDialog
        isOpen={userRemove !== undefined}
        title="dialog.user_remove"
        summary="dialog.user_remove_summary"
        onDismiss={onRemoveDismiss}
        onConfirm={onRemoveConfirmed}/>
      <DepartmentScreen
        isOpen={isDepartmentOpen}
        onDismiss={onDepartmentDismiss}/>
    </Box>
  );
}

export default UserScreen;