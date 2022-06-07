import { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { InstantSearch } from "react-instantsearch-core";
import { Box, Fab, LinearProgress, ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { GridRowParams } from "@mui/x-data-grid";
import { AddRounded, CategoryRounded } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { collection, orderBy, query } from "firebase/firestore";
import ArchivedScreen from "../archived/ArchivedScreen";
import { useAuthState, usePermissions } from "../auth/AuthProvider";
import { Asset, AssetRepository } from "./Asset";
import AssetDataGrid from "./AssetDataGrid";
import AssetEditor from "./AssetEditor";
import { initialState, reducer } from "./AssetEditorReducer";
import { AssetEmptyState } from "./AssetEmptyState";
import AssetImportScreen from "./AssetImportScreen";
import AssetList from "./AssetList";
import CategoryScreen from "../category/CategoryScreen";
import { getDataGridTheme } from "../core/Core";
import Client from "../search/Client";
import useSort from "../shared/hooks/useSort";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { AdaptiveHeader } from "../../components/AdaptiveHeader";
import { useDialog } from "../../components/dialog/DialogProvider";
import { isDev } from "../../shared/utils";
import { ScreenProps } from "../shared/types/ScreenProps";
import {
  assetCollection,
  assetStockNumber,
} from "../../shared/const";
import { firestore } from "../../index";
import { usePagination } from "use-pagination-firestore";


type AssetScreenProps = ScreenProps
const AssetScreen = (props: AssetScreenProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthState();
  const { canRead, canWrite } = usePermissions();
  const [searchMode, setSearchMode] = useState(false);
  const [importMode, setImportMode] = useState(false);
  const [archived, setArchived] = useState(false);
  const { sortMethod, onSortMethodChange } = useSort('assetSort');
  const show = useDialog();
  const onImportInvoke = () => setImportMode(true);
  const onImportDismiss = () => setImportMode(false);

  const onArchivedView = () => setArchived(true);
  const onArchivedDismiss = () => setArchived(false);

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Asset>(
    query(collection(firestore, assetCollection), orderBy(assetStockNumber, "asc")),
    { limit: 25 }
  );

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
        await AssetRepository.archive(combined);
        enqueueSnackbar(t("feedback.asset_archived"));
      }
    } catch (error) {
      enqueueSnackbar(t("feedback.asset_archive_error"))
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
  const onDataGridRowDoubleClicked = (params: GridRowParams) => {
    onAssetSelected(params.row as Asset);
  }

  const onAssetSelected = (asset: Asset) => {
    dispatch({
      type: "update",
      payload: asset
    })
  }

  const [isCategoryOpen, setCategoryOpen] = useState(false);
  const onCategoryListView = () => setCategoryOpen(true);
  const onCategoryListDismiss = () => setCategoryOpen(false);

  const menuItems = [
    <MenuItem
      key={0}
      onClick={onCategoryListView}>
      <ListItemIcon><CategoryRounded/></ListItemIcon>
      <ListItemText>{t("navigation.categories")}</ListItemText>
    </MenuItem>
  ];

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <InstantSearch
        searchClient={Client}
        indexName="assets">
        <AdaptiveHeader
          title={t("navigation.assets")}
          actionText={canWrite ? t("button.create_asset") : undefined}
          menuItems={menuItems}
          onActionEvent={() => dispatch({ type: "create" })}
          onDrawerTriggered={props.onDrawerToggle}
          onSearchFocusChanged={setSearchMode}/>
        {canRead
          ? <>
            <Box sx={(theme) => ({ flex: 1, padding: 3, display: { xs: 'none', sm: 'block' }, ...getDataGridTheme(theme)})}>
              <AssetDataGrid
                items={items}
                canBack={isStart}
                canForward={isEnd}
                isLoading={isLoading}
                isSearching={searchMode}
                sortMethod={sortMethod}
                onBackward={getPrev}
                onForward={getNext}
                onItemSelect={onDataGridRowDoubleClicked}
                onArchive={onAssetArchive}
                onRemove={onAssetRemove}
                onTypesInvoke={onCategoryListView}
                onImportsInvoke={onImportInvoke}
                onSortMethodChanged={onSortMethodChange}
                onArchivedInvoke={onArchivedView}/>
            </Box>
            <Box sx={{ display: { xs: 'block', sm: 'none' }, height: 'inherit' }}>
              {!isLoading
                ? items.length < 1
                  ? <AssetEmptyState/>
                  : <AssetList
                      assets={items}
                      onItemSelect={onAssetSelected}/>
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
      <AssetEditor
        isOpen={state.isOpen}
        isCreate={state.isCreate}
        asset={state.asset}
        onDismiss={onAssetEditorDismiss}/>
      <AssetImportScreen isOpen={importMode} onDismiss={onImportDismiss}/>
      <ArchivedScreen isOpen={archived} onDismiss={onArchivedDismiss}/>
      <CategoryScreen
        isOpen={isCategoryOpen}
        onDismiss={onCategoryListDismiss}/>
    </Box>
  );
}

export default AssetScreen;