import { useState, useReducer, lazy } from "react";
import { useTranslation } from "react-i18next";
import Box from "@material-ui/core/Box";
import Hidden from "@material-ui/core/Hidden";
import LinearProgress from "@material-ui/core/LinearProgress";
import MenuItem from "@material-ui/core/MenuItem";
import Tooltip from "@material-ui/core/Tooltip";
import { makeStyles } from "@material-ui/core/styles";
import { DataGrid, GridRowParams, GridValueGetterParams, GridOverlay, GridCellParams } from "@material-ui/data-grid";
import { useSnackbar } from "notistack";

import DesktopComputerIcon from "@heroicons/react/outline/DesktopComputerIcon";
import PlusIcon from "@heroicons/react/outline/PlusIcon";
import TrashIcon from "@heroicons/react/outline/TrashIcon";

import GridLinearProgress from "../../components/GridLinearProgress";
import GridToolbar from "../../components/GridToolbar";
import HeroIconButton from "../../components/HeroIconButton";
import PaginationController from "../../components/PaginationController";
import ComponentHeader from "../../components/ComponentHeader";
import EmptyStateComponent from "../state/EmptyStates";

import { usePermissions } from "../auth/AuthProvider";
import { Asset, AssetRepository, getStatusLoc, Status } from "./Asset";
import AssetList from "./AssetList";
import { Category } from "../category/Category";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { usePreferences } from "../settings/Preference";

import { firestore } from "../../index";
import { usePagination } from "../../shared/pagination";
import { formatDate } from "../../shared/utils";

import {
    assetCollection,
    categoryCollection,
    assetId,
    assetName,
    assetCategory,
    dateCreated,
    assetStatus,
    categoryName
} from "../../shared/const";

import {
    AssetEditorActionType,
    assetEditorInitialState,
    assetEditorReducer
} from "./AssetEditorReducer";

import ConfirmationDialog from "../shared/ItemRemoveDialog";
const AssetEditor = lazy(() => import("./AssetEditor"));
const CategoryScreen = lazy(() => import("../category/CategoryScreen"));

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
            .catch(() =>  enqueueSnackbar(t("feedback.asset_remove_error")))
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
                return formatted === 'unknown' ? t("not_yet_returned") : formatted;

            } 
        },
        { 
            field: assetStatus, 
            headerName: t("field.status"), 
            flex: 0.5, 
            valueGetter: (params: GridValueGetterParams) => t(getStatusLoc(params.row.status)) 
        },
        {
            field: "delete",
            headerName: t("button.delete"),
            flex: 0.4,
            disableColumnMenu: true,
            sortable: false,
            renderCell: (params: GridCellParams) => {
                const asset = params.row as Asset;
                const deleteButton = (
                    <HeroIconButton 
                        icon={TrashIcon}
                        aria-label={t("delete")}
                        disabled={asset.status === Status.OPERATIONAL}
                        onClick={() => onRemoveInvoke(asset)}/>
                );
                return (
                    <>
                    { asset.status === Status.OPERATIONAL
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

    const {
        items: assets,
        isLoading: isAssetsLoading,
        isStart: atAssetStart,
        isEnd: atAssetEnd,
        getPrev: getPreviousAssets,
        getNext: getNextAssets,
    } = usePagination<Asset>(
        firestore
            .collection(assetCollection)
            .orderBy(assetName, "asc"), { limit: 15 }
    )

    const [editorState, editorDispatch] = useReducer(assetEditorReducer, assetEditorInitialState);
    const onAssetEditorDismiss = () => editorDispatch({ type: AssetEditorActionType.DISMISS })

    const onDataGridRowDoubleClicked = (params: GridRowParams) => {
        onAssetSelected(params.row as Asset);
    }

    const onAssetSelected = (asset: Asset) => {
        editorDispatch({
            type: AssetEditorActionType.UPDATE,
            payload: asset
        })
    }

    const {
        items: categories,
        isLoading: isCategoriesLoading,
        isStart: atCategoryStart,
        isEnd: atCategoryEnd,
        getPrev: getPreviousCategories,
        getNext: getNextCategories
    } = usePagination<Category>(
        firestore
            .collection(categoryCollection)
            .orderBy(categoryName, "asc"), { limit: 15 }   
    )

    const [isCategoryOpen, setCategoryOpen] = useState(false);
    const onCategoryListView = () => setCategoryOpen(true)
    const onCategoryListDismiss = () => setCategoryOpen(false)
    
    return (
        <Box className={classes.root}>
            <ComponentHeader 
                title={ t("navigation.assets") } 
                onDrawerToggle={props.onDrawerToggle} 
                buttonText={
                    canWrite
                    ? t("button.add") 
                    : undefined
                }
                buttonIcon={PlusIcon}
                buttonOnClick={() => editorDispatch({ type: AssetEditorActionType.CREATE }) }
                menuItems={[
                    <MenuItem key={0} onClick={onCategoryListView}>{ t("navigation.categories") }</MenuItem>
                ]}/>
            { canRead
                ? <>
                    <Hidden xsDown>
                        <div className={classes.wrapper}>
                            <DataGrid
                                components={{
                                    LoadingOverlay: GridLinearProgress,
                                    NoRowsOverlay: EmptyStateOverlay,
                                    Toolbar: GridToolbar
                                }}
                                rows={assets}
                                columns={columns}
                                density={userPreference.density}
                                pageSize={15}
                                loading={isAssetsLoading}
                                paginationMode="server"
                                getRowId={(r) => r.assetId}
                                onRowDoubleClick={onDataGridRowDoubleClicked}
                                hideFooter/>
                        </div>
                    </Hidden>
                    <Hidden smUp>
                        { !isAssetsLoading 
                            ? assets.length < 1 
                                ? <AssetEmptyState/>
                                : <AssetList assets={assets} onItemSelect={onAssetSelected}/>
                            : <LinearProgress/>
                        }
                    </Hidden>
                    { !atAssetStart && !atAssetEnd &&
                        <PaginationController
                            hasPrevious={atAssetStart}
                            hasNext={atAssetEnd}
                            getPrevious={getPreviousAssets}
                            getNext={getNextAssets}/>
                    }
                </>
                : <ErrorNoPermissionState/>
            }
            { editorState.isOpen &&
                <AssetEditor
                    isOpen={editorState.isOpen}
                    isCreate={editorState.isCreate}
                    asset={editorState.asset}
                    onDismiss={onAssetEditorDismiss}/>
            }
            { isCategoryOpen &&
                <CategoryScreen
                    isOpen={isCategoryOpen}
                    categories={categories}
                    isLoading={isCategoriesLoading}
                    hasPrevious={atCategoryStart}
                    hasNext={atCategoryEnd}
                    onPreviousBatch={getPreviousCategories}
                    onNextBatch={getNextCategories}
                    onDismiss={onCategoryListDismiss}/>
            }
            { asset &&
                <ConfirmationDialog
                    isOpen={asset !== undefined}
                    title="dialog.asset_remove"
                    summary="dialog.asset_remove_summary"
                    onDismiss={onRemoveDismiss}
                    onConfirm={onAssetRemove}/>
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
            title={ t("empty_asset") }
            subtitle={ t("empty_asset_summary")} />
    )
}

export default AssetScreen;