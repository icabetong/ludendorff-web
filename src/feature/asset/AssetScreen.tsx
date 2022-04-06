import { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Fab, Hidden, LinearProgress, MenuItem, Theme } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { DataGrid, GridActionsCellItem, GridRowParams, GridValueGetterParams } from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import { AddRounded, DeleteOutlineRounded, DesktopWindowsRounded, LocalOfferRounded, } from "@mui/icons-material";

import { collection, orderBy, query } from "firebase/firestore";

import GridLinearProgress from "../../components/GridLinearProgress";
import GridToolbar from "../../components/GridToolbar";
import EmptyStateComponent from "../state/EmptyStates";

import { usePermissions } from "../auth/AuthProvider";
import { Asset, AssetRepository } from "./Asset";
import AssetList from "./AssetList";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { getDataGridTheme } from "../core/Core";

import {
  assetClassification,
  assetCollection,
  assetDescription,
  assetRemarks,
  assetStockNumber,
  assetType,
  assetUnitOfMeasure,
  assetUnitValue,
} from "../../shared/const";

import { ActionType, initialState, reducer } from "./AssetEditorReducer";

import AssetEditor from "./AssetEditor";
import TypeScreen from "../type/TypeScreen";
import ConfirmationDialog from "../shared/ConfirmationDialog";
import { firestore } from "../../index";
import { usePagination } from "use-pagination-firestore";
import { DataGridPaginationController } from "../../components/PaginationController";
import { connectHits, InstantSearch } from "react-instantsearch-dom";
import { Provider } from "../../components/Search";
import { HitsProvided } from "react-instantsearch-core";
import { isDev } from "../../shared/utils";
import GridEmptyRow from "../../components/GridEmptyRows";
import { ScreenProps } from "../shared/ScreenProps";
import AdaptiveHeader from "../../components/AdaptiveHeader";
import useDensity from "../shared/useDensity";
import useColumnVisibilityModel from "../shared/useColumnVisibilityModel";
import useQueryLimit from "../shared/useQueryLimit";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: '100%',
    width: '100%',
  },
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
  const { density, onDensityChanged } = useDensity('assetDensity');
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

  const columns = [
    { field: assetStockNumber, headerName: t("field.stock_number"), flex: 1 },
    { field: assetDescription, headerName: t("field.asset_description"), flex: 1.5 },
    {
      field: assetType,
      headerName: t("field.type"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        let asset = params.row as Asset;
        return asset.type?.typeName === undefined ? t("unknown") : asset.type?.typeName;
      }
    },
    {
      field: assetClassification,
      headerName: t("field.classification"),
      flex: 1,
    },
    {
      field: assetUnitOfMeasure,
      headerName: t("field.unit_of_measure"),
      flex: 1
    },
    {
      field: assetUnitValue,
      headerName: t("field.unit_value"),
      flex: 1
    },
    {
      field: assetRemarks,
      headerName: t("field.remarks"),
      flex: 1
    },
    {
      field: "actions",
      type: "actions",
      flex: 0.5,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<DeleteOutlineRounded/>}
          label={t("button.delete")}
          onClick={() => onRemoveInvoke(params.row as Asset)}/>
      ],
    }
  ];
  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('assetColumns', columns);

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

  const pagination = () => {
    return (
      <DataGridPaginationController
        size={limit}
        canBack={isStart}
        canForward={isEnd}
        onBackward={getPrev}
        onForward={getNext}
        onPageSizeChanged={onLimitChanged}/>
    )
  }

  const dataGrid = (
    <DataGrid
      components={{
        LoadingOverlay: GridLinearProgress,
        NoRowsOverlay: AssetDataGridEmptyRows,
        Toolbar: GridToolbar,
        Pagination: pagination
      }}
      componentsProps={{
        toolbar: {
          destinations: [
            <Button
              key="types"
              color="primary"
              size="small"
              startIcon={<LocalOfferRounded fontSize="small"/>}
              onClick={onCategoryListView}>
              {t("navigation.types")}
            </Button>
          ]
        }
      }}
      rows={items}
      columns={columns}
      density={density}
      loading={isLoading}
      columnVisibilityModel={visibleColumns}
      getRowId={(r) => r.stockNumber}
      onRowDoubleClick={onDataGridRowDoubleClicked}
      onStateChange={(v) => onDensityChanged(v.density.value)}
      onColumnVisibilityModelChange={(newModel) =>
        onVisibilityChange(newModel)
      }/>
  );

  return (
    <Box className={classes.root}>
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
            <Hidden smDown>
              <Box className={classes.wrapper}>
                {searchMode
                  ? <AssetDataGrid
                    onItemSelect={onDataGridRowDoubleClicked}
                    onRemoveInvoke={onRemoveInvoke}
                    onCategoryInvoke={onCategoryListView}/>
                  : dataGrid
                }
              </Box>
            </Hidden>
            <Hidden smUp>
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
            </Hidden>
          </>
          : <ErrorNoPermissionState/>
        }
      </InstantSearch>
      {state.isOpen &&
        <AssetEditor
          isOpen={state.isOpen}
          isCreate={state.isCreate}
          asset={state.asset}
          onDismiss={onAssetEditorDismiss}/>
      }
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

const AssetDataGridEmptyRows = () => {
  return (
    <GridEmptyRow>
      <AssetEmptyState/>
    </GridEmptyRow>
  )
}

const AssetEmptyState = () => {
  const { t } = useTranslation();

  return (
    <EmptyStateComponent
      icon={DesktopWindowsRounded}
      title={t("empty.asset")}
      subtitle={t("empty.asset_summary")}/>
  );
}

type AssetDataGridProps = HitsProvided<Asset> & {
  onItemSelect: (params: GridRowParams) => void,
  onRemoveInvoke: (asset: Asset) => void,
  onCategoryInvoke: () => void,
}
const AssetDataGridCore = (props: AssetDataGridProps) => {
  const { t } = useTranslation();
  const { density, onDensityChanged } = useDensity('assetDensity');

  const columns = [
    { field: assetStockNumber, headerName: t("field.stock_number"), flex: 1 },
    { field: assetDescription, headerName: t("field.asset_description"), flex: 1.5 },
    {
      field: assetType,
      headerName: t("field.type"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        let asset = params.row as Asset;
        return asset.type?.typeName === undefined ? t("unknown") : asset.type?.typeName;
      }
    },
    {
      field: assetClassification,
      headerName: t("field.classification"),
      flex: 1,
    },
    {
      field: assetUnitOfMeasure,
      headerName: t("field.unit_of_measure"),
      flex: 1
    },
    {
      field: assetUnitValue,
      headerName: t("field.unit_value"),
      flex: 1
    },
    {
      field: assetRemarks,
      headerName: t("field.remarks"),
      flex: 1
    },
    {
      field: "actions",
      type: "actions",
      flex: 0.5,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<DeleteOutlineRounded/>}
          label={t("button.delete")}
          onClick={() => props.onRemoveInvoke(params.row as Asset)}/>
      ],
    }
  ];
  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('assetColumns', columns);

  return (
    <DataGrid
      hideFooterPagination
      components={{
        LoadingOverlay: GridLinearProgress,
        NoRowsOverlay: AssetDataGridEmptyRows,
        Toolbar: GridToolbar,
      }}
      componentsProps={{
        toolbar: {
          destinations: [
            <Button
              key="types"
              color="primary"
              size="small"
              startIcon={<LocalOfferRounded fontSize="small"/>}
              onClick={props.onCategoryInvoke}>
              {t("navigation.types")}
            </Button>
          ]
        }
      }}
      columns={columns}
      rows={props.hits}
      density={density}
      columnVisibilityModel={visibleColumns}
      getRowId={(r) => r.stockNumber}
      onRowDoubleClick={props.onItemSelect}
      onStateChange={(v) => onDensityChanged(v.density.value)}
      onColumnVisibilityModelChange={(newModel) =>
        onVisibilityChange(newModel)
      }
    />
  )
}
const AssetDataGrid = connectHits<AssetDataGridProps, Asset>(AssetDataGridCore)

export default AssetScreen;