import { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Fab, LinearProgress, Theme } from "@mui/material";
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
import { useDialog } from "../../components/DialogProvider";
import { isDev } from "../../shared/utils";

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
  const show = useDialog();
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

  const onModificationInvoke = async (user: User) => {
    try {
      let result = await show({
        title: user?.disabled ? "dialog.user_enable" : "dialog.user_disable",
        description: user?.disabled ? "dialog.user_enable_summary" : "dialog.user_disable_summary"
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
      let result = await show({
        title: t("dialog.user_remove"),
        description: t("dialog.user_remove_summary"),
        confirmButtonText: t("button.delete"),
        dismissButtonText: t("button.cancel")
      });
      if (result) {
        await UserRepository.remove(user);
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

  const onUserEditorView = () => dispatch({ type: ActionType.CREATE })
  const onUserEditorDismiss = () => dispatch({ type: ActionType.DISMISS })

  const onUserSelected = (user: User) => {
    dispatch({
      type: ActionType.UPDATE,
      payload: user
    })
  }

  return (
    <Box sx={{width: '100%'}}>
      <InstantSearch
        searchClient={Provider}
        indexName="users">
        <AdaptiveHeader
          title={t("navigation.users")}
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
                onRemoveInvoke={onUserRemove}
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
    </Box>
  );
}

export default UserScreen;