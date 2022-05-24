import { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { InstantSearch } from "react-instantsearch-core";
import { Alert, Box, Fab, LinearProgress, ListItemIcon, ListItemText, MenuItem, Snackbar } from "@mui/material";
import { GridRowParams } from "@mui/x-data-grid";
import { AddRounded, CategoryRounded } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { collection, orderBy, query, limit } from "firebase/firestore";
import { usePermissions } from "../auth/AuthProvider";
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
import usePagination from "../shared/hooks/usePagination";

type AssetScreenProps = ScreenProps
const AssetScreen = (props: AssetScreenProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { canRead, canWrite } = usePermissions();
  const [searchMode, setSearchMode] = useState(false);
  const [importMode, setImportMode] = useState(false);
  const { sortMethod, onSortMethodChange } = useSort('assetSort');
  const show = useDialog();
  const onImportInvoke = () => setImportMode(true);
  const onImportDismiss = () => setImportMode(false);

  const { items, isLoading, error, canBack, canForward, onBackward, onForward } = usePagination<Asset>(
    query(collection(firestore, assetCollection), orderBy(assetStockNumber, "asc"), limit(25)), assetStockNumber, 25
  );

  const onAssetRemove = async (asset: Asset) => {
    try {
      let result = await show({
        title: t("dialog.asset_remove"),
        description: t("dialog.asset_remove_summary"),
        confirmButtonText: t("button.delete"),
        dismissButtonText: t("button.cancel")
      });
      if (result) {
        await AssetRepository.remove(asset);
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
                canBack={canBack}
                canForward={canForward}
                isLoading={isLoading}
                isSearching={searchMode}
                sortMethod={sortMethod}
                onBackward={onBackward}
                onForward={onForward}
                onItemSelect={onDataGridRowDoubleClicked}
                onRemoveInvoke={onAssetRemove}
                onTypesInvoke={onCategoryListView}
                onImportsInvoke={onImportInvoke}
                onSortMethodChanged={onSortMethodChange}/>
            </Box>
            <Box sx={{ display: { xs: 'block', sm: 'none' }}}>
              {!isLoading
                ? items.length < 1
                  ? <AssetEmptyState/>
                  : <AssetList
                      assets={items}
                      onItemSelect={onAssetSelected}
                      onItemRemove={onAssetRemove}/>
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
      <CategoryScreen
        isOpen={isCategoryOpen}
        onDismiss={onCategoryListDismiss}/>
      <Snackbar open={Boolean(error)}>
        <Alert severity="error">
          {error?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AssetScreen;