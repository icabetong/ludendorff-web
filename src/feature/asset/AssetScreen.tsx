import { useState, useReducer } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Hidden,
  LinearProgress,
  MenuItem,
  Tooltip,
  makeStyles
} from "@material-ui/core";
import {
  DataGrid,
  GridRowParams,
  GridValueGetterParams,
  GridOverlay,
  GridCellParams
} from "@material-ui/data-grid";
import { useSnackbar } from "notistack";

import {
  DesktopComputerIcon,
  DuplicateIcon,
  PlusIcon,
  TrashIcon
} from "@heroicons/react/outline";
import firebase from "firebase";

import GridLinearProgress from "../../components/GridLinearProgress";
import GridToolbar from "../../components/GridToolbar";
import HeroIconButton from "../../components/HeroIconButton";
import PaginationController from "../../components/PaginationController";
import ComponentHeader from "../../components/ComponentHeader";
import EmptyStateComponent from "../state/EmptyStates";

import { usePermissions } from "../auth/AuthProvider";
import { Asset, AssetRepository, getStatusLoc, Status } from "./Asset";
import AssetList from "./AssetList";
import AssetSearchScreen from "./AssetSearchScreen";
import ReportScreen from "../report/ReportScreen";
import DuplicationDialog from "../shared/DuplicationDialog";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { usePreferences } from "../settings/Preference";

import { firestore } from "../../index";
import { usePagination } from "../../shared/pagination";
import { formatDate, newId } from "../../shared/utils";

import {
  assetCollection,
  assetId,
  assetName,
  assetCategory,
  dateCreated,
  assetStatus,
} from "../../shared/const";

import {
  ActionType,
  initialState,
  reducer
} from "./AssetEditorReducer";

import AssetEditor from "./AssetEditor";
import CategoryScreen from "../category/CategoryScreen";
import ConfirmationDialog from "../shared/ConfirmationDialog";

const useStyles = makeStyles(() => ({
  root: {
    height: '100%',
    width: '100%',
  },
  wrapper: {
    height: '80%',
    padding: '1.4em'
  },
  editorContainer: {
    width: '100%',
    margin: '0.8em',
  },
  editor: {
    marginTop: '0.6em',
    marginBottom: '0.6em'
  },
  textField: {
    width: '100%'
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
    { field: assetId, headerName: t("field.id"), hide: true },
    { field: assetName, headerName: t("field.asset_name"), flex: 1 },
    {
      field: assetCategory,
      headerName: t("field.category"),
      flex: 0.5,
      valueGetter: (params: GridValueGetterParams) => {
        let asset = params.row as Asset;
        return asset.category?.categoryName === undefined ? t("unknown") : asset.category?.categoryName;
      }
    },
    {
      field: dateCreated,
      headerName: t("field.date_created"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        const formatted = formatDate(params.row.dateCreated);
        return formatted === 'unknown' ? t("unknown") : formatted;
      }
    },
    {
      field: assetStatus,
      headerName: t("field.status"),
      flex: 0.5,
      valueGetter: (params: GridValueGetterParams) => t(getStatusLoc(params.row.status))
    },
    {
      field: "copy",
      headerName: t("button.copy"),
      flex: 0.2,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const asset = params.row as Asset;
        return (
          <HeroIconButton
            icon={DuplicateIcon}
            aria-label={t("button.copy")}
            onClick={() => onCopyInvoke(asset)} />
        )
      }
    },
    {
      field: "delete",
      headerName: t("button.delete"),
      flex: 0.2,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const asset = params.row as Asset;
        const deleteButton = (
          <HeroIconButton
            icon={TrashIcon}
            aria-label={t("button.delete")}
            disabled={asset.status === Status.OPERATIONAL}
            onClick={() => onRemoveInvoke(asset)} />
        );
        return (
          <>
            {asset.status === Status.OPERATIONAL
              ? <Tooltip title={<>{t("info.asset_has_assignment_delete")}</>} placement="bottom">
                <span>{deleteButton}</span>
              </Tooltip>
              : <>{deleteButton}</>
            }
          </>
        )
      }
    }
  ];

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Asset>(
    firestore
      .collection(assetCollection)
      .orderBy(assetName, "asc"), { limit: 15 }
  )

  const [state, dispatch] = useReducer(reducer, initialState);
  const onAssetEditorDismiss = () => dispatch({ type: ActionType.DISMISS })

  const [assetCopy, setAssetCopy] = useState<Asset | undefined>(undefined);
  const onCopyInvoke = (asset: Asset) => setAssetCopy(asset);
  const onCopyDismiss = () => setAssetCopy(undefined);

  const onCopyConfirmed = (copies: number) => {
    let assets: Asset[] = [];
    for (let index = 0; index <= copies; index++) {
      assets.push({ ...assetCopy, assetId: newId(), dateCreated: firebase.firestore.Timestamp.now() });
    }
    AssetRepository.createFromList(assets);
    onCopyDismiss();
  }

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

  const [reports, setReports] = useState(false);
  const onReportsInvoke = () => setReports(!reports);

  const [isCategoryOpen, setCategoryOpen] = useState(false);
  const onCategoryListView = () => setCategoryOpen(true)
  const onCategoryListDismiss = () => setCategoryOpen(false)

  return (
    <Box className={classes.root}>
      <ComponentHeader
        title={t("navigation.assets")}
        onDrawerToggle={props.onDrawerToggle}
        buttonText={
          canWrite
            ? t("button.add")
            : undefined
        }
        buttonIcon={PlusIcon}
        buttonOnClick={() => dispatch({ type: ActionType.CREATE })}
        onSearch={onSearchInvoke}
        menuItems={[
          <MenuItem key={0} onClick={onCategoryListView}>{t("navigation.categories")}</MenuItem>
        ]} />
      {canRead
        ? <>
          <Hidden xsDown>
            <div className={classes.wrapper}>
              <DataGrid
                components={{
                  LoadingOverlay: GridLinearProgress,
                  NoRowsOverlay: EmptyStateOverlay,
                  Toolbar: GridToolbar
                }}
                rows={items}
                columns={columns}
                density={userPreference.density}
                pageSize={15}
                loading={isLoading}
                paginationMode="server"
                getRowId={(r) => r.assetId}
                onRowDoubleClick={onDataGridRowDoubleClicked}
                hideFooter />
            </div>
          </Hidden>
          <Hidden smUp>
            {!isLoading
              ? items.length < 1
                ? <AssetEmptyState />
                : <AssetList
                  assets={items}
                  onItemSelect={onAssetSelected}
                  onItemRemove={onRemoveInvoke} />
              : <LinearProgress />
            }
          </Hidden>
          <PaginationController
            hasPrevious={isStart || items.length === 0}
            hasNext={isEnd}
            getPrevious={getPrev}
            getNext={getNext} />
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
      <CategoryScreen
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
      {assetCopy &&
        <DuplicationDialog
          isOpen={assetCopy !== undefined}
          onConfirm={onCopyConfirmed}
          onDismiss={onCopyDismiss} />
      }
      {reports &&
        <ReportScreen
          isOpen={reports}
          onDismiss={onReportsInvoke} />
      }
    </Box>
  )
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
      icon={DesktopComputerIcon}
      title={t("empty_asset")}
      subtitle={t("empty_asset_summary")} />
  )
}

export default AssetScreen;