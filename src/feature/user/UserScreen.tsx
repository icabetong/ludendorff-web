import { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { InstantSearch } from "react-instantsearch-dom";
import { Box, Fab, LinearProgress } from "@mui/material";
import { GridRowParams } from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import { usePagination } from "use-pagination-firestore";
import { AddRounded } from "@mui/icons-material";
import { collection, orderBy, query } from "firebase/firestore";
import { getDataGridTheme } from "../core/Core";
import { useAuthState, usePermissions } from "../auth/AuthProvider";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { User, UserRepository } from "./User";
import UserList from "./UserList";
import { initialState, reducer } from "./UserEditorReducer";
import { userCollection, userId } from "../../shared/const";
import UserEditor from "./UserEditor";
import { firestore } from "../../index";
import Client from "../search/Client";
import { ScreenProps } from "../shared/types/ScreenProps";
import { useDialog } from "../../components/dialog/DialogProvider";
import { AdaptiveHeader } from "../../components/AdaptiveHeader";
import { UserEmptyState } from "./UserEmptyState";
import UserDataGrid from "./UserDataGrid";
import useSort from "../shared/hooks/useSort";
import { isDev } from "../../shared/utils";

type UserScreenProps = ScreenProps
const UserScreen = (props: UserScreenProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { user: authUser } = useAuthState();
  const show = useDialog();
  const { canRead, isAdmin } = usePermissions();
  const [searchMode, setSearchMode] = useState(false);
  const { sortMethod, onSortMethodChange } = useSort('userSort');

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<User>(
    query(collection(firestore, userCollection), orderBy(userId, "asc")), { limit: 25 }
  );
  const [state, dispatch] = useReducer(reducer, initialState);

  const onModificationInvoke = async (user: User) => {
    try {
      let result = await show({
        title: t(user?.disabled ? "dialog.user_enable_title" : "dialog.user_disable_title"),
        description: t(user?.disabled ? "dialog.user_enable_summary" : "dialog.user_disable_summary"),
        confirmButtonText: t("button.continue"),
        dismissButtonText: t("button.cancel"),
      });
      if (result) {
        await UserRepository.modify(user.userId, !user.disabled)
        enqueueSnackbar(t("feedback.user_modified"));
      }
    } catch (error) {
      enqueueSnackbar(t("feedback.user_modify_error"));
      if (isDev) console.log(error);
    }
  }

  const onUserRemove = async (user: User) => {
    try {
      if (!authUser) return;

      let combined: User = {
        ...user,
        auth: {
          userId: authUser.userId,
          name: `${authUser.firstName} ${authUser.lastName}`,
          email: authUser.email!
        }
      }
      let result = await show({
        title: t("dialog.user_remove"),
        description: t("dialog.user_remove_summary"),
        confirmButtonText: t("button.delete"),
        dismissButtonText: t("button.cancel")
      });
      if (result) {
        await UserRepository.remove(combined);
        enqueueSnackbar(t("feedback.user_removed"));
      }
    } catch (error) {
      enqueueSnackbar(t("feedback.user_remove_error"));
      if (isDev) console.log(error);
    }
  }

  const onDataGridRowDoubleClick = (params: GridRowParams) => {
    onUserSelected(params.row as User)
  }

  const onUserEditorView = () => dispatch({ type: "create" })
  const onUserEditorDismiss = () => dispatch({ type: "dismiss" })

  const onUserSelected = (user: User) => {
    dispatch({
      type: "update",
      payload: user
    })
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <InstantSearch
        searchClient={Client}
        indexName="users">
        <AdaptiveHeader
          title={t("navigation.users")}
          actionText={isAdmin ? t("button.create_user") : undefined}
          onActionEvent={onUserEditorView}
          onDrawerTriggered={props.onDrawerToggle}
          onSearchFocusChanged={setSearchMode}/>
        {canRead || isAdmin
          ? <>
            <Box sx={(theme) => ({ flex: 1, padding: 3, display: { xs: "none", sm: "block" }, ...getDataGridTheme(theme)})}>
              <UserDataGrid
                items={items}
                canBack={isStart}
                canForward={isEnd}
                isLoading={isLoading}
                isSearching={searchMode}
                sortMethod={sortMethod}
                onBackward={getPrev}
                onForward={getNext}
                onItemSelect={onDataGridRowDoubleClick}
                onRemoveInvoke={onUserRemove}
                onModificationInvoke={onModificationInvoke}
                onSortMethodChanged={onSortMethodChange}/>
            </Box>
            <Box sx={{ display: { xs: "block", sm: "none" }, height: 'inherit' }}>
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
                onClick={() => dispatch({ type: "create" })}>
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
    </Box>
  );
}

export default UserScreen;