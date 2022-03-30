import { useEffect, useState, useReducer } from "react";
import { useTranslation } from "react-i18next";
import {Box, Button, Hidden, IconButton, LinearProgress, MenuItem, Theme} from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import {
  DataGrid,
  GridRowParams,
  GridValueGetterParams,
  GridOverlay,
  GridCellParams
} from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import {
  LocalOfferRounded,
  DesktopWindowsRounded,
  AddRounded,
  DeleteOutlineRounded,
  SearchOutlined
} from "@mui/icons-material";

import { query, collection, orderBy, onSnapshot } from "firebase/firestore";

import GridLinearProgress from "../../components/GridLinearProgress";
import GridToolbar from "../../components/GridToolbar";
import ComponentHeader from "../../components/ComponentHeader";
import EmptyStateComponent from "../state/EmptyStates";

import { usePermissions } from "../auth/AuthProvider";
import { Asset, AssetRepository } from "./Asset";
import AssetList from "./AssetList";
import AssetSearchScreen from "./AssetSearchScreen";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { usePreferences } from "../settings/Preference";
import { getDataGridTheme } from "../core/Core";

import {
  assetCollection,
  assetStockNumber,
  assetDescription,
  assetType,
  assetClassification,
  assetUnitOfMeasure,
  assetUnitValue,
  assetRemarks,
} from "../../shared/const";

import {
  ActionType,
  initialState,
  reducer
} from "./AssetEditorReducer";

import AssetEditor from "./AssetEditor";
import TypeScreen from "../type/TypeScreen";
import ConfirmationDialog from "../shared/ConfirmationDialog";
import PageHeader from "../../components/PageHeader";
import { firestore } from "../../index";

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

type AssetScreenProps = {
  onDrawerToggle: () => void
}

const AssetScreen = (props: AssetScreenProps) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { canRead, canWrite } = usePermissions();
  const userPreference = usePreferences();
  const [asset, setAsset] = useState<Asset | undefined>(undefined);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onSnapshot(query(collection(firestore, assetCollection), orderBy(assetDescription, "asc")), (snapshot) => {
      if (mounted) {
        setAssets(snapshot.docs.map((doc) => doc.data() as Asset));
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    }
  }, []);

  const onRemoveInvoke = (asset: Asset) => setAsset(asset);
  const onRemoveDismiss = () => setAsset(undefined);
  const onAssetRemove = () => {
    if (asset !== undefined) {
      AssetRepository.remove(asset)
        .then(() => enqueueSnackbar(t("feedback.asset_removed")))
        .catch(() => enqueueSnackbar(t("feedback.asset_remove_error")))
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
      field: "delete",
      headerName: t("button.delete"),
      flex: 0.5,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const asset = params.row as Asset;
        return (
          <IconButton
            aria-label={t("button.delete")}
            onClick={() => onRemoveInvoke(asset)}
            size="large">
            <DeleteOutlineRounded/>
          </IconButton>
        );
      }
    }
  ];

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

  const [search, setSearch] = useState<boolean>(false);
  const onSearchInvoke = () => setSearch(true);
  const onSearchDismiss = () => setSearch(false);

  const [isCategoryOpen, setCategoryOpen] = useState(false);
  const onCategoryListView = () => setCategoryOpen(true)
  const onCategoryListDismiss = () => setCategoryOpen(false)

  const menuItems = [
    <MenuItem key={0} onClick={onCategoryListView}>{t("navigation.categories")}</MenuItem>
  ];

  return (
    <Box className={classes.root}>
      <Hidden mdDown>
        <PageHeader
          title={t("navigation.assets")}
          buttonText={
            canWrite
              ? t("button.create_asset")
              : undefined
          }
          buttonIcon={AddRounded}
          buttonOnClick={() => dispatch({ type: ActionType.CREATE })}/>
      </Hidden>
      <Hidden mdUp>
        <ComponentHeader
          title={t("navigation.assets")}
          onDrawerToggle={props.onDrawerToggle}
          buttonText={
            canWrite
              ? t("button.create_asset")
              : undefined
          }
          buttonIcon={AddRounded}
          buttonOnClick={() => dispatch({ type: ActionType.CREATE })}
          onSearch={onSearchInvoke}
          menuItems={menuItems} />
      </Hidden>
      {canRead
        ? <>
          <Hidden smDown>
            <Box className={classes.wrapper}>
              <DataGrid
                components={{
                  LoadingOverlay: GridLinearProgress,
                  NoRowsOverlay: EmptyStateOverlay,
                  Toolbar: GridToolbar
                }}
                componentsProps={{
                  toolbar: {
                    endAction: <IconButton size="small" onClick={onSearchInvoke}><SearchOutlined/></IconButton>,
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
                rows={assets}
                columns={columns}
                density={userPreference.density}
                pageSize={20}
                loading={isLoading}
                paginationMode="client"
                getRowId={(r) => r.stockNumber}
                onRowDoubleClick={onDataGridRowDoubleClicked}/>
            </Box>
          </Hidden>
          <Hidden smUp>
            {!isLoading
              ? assets.length < 1
                ? <AssetEmptyState />
                : <AssetList
                    assets={assets}
                    onItemSelect={onAssetSelected}
                    onItemRemove={onRemoveInvoke} />
              : <LinearProgress />
            }
          </Hidden>
        </>
        : <ErrorNoPermissionState />
      }
      {state.isOpen &&
        <AssetEditor
          isOpen={state.isOpen}
          isCreate={state.isCreate}
          asset={state.asset}
          onDismiss={onAssetEditorDismiss} />
      }
      {search &&
        <AssetSearchScreen
          isOpen={search}
          onDismiss={onSearchDismiss}
          onEditorInvoke={onAssetSelected} />
      }
      <TypeScreen
        isOpen={isCategoryOpen}
        onDismiss={onCategoryListDismiss} />
      {asset &&
        <ConfirmationDialog
          isOpen={asset !== undefined}
          title="dialog.asset_remove"
          summary="dialog.asset_remove_summary"
          onDismiss={onRemoveDismiss}
          onConfirm={onAssetRemove} />
      }
    </Box>
  );
}

const EmptyStateOverlay = () => {
  return (
    <GridOverlay>
      <AssetEmptyState />
    </GridOverlay>
  )
}

const AssetEmptyState = () => {
  const { t } = useTranslation();

  return (
    <EmptyStateComponent
      icon={DesktopWindowsRounded}
      title={t("empty_asset")}
      subtitle={t("empty_asset_summary")} />
  );
}

export default AssetScreen;