import { useState, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { InstantSearch } from "react-instantsearch-core";
import {
  Box,
  Dialog,
  DialogContent,
  LinearProgress,
} from "@mui/material";
import { query, collection, orderBy } from "firebase/firestore";
import { usePagination } from "use-pagination-firestore";
import { useSnackbar } from "notistack";
import { Asset, AssetRepository } from "../asset/Asset";
import { useAuthState, usePermissions } from "../auth/AuthProvider";
import Client from "../search/Client";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { DialogToolbar } from "../../components/dialog/DialogToolbar";
import { SlideUpTransition } from "../../components/transition/SlideUpTransition";
import { firestore } from "../../index";
import ArchivedDataGrid from "./ArchivedDataGrid";
import useSort from "../shared/hooks/useSort";
import { GridRowParams } from "@mui/x-data-grid";
import { getDataGridTheme } from "../core/Core";
import { ArchivedEmptyState } from "./ArchivedEmptyState";
import AssetList from "../asset/AssetList";
import { useDialog } from "../../components/dialog/DialogProvider";
import { isDev } from "../../shared/utils";
import { initialState, reducer } from "../asset/AssetEditorReducer";
import AssetEditor from "../asset/AssetEditor";

type ArchivedScreenProps = {
  isOpen: boolean,
  onDismiss: () => void,
}
const ArchivedScreen = (props: ArchivedScreenProps) => {
  const { t } = useTranslation();
  const { user } = useAuthState();
  const { enqueueSnackbar } = useSnackbar();
  const { canRead } = usePermissions();
  const [search, setSearch] = useState(false);
  const { sortMethod, onSortMethodChange } = useSort('archivedSort');
  const show = useDialog();

  const onSearchInvoked = () => setSearch(!search);
  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Asset>(
    query(collection(firestore, "archived"), orderBy("stockNumber", "asc")), { limit: 25 }
  );

  const onDataGridRowDoubleClicked = (params: GridRowParams) => {
    onAssetSelected(params.row as Asset);
  }
  const onAssetSelected = (asset: Asset) => {
    dispatch({
      type: "update",
      payload: asset
    })
  }

  const onAssetArchive = async (asset: Asset) => {
    try {
      if (!user) return;

      let combined: Asset = {
        ...asset,
        auth: {
          userId: user.userId,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email!
        }
      }

      let result = await show({
        title: t("dialog.asset_archive"),
        description: t("dialog.asset_archive_summary"),
        confirmButtonText: t("button.archive"),
        dismissButtonText: t("button.cancel")
      });
      if (result) {
        await AssetRepository.unArchive(combined);
        enqueueSnackbar(t("feedback.asset_removed"));
      }
    } catch (error) {
      enqueueSnackbar(t("feedback.asset_remove_error"))
      if (isDev) console.log(error)
    }
  }

  const onAssetRemove = async (asset: Asset) => {
    try {
      if (!user) return;

      let combined: Asset = {
        ...asset,
        auth: {
          userId: user.userId,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email!
        }
      }

      let result = await show({
        title: t("dialog.asset_remove"),
        description: t("dialog.asset_remove_summary"),
        confirmButtonText: t("button.delete"),
        dismissButtonText: t("button.cancel")
      });
      if (result) {
        await AssetRepository.remove(combined);
        enqueueSnackbar(t("feedback.asset_removed"));
      }
    } catch (error) {
      enqueueSnackbar(t("feedback.asset_remove_error"))
      if (isDev) console.log(error)
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);
  const onAssetEditorDismiss = () => dispatch({ type: "dismiss" })

  return (
    <InstantSearch searchClient={Client} indexName="archived">
      <Dialog
        fullScreen
        open={props.isOpen}
        TransitionComponent={SlideUpTransition}>
        <DialogToolbar
          title={t("navigation.archived")}
          onDismiss={props.onDismiss}
          onSearchFocusChanged={onSearchInvoked}/>
        <DialogContent
          dividers={true}
          sx={{
            minHeight: '60vh',
            paddingX: 0,
            '& .MuiList-padding': { padding: 0 }
          }}>
          {
            canRead
              ? <>
                  <Box sx={(theme) => ({ height: '100%', padding: 3, display: { xs: 'none', sm: 'block'}, ...getDataGridTheme(theme) })}>
                    <ArchivedDataGrid
                      items={items}
                      canBack={isStart}
                      canForward={isEnd}
                      isLoading={isLoading}
                      isSearching={search}
                      sortMethod={sortMethod}
                      onBackward={getPrev}
                      onForward={getNext}
                      onItemSelect={onDataGridRowDoubleClicked}
                      onArchive={onAssetArchive}
                      onRemove={onAssetRemove}
                      onSortMethodChanged={onSortMethodChange}/>
                  </Box>
                  <Box sx={{ display: { xs: 'block', sm: 'none' }, height: 'inherit' }}>
                    {
                      !isLoading
                        ? items.length < 1
                          ? <ArchivedEmptyState/>
                          : <AssetList assets={items} onItemSelect={onAssetSelected}/>
                        : <LinearProgress/>
                    }
                  </Box>
                </>
              : <ErrorNoPermissionState/>
          }
        </DialogContent>
      </Dialog>
      <AssetEditor
        isOpen={state.isOpen}
        isCreate={state.isCreate}
        asset={state.asset}
        onDismiss={onAssetEditorDismiss}/>
    </InstantSearch>
  )
}

export default ArchivedScreen;