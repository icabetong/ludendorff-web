import { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { InstantSearch } from "react-instantsearch-core";
import { Box, Fab, LinearProgress, ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { GridRowParams } from "@mui/x-data-grid";
import { AddRounded, CategoryRounded } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { collection, orderBy, query } from "firebase/firestore";
import { OrderByDirection } from "@firebase/firestore-types";
import { usePagination } from "use-pagination-firestore";
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
import useQueryLimit from "../shared/hooks/useQueryLimit";
import useSort from "../shared/hooks/useSort";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import AdaptiveHeader from "../../components/AdaptiveHeader";
import { useDialog } from "../../components/DialogProvider";
import { isDev } from "../../shared/utils";
import { ScreenProps } from "../shared/types/ScreenProps";
import {
  assetCollection,
  assetDescription,
} from "../../shared/const";
import { firestore } from "../../index";

type AssetScreenProps = ScreenProps
const AssetScreen = (props: AssetScreenProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { canRead, canWrite } = usePermissions();
  const { limit, onLimitChanged } = useQueryLimit('assetQueryLimit');
  const [searchMode, setSearchMode] = useState(false);
  const [importMode, setImportMode] = useState(false);
  const { sortMethod, onSortMethodChange } = useSort('assetSort');
  const show = useDialog();

  const onImportInvoke = () => setImportMode(true);
  const onImportDismiss = () => setImportMode(false);

  const onParseQuery = () => {
    let field = assetDescription;
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

    return query(collection(firestore, assetCollection), orderBy(field, direction))
  }

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Asset>(
    onParseQuery(), { limit: limit }
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
                size={limit}
                canBack={isStart}
                canForward={isEnd}
                isLoading={isLoading}
                isSearching={searchMode}
                sortMethod={sortMethod}
                onBackward={getPrev}
                onForward={getNext}
                onItemSelect={onDataGridRowDoubleClicked}
                onRemoveInvoke={onAssetRemove}
                onTypesInvoke={onCategoryListView}
                onImportsInvoke={onImportInvoke}
                onPageSizeChanged={onLimitChanged}
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
    </Box>
  );
}

export default AssetScreen;