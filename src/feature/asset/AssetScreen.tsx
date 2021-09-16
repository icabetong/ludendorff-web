import { useState, useReducer, lazy } from "react";
import { useTranslation } from "react-i18next";
import Box from "@material-ui/core/Box";
import Hidden from "@material-ui/core/Hidden";
import LinearProgress from "@material-ui/core/LinearProgress";
import MenuItem from "@material-ui/core/MenuItem";
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
import { Category, CategoryRepository } from "../category/Category";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { Specification } from "../specs/Specification";
import { usePreferences } from "../settings/Preference";

import firebase from "firebase/app";
import { firestore } from "../../index";
import { usePagination } from "../../shared/pagination";
import { newId, formatDate } from "../../shared/utils";

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

import {
    AssetRemoveActionType,
    assetRemoveInitialState,
    assetRemoveReducer
} from "./AssetRemoveReducer";

import {
    SpecificationEditorActionType,
    specificationEditorInitialState,
    specificationReducer
} from "../specs/SpecificationEditorReducer";

import { 
    CategoryEditorActionType, 
    categoryEditorInitialState, 
    categoryEditorReducer 
} from "../category/CategoryEditorReducer";

import {
    CategoryRemoveActionType,
    categoryRemoveInitialState,
    categoryRemoveReducer
} from "../category/CategoryRemoveReducer";

import ConfirmationDialog from "../shared/ItemRemoveDialog";

const AssetEditor = lazy(() => import("./AssetEditor"));
const QrCodeViewComponent = lazy(() => import("../qrcode/QrCodeViewComponent"));
const SpecificationEditor = lazy(() => import("../specs/SpecificationEditor"));

const CategoryScreen = lazy(() => import("../category/CategoryScreen"));
const CategoryPicker = lazy(() => import("../category/CategoryPicker"));
const CategoryEditorComponent = lazy(() => import("../category/CategoryEditor"));

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
            valueGetter: (params: GridValueGetterParams) => 
                t(formatDate(params.row.dateCreated)) 
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
            flex: 0.3,
            renderCell: (params: GridCellParams) => {
                return (
                    <HeroIconButton 
                        icon={TrashIcon}
                        aria-label={t("delete")}
                        disabled={(params.row as Asset).status === Status.OPERATIONAL}
                        onClick={() => onAssetItemRemoveRequest(params.row as Asset)}/>
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

    const [isQrCodeOpen, setQrCodeOpen] = useState<boolean>(false);
    const [editorState, editorDispatch] = useReducer(assetEditorReducer, assetEditorInitialState);
    const [removeState, removeDispatch] = useReducer(assetRemoveReducer, assetRemoveInitialState);
    const [specEditorState, specEditorDispatch] = useReducer(specificationReducer, specificationEditorInitialState);

    const onDataGridRowDoubleClicked = (params: GridRowParams) => {
        onAssetSelected(params.row as Asset);
    }

    const onAssetSelected = (asset: Asset) => {
        editorDispatch({
            type: AssetEditorActionType.UPDATE,
            payload: asset
        })
    }

    const onAssetEditorAddSpecification = () => {
        specEditorDispatch({
            type: SpecificationEditorActionType.CREATE
        })
    }

    const onAssetEditorDismiss = () => {
        editorDispatch({
            type: AssetEditorActionType.DISMISS
        })
    }

    const onAssetEditorNameChanged = (name: string) => {
        let asset = editorState.asset;
        if (asset === undefined)
            asset = { assetId: newId() }
        asset!.assetName = name;
        editorDispatch({
            type: AssetEditorActionType.CHANGED,
            payload: asset
        })
    }

    const onAssetEditorStatusChanged = (status: Status) => {
        let asset = editorState.asset;
        if (asset === undefined)
            asset = { assetId: newId() }
        asset!.status = status;
        editorDispatch({
            type: AssetEditorActionType.CHANGED,
            payload: asset
        })
    }

    const onAssetEditorCommit = () => {
        let asset = editorState.asset;
        if (asset !== undefined) {
            asset.dateCreated = firebase.firestore.Timestamp.now();
            if (editorState.isCreate) {
                AssetRepository.create(asset)
                    .then(() => {
                        enqueueSnackbar(t("feedback.asset_created"));

                    }).catch(() => {
                        enqueueSnackbar(t("feedback.asset_create_error"));

                    }).finally(() => {
                        editorDispatch({ type: AssetEditorActionType.DISMISS })
                    })
            } else {
                AssetRepository.update(asset)
                    .then(() => {
                        enqueueSnackbar(t("feedback.asset_updated"));

                    }).catch(() => {
                        enqueueSnackbar(t("feedback.asset_update_error"));

                    }).finally(() => {
                        editorDispatch({ type: AssetEditorActionType.DISMISS })
                    })
            }
        }
    }

    const onAssetCategorySelected = (category: Category) => {
        let asset = editorState.asset;
        if (asset === undefined)
            asset = { assetId: newId() }
        asset!.category = category;
        editorDispatch({
            type: AssetEditorActionType.CHANGED,
            payload: asset
        })
        setCategoryPickerOpen(false);
    }

    const onAssetItemRemoveRequest = (asset: Asset) => {
        removeDispatch({
            type: AssetRemoveActionType.REQUEST,
            payload: asset
        })
    }

    const onAssetItemRemove = () => {
        let asset = removeState.asset;
        if (asset === undefined)
            return;

        AssetRepository.remove(asset)
            .then(() => {
                enqueueSnackbar(t("feedback.asset_removed"));

            }).catch((error) => {
                console.log(error);
                enqueueSnackbar(t("feedback.asset_remove_error"));

            }).finally(() => {
                removeDispatch({
                    type: AssetRemoveActionType.DISMISS
                })
            })
    }

    const onSpecificationItemSelected = (spec: [string, string]) => {
        specEditorDispatch({
            type: SpecificationEditorActionType.UPDATE,
            payload: spec,
        })
    }

    const onSpecificationKeyChanged = (key: string) => {
        let specification = specEditorState.specification;
        if (specification === undefined)
            specification = ['', ''];
        specification[0] = key;
        specEditorDispatch({
            type: SpecificationEditorActionType.CHANGED,
            payload: specification
        })
    }

    const onSpecificationValueChanged = (value: string) => {
        let specification = specEditorState.specification;
        if (specification === undefined)
            specification = ['', ''];
        specification[1] = value;
        specEditorDispatch({
            type: SpecificationEditorActionType.CHANGED,
            payload: specification
        })
    }

    const onSpecificationEditorCommit = () => {
        let asset = editorState.asset;
        if (asset === undefined)
            asset = { assetId: newId() }

        let specification = specEditorState.specification;
        if (specification !== undefined) {
            let specifications: Specification = {};
            specifications[specification[0]] = specification[1];
            asset!.specifications = specifications;
    
            specEditorDispatch({
                type: SpecificationEditorActionType.DISMISS
            })
            editorDispatch({
                type: AssetEditorActionType.CHANGED,
                payload: asset
            })
        }
    }

    const onSpecificationEditorDismiss = () => {
        specEditorDispatch({ 
            type: SpecificationEditorActionType.DISMISS 
        })
    }

    const onQrCodeView = () => { setQrCodeOpen(true) }
    const onQrCodeViewDismiss = () => { setQrCodeOpen(false) }

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

    const [isCategoryListOpen, setCategoryListOpen] = useState(false);
    const [isCategoryPickerOpen, setCategoryPickerOpen] = useState(false);
    
    const [categoryEditorState, categoryEditorDispatch] = useReducer(categoryEditorReducer, categoryEditorInitialState);
    const [categoryRemoveState, categoryRemoveDispatch] = useReducer(categoryRemoveReducer, categoryRemoveInitialState);
    
    const onCategoryListView = () => { setCategoryListOpen(true) }
    const onCategoryListDismiss = () => { setCategoryListOpen(false) }

    const onCategoryItemSelected = (category: Category) => {
        categoryEditorDispatch({
            type: CategoryEditorActionType.UPDATE,
            payload: category,
        })
    }

    const onCategoryItemRequestRemove = (category: Category) => {
        categoryRemoveDispatch({
            type: CategoryRemoveActionType.REQUEST,
            payload: category
        })
    }

    const onCategoryItemRemove = () => {
        let category = categoryRemoveState.category;
        if (category === undefined) 
            return;

        CategoryRepository.remove(category)
            .then(() => {
                enqueueSnackbar(t("feedback.category_removed"));

            }).catch(() => {
                enqueueSnackbar(t("feedback.category_remove_error"));

            }).finally(() => {
                categoryRemoveDispatch({
                    type: CategoryRemoveActionType.DISMISS
                })
            })
    }

    const onCategoryNameChanged = (name: string) => {
        let category = categoryEditorState.category;
        if (category === undefined)
            category = { categoryId: newId(), count: 0 }
        category!.categoryName = name;
        return categoryEditorDispatch({
            payload: category!,
            type: CategoryEditorActionType.CHANGED
        })
    }

    const onCategoryEditorView = () => {
        categoryEditorDispatch({
            type: CategoryEditorActionType.CREATE
        })
    }

    const onCategoryEditorDismiss = () => {
        categoryEditorDispatch({
            type: CategoryEditorActionType.DISMISS
        })
    }

    const onCategoryEditorCommit = () => {
        let category = categoryEditorState.category;
        if (category !== undefined) {
            if (categoryEditorState.isCreate) {
                CategoryRepository.create(category)
                    .then(() => {
                        enqueueSnackbar(t("feedback.category_created"));

                    }).catch(() => {
                        enqueueSnackbar(t("feedback.category_create_error"));

                    }).finally(() => {
                        categoryEditorDispatch({ type: CategoryEditorActionType.DISMISS })
                    })
            } else {
                CategoryRepository.update(category)
                    .then(() => {
                        enqueueSnackbar(t("feedback.category_updated"));

                    }).catch(() => {
                        enqueueSnackbar(t("feedback.category_update_error"));

                    }).finally(() => {
                        categoryEditorDispatch({ type: CategoryEditorActionType.DISMISS })

                    })
            }
        }
    }

    const onCategoryPickerView = () => { setCategoryPickerOpen(true) }
    const onCategoryPickerViewDismiss = () => { setCategoryPickerOpen(false) }

    const onDismissAssetConfirmation = () => {
        removeDispatch({
            type: AssetRemoveActionType.DISMISS
        })
    }

    const onDismissCategoryConfirmation = () => {
        categoryRemoveDispatch({
            type: CategoryRemoveActionType.DISMISS
        })
    }

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

            {/* Asset Editor Screen */}
            <AssetEditor
                isOpen={editorState.isOpen}
                id={editorState.asset?.assetId}
                name={editorState.asset?.assetName}
                status={editorState.asset?.status}
                category={editorState.asset?.category}
                specs={editorState.asset?.specifications}
                onCancel={onAssetEditorDismiss}
                onSubmit={onAssetEditorCommit}
                onViewQrCode={onQrCodeView}
                onCategorySelect={onCategoryPickerView}
                onAddSpecification={onAssetEditorAddSpecification}
                onSelectSpecification={onSpecificationItemSelected}
                onNameChanged={onAssetEditorNameChanged}
                onStatusChanged={onAssetEditorStatusChanged}/>

            {/* Specification Editor Screen */}
            <SpecificationEditor
                isOpen={specEditorState.isOpen} 
                specification={specEditorState.specification}
                onSubmit={onSpecificationEditorCommit}
                onCancel={onSpecificationEditorDismiss}
                onKeyChanged={onSpecificationKeyChanged}
                onValueChanged={onSpecificationValueChanged}/>

            <QrCodeViewComponent
                assetId={editorState.asset?.assetId}
                isOpened={isQrCodeOpen}
                onClose={onQrCodeViewDismiss}/>
            
            {/* Category Screen */}
            <CategoryScreen
                isOpen={isCategoryListOpen}
                categories={categories}
                isLoading={isCategoriesLoading}
                hasPrevious={atCategoryStart}
                hasNext={atCategoryEnd}
                onPreviousBatch={getPreviousCategories}
                onNextBatch={getNextCategories}
                onDismiss={onCategoryListDismiss}
                onAddItem={onCategoryEditorView}
                onSelectItem={onCategoryItemSelected}
                onDeleteItem={onCategoryItemRequestRemove}/>

            <CategoryPicker
                isOpen={isCategoryPickerOpen}
                categories={categories}
                isLoading={isCategoriesLoading}
                hasPrevious={atCategoryStart}
                hasNext={atCategoryEnd}
                onPreviousBatch={getPreviousCategories}
                onNextBatch={getNextCategories}
                onDismiss={onCategoryPickerViewDismiss}
                onAddItem={onCategoryEditorView}
                onSelectItem={onAssetCategorySelected}
                onDeleteItem={onCategoryItemRequestRemove}/>

            {/* Category Editor Screen */}
            <CategoryEditorComponent
                editorOpened={categoryEditorState.isOpen}
                onCancel={onCategoryEditorDismiss}
                onSubmit={onCategoryEditorCommit}
                categoryId={categoryEditorState.category?.categoryId === undefined ? "" : categoryEditorState.category?.categoryId}
                categoryName={categoryEditorState.category?.categoryName === undefined ? "" : categoryEditorState.category?.categoryName}
                count={categoryEditorState.category?.count === undefined ? 0 : categoryEditorState.category?.count}
                onCategoryNameChanged={onCategoryNameChanged}/>

            <ConfirmationDialog
                isOpen={removeState.isRequest}
                title="dialog.asset_remove"
                summary="dialog.asset_remove_summary"
                onDismiss={onDismissAssetConfirmation}
                onConfirm={onAssetItemRemove}/>

            <ConfirmationDialog
                isOpen={categoryRemoveState.isRequest}
                title="dialog.category_remove"
                summary="dialog.category_remove_summary"
                onDismiss={onDismissCategoryConfirmation}
                onConfirm={onCategoryItemRemove}/>

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