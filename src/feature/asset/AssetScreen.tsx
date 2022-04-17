import { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Fab, LinearProgress, MenuItem, Theme } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { GridRowParams } from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import { AddRounded } from "@mui/icons-material";
import { collection, orderBy, query } from "firebase/firestore";
import { usePermissions } from "../auth/AuthProvider";
import { Asset, AssetRepository } from "./Asset";
import AssetList from "./AssetList";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { getDataGridTheme } from "../core/Core";
import {
  assetCollection,
  assetDescription,
} from "../../shared/const";
import { ActionType, initialState, reducer } from "./AssetEditorReducer";
import AssetEditor from "./AssetEditor";
import TypeScreen from "../type/TypeScreen";
import ConfirmationDialog from "../shared/ConfirmationDialog";
import { firestore } from "../../index";
import { usePagination } from "use-pagination-firestore";
import { InstantSearch } from "react-instantsearch-dom";
import { Provider } from "../../components/Search";
import { isDev } from "../../shared/utils";
import { ScreenProps } from "../shared/types/ScreenProps";
import AdaptiveHeader from "../../components/AdaptiveHeader";
import useQueryLimit from "../shared/hooks/useQueryLimit";
import AssetDataGrid from "./AssetDataGrid";
import { AssetEmptyState } from "./AssetEmptyState";

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    height: '90%',
    padding: '1.4em',
    ...getDataGridTheme(theme)
  },
}));

type AssetScreenProps = ScreenProps
const AssetScreen = (props: AssetScreenProps) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { canRead, canWrite } = usePermissions();
  const { limit, onLimitChanged } = useQueryLimit('assetQueryLimit');
  const [asset, setAsset] = useState<Asset | null>(null);
  const [searchMode, setSearchMode] = useState(false);

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Asset>(
    query(collection(firestore, assetCollection), orderBy(assetDescription, "asc")), { limit: limit }
  );

  const onRemoveInvoke = (asset: Asset) => setAsset(asset);
  const onRemoveDismiss = () => setAsset(null);
  const onAssetRemove = () => {
    if (asset !== null) {
      AssetRepository.remove(asset)
        .then(() => enqueueSnackbar(t("feedback.asset_removed")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.asset_remove_error"))
          if (isDev) console.log(error)
        })
        .finally(onRemoveDismiss)
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);
  const onAssetEditorDismiss = () => dispatch({ type: ActionType.DISMISS })
  const onDataGridRowDoubleClicked = (params: GridRowParams) => {
    onAssetSelected(params.row as Asset);
  }

  const onAssetSelected = (asset: Asset) => {
    dispatch({
      type: ActionType.UPDATE,
      payload: asset
    })
  }

  const [isCategoryOpen, setCategoryOpen] = useState(false);
  const onCategoryListView = () => setCategoryOpen(true);
  const onCategoryListDismiss = () => setCategoryOpen(false);

  const menuItems = [
    <MenuItem
      key={0}
      onClick={onCategoryListView}>{t("navigation.types")}</MenuItem>
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <InstantSearch
        searchClient={Provider}
        indexName="assets">
        <AdaptiveHeader
          title={t("navigation.assets")}
          actionText={canWrite ? t("button.create_asset") : undefined}
          menuItems={menuItems}
          onActionEvent={() => dispatch({ type: ActionType.CREATE })}
          onDrawerTriggered={props.onDrawerToggle}
          onSearchFocusChanged={setSearchMode}/>
        {canRead
          ? <>
            <Box className={classes.wrapper} sx={{ display: { xs: 'none', sm: 'block' }}}>
              <AssetDataGrid
                items={items}
                size={limit}
                canBack={isStart}
                canForward={isEnd}
                isLoading={isLoading}
                isSearching={searchMode}
                onBackward={getPrev}
                onForward={getNext}
                onItemSelect={onDataGridRowDoubleClicked}
                onRemoveInvoke={onRemoveInvoke}
                onTypesInvoke={onCategoryListView}
                onPageSizeChanged={onLimitChanged}/>
            </Box>
            <Box sx={{ display: { xs: 'block', sm: 'none' }}}>
              {!isLoading
                ? items.length < 1
                  ? <AssetEmptyState/>
                  : <AssetList
                      assets={items}
                      onItemSelect={onAssetSelected}
                      onItemRemove={onRemoveInvoke}/>
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
      <AssetEditor
        isOpen={state.isOpen}
        isCreate={state.isCreate}
        asset={state.asset}
        onDismiss={onAssetEditorDismiss}/>
      <TypeScreen
        isOpen={isCategoryOpen}
        onDismiss={onCategoryListDismiss}/>
      <ConfirmationDialog
        isOpen={Boolean(asset)}
        title="dialog.asset_remove"
        summary="dialog.asset_remove_summary"
        onDismiss={onRemoveDismiss}
        onConfirm={onAssetRemove}/>
    </Box>
  );
}

export default AssetScreen;