import { useEffect, useState, useReducer, lazy } from "react";
import { useTranslation } from "react-i18next";
import Box from "@material-ui/core/Box";
import Hidden from "@material-ui/core/Hidden";
import LinearProgress from "@material-ui/core/LinearProgress";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles } from "@material-ui/core/styles";
import { DataGrid, GridRowParams, GridValueGetterParams, GridOverlay } from "@material-ui/data-grid";
import { useSnackbar } from "notistack";

import DesktopComputerIcon from "@heroicons/react/outline/DesktopComputerIcon";
import PlusIcon from "@heroicons/react/outline/PlusIcon";

import GridLinearProgress from "../../components/GridLinearProgress";
import PaginationController from "../../components/PaginationController";
import ComponentHeader from "../../components/ComponentHeader";
import EmptyStateComponent from "../state/EmptyStates";
import { newId, formatDate } from "../../shared/utils";

import firebase from "firebase/app";
import { firestore } from "../../index";
import { Asset, AssetRepository, Status, getStatusLoc } from "./Asset";
import AssetList from "./AssetList";
import { Category, CategoryCore, CategoryRepository } from "../category/Category";
import { 
    CategoryEditorActionType, 
    categoryEditorInitialState, 
    categoryEditorReducer } from "../category/CategoryEditorReducer";
import { Specification } from "../specs/Specification";
import { usePagination } from "../../shared/pagination";

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

const AssetEditor = lazy(() => import("./AssetEditor"));
const QrCodeViewComponent = lazy(() => import("../qrcode/QrCodeViewComponent"));
const SpecificationEditor = lazy(() => import("../specs/SpecificationEditor"));

const CategoryScreen = lazy(() => import("../category/CategoryScreen"));
const CategoryPicker = lazy(() => import("../category/CategoryPicker"));
const CategoryEditorComponent = lazy(() => import("../category/CategoryEditor"));
const CategoryRemove = lazy(() => import("../category/CategoryRemove"));

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100%',
        width: '100%',
    },
    icon: {
        width: '1em',
        height: '1em',
        color: theme.palette.primary.contrastText
    },
    overflowButton: {
        marginLeft: '0.6em'
    },
    dataIcon: {
        width: '4em',
        height: '4em',
        color: theme.palette.text.primary
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

    const columns = [
        { field: assetId, headerName: t("id"), hide: true },
        { field: assetName, headerName: t("name"), flex: 1 },
        { 
            field: assetCategory, 
            headerName: t("category"), 
            flex: 0.5,
            valueGetter: (params: GridValueGetterParams) => {
                let asset = params.row as Asset;
                return asset.category?.categoryName === undefined ? t("unknown") : asset.category?.categoryName;
            }},
        { 
            field: dateCreated, 
            headerName: t("date_created"), 
            flex: 0.5, 
            valueGetter: (params: GridValueGetterParams) => 
                t(formatDate(params.row.dateCreated)) 
            },
        { 
            field: assetStatus, 
            headerName: t("status"), 
            flex: 0.35, 
            valueGetter: (params: GridValueGetterParams) => t(getStatusLoc(params.row.status)) }
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

    // AssetEditor Props
    const [isEditorOpen, setEditorOpen] = useState<boolean>(false);
    const [isSpecsEditorOpen, setSpecsEditorOpen] = useState<boolean>(false);
    const [isQrCodeOpen, setQrCodeOpen] = useState<boolean>(false);

    const [_assetId, setAssetId] = useState<string>('');
    const [_assetName, setAssetName] = useState<string>('');
    const [_assetStatus, setAssetStatus] = useState<Status>(Status.IDLE);
    const [_assetCategory, setAssetCategory] = useState<CategoryCore | undefined>(undefined);
    const [_assetSpecs, setAssetSpecs] = useState<Specification>({});

    const [_specification, setSpecification] = useState<[string, string]>(['', '']);

    useEffect(() => {
        if (!isEditorOpen) {
            setTimeout(() => {
                setAssetId('');
                setAssetName('');
                setAssetStatus(Status.IDLE);
                setAssetSpecs({});
            }, 100);
        }
    }, [isEditorOpen]);

    useEffect(() => {
        if (!isSpecsEditorOpen) {
            setTimeout(() => {
                setSpecification(['', '']);
            }, 100);
        }
    }, [isSpecsEditorOpen]);

    const onAssetSelected = (asset: Asset) => {
        setAssetId(asset.assetId);
        setAssetName(asset.assetName === undefined ? '' : asset.assetName);
        setAssetStatus(asset.status === undefined ? Status.IDLE : asset.status);
        setAssetSpecs(asset.specifications === undefined ? _assetSpecs : asset.specifications);
        setAssetCategory(asset.category);
        setEditorOpen(true);
    }

    const onAssetEditorCommit = () => {
        const isCreate = _assetId === '';
        const asset: Asset = {
            assetId: isCreate ? newId() : _assetId,
            assetName: _assetName,
            status: _assetStatus,
            dateCreated: firebase.firestore.Timestamp.now(),
            category: _assetCategory,
            specifications: _assetSpecs
        }   

        if (isCreate) {
            AssetRepository.create(asset)
                .then(() => {
                    setEditorOpen(false);
                    enqueueSnackbar(t("feedback_asset_created"))
                }).catch((error) => {
                    console.log(error);
                })
        }
    }

    const onAssetCategorySelected = (category: Category) => {
        setAssetCategory(category);
        setCategoryPickerOpen(false);
    }

    const onSpecificationItemSelected = (spec: [string, string]) => {
        setSpecification(spec);
        setSpecsEditorOpen(true);
    }

    const onSpecificationEditorCommit = (spec: [string, string]) => {
        let specifications = _assetSpecs;
        specifications[spec[0]] = spec[1]
        setAssetSpecs(specifications);

        setSpecsEditorOpen(false);
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

    const [isCategoryListOpen, setCategoryListOpen] = useState(false);
    const [isCategoryPickerOpen, setCategoryPickerOpen] = useState(false);
    const [isCategoryDeleteOpened, setCategoryDeleteOpened] = useState(false);

    const [categoryEditorState, categoryEditorDispatch] = useReducer(categoryEditorReducer, categoryEditorInitialState);
    
    const onCategoryItemSelected = (category: Category) => {
        categoryEditorDispatch({
            type: CategoryEditorActionType.Update,
            value: category,
        })
    }

    const onCategoryItemRemoved = (category: Category) => {
        setCategoryDeleteOpened(true);
    }

    const onCategoryItemRemoveConfirmed = (category: Category | undefined) => {
        if (category !== undefined) {
            CategoryRepository.remove(category)
                .then(() => {
                    setCategoryDeleteOpened(false);

                    enqueueSnackbar(t("feedback_category_removed"));
                }).catch((error) => {
                    console.log(error); 
                })
        }
    }

    const onCategoryEditorCommit = () => {
        let category = categoryEditorState.category;
        if (category !== undefined) {
            if (categoryEditorState.isCreate) {
                CategoryRepository.create(category)
                    .then(() => {
                        categoryEditorDispatch({ type: CategoryEditorActionType.Dismiss })
                        enqueueSnackbar(t("feedback_category_created"));
                    })
            } else {
                CategoryRepository.update(category)
                    .then(() => {
                        categoryEditorDispatch({ type: CategoryEditorActionType.Dismiss })
                        enqueueSnackbar(t("feedback_category_updated"));
                    })
            }
        }
    }

    return (
        <Box className={classes.root}>
            <ComponentHeader 
                title={ t("assets") } 
                onDrawerToggle={props.onDrawerToggle} 
                buttonText={ t("add") }
                buttonIcon={<PlusIcon className={classes.icon}/>}
                buttonOnClick={() => setEditorOpen(true) }
                menuItems={[
                    <MenuItem key={0} onClick={() => setCategoryListOpen(true)}>{ t("categories") }</MenuItem>
                ]}/>
            <Hidden xsDown>
                <div className={classes.wrapper}>
                    <DataGrid
                        components={{
                            LoadingOverlay: GridLinearProgress,
                            NoRowsOverlay: EmptyStateOverlay
                        }}
                        rows={assets}
                        columns={columns}
                        pageSize={15}
                        loading={isAssetsLoading}
                        paginationMode="server"
                        getRowId={(r) => r.assetId}
                        onRowDoubleClick={(params: GridRowParams, e: any) => 
                            onAssetSelected(params.row as Asset)
                        }
                        hideFooter/>
                </div>
            </Hidden>
            <Hidden smUp>
                { !isAssetsLoading 
                    ? assets.length < 1 
                        ? <AssetEmptyStateComponent/>
                        : <AssetList assets={assets} onItemSelect={onAssetSelected}/>
                    : <LinearProgress/>
                }
            </Hidden>
            {
                !atAssetStart && !atAssetEnd &&
                <PaginationController
                    hasPrevious={atAssetStart}
                    hasNext={atAssetEnd}
                    getPrevious={getPreviousAssets}
                    getNext={getNextAssets}/>
            }

            {/* Asset Editor Screen */}
            <AssetEditor
                isOpen={isEditorOpen}
                id={_assetId}
                name={_assetName}
                status={_assetStatus}
                category={_assetCategory}
                specs={_assetSpecs}
                onCancel={() => setEditorOpen(false)}
                onSubmit={() => onAssetEditorCommit()}
                onViewQrCode={() => setQrCodeOpen(true)}
                onCategorySelect={() => setCategoryPickerOpen(true)}
                onAddSpecification={() => setSpecsEditorOpen(true)}
                onSelectSpecification={onSpecificationItemSelected}
                onNameChanged={setAssetName}
                onStatusChanged={setAssetStatus}/>

            {/* Specification Editor Screen */}
            <SpecificationEditor
                isOpen={isSpecsEditorOpen} 
                specification={_specification}
                onSubmit={onSpecificationEditorCommit}
                onCancel={() => setSpecsEditorOpen(false)}
                onSpecificationChanged={setSpecification}/>

            <QrCodeViewComponent
                assetId={_assetId}
                isOpened={isQrCodeOpen}
                onClose={() => setQrCodeOpen(false)}/>
            
            {/* Category Screen */}
            <CategoryScreen
                isOpen={isCategoryListOpen}
                categories={categories}
                isLoading={isCategoriesLoading}
                hasPrevious={atCategoryStart}
                hasNext={atCategoryEnd}
                onPreviousBatch={getPreviousCategories}
                onNextBatch={getNextCategories}
                onDismiss={() => setCategoryListOpen(false)}
                onAddItem={() => categoryEditorDispatch({ type: CategoryEditorActionType.Create })}
                onSelectItem={onCategoryItemSelected}
                onDeleteItem={onCategoryItemRemoved}/>

            <CategoryPicker
                isOpen={isCategoryPickerOpen}
                categories={categories}
                isLoading={isCategoriesLoading}
                hasPrevious={atCategoryStart}
                hasNext={atCategoryEnd}
                onPreviousBatch={getPreviousCategories}
                onNextBatch={getNextCategories}
                onDismiss={() => setCategoryPickerOpen(false)}
                onAddItem={() => categoryEditorDispatch({ type: CategoryEditorActionType.Create })}
                onSelectItem={onAssetCategorySelected}
                onDeleteItem={onCategoryItemRemoved}/>

            {/* Category Editor Screen */}
            <CategoryEditorComponent
                editorOpened={categoryEditorState.isOpen}
                onCancel={() => categoryEditorDispatch({type: CategoryEditorActionType.Dismiss })}
                onSubmit={onCategoryEditorCommit}
                categoryId={categoryEditorState.category?.categoryId === undefined ? "" : categoryEditorState.category?.categoryId}
                categoryName={categoryEditorState.category?.categoryName === undefined ? "" : categoryEditorState.category?.categoryName}
                count={categoryEditorState.category?.count === undefined ? 0 : categoryEditorState.category?.count}
                onCategoryNameChanged={(name) => {
                    let _cat = categoryEditorState.category;
                    if (_cat === undefined)
                        _cat = { categoryId: newId(), count: 0 }
                    _cat!.categoryName = name;
                    return categoryEditorDispatch({
                        value: _cat!,
                        type: CategoryEditorActionType.NameChanged
                    })
                }}/>
        </Box>
    )
}

const EmptyStateOverlay = () => {
    return (
        <GridOverlay>
            <AssetEmptyStateComponent />
        </GridOverlay>
    )
}

const AssetEmptyStateComponent = () => {
    const classes = useStyles();
    const { t } = useTranslation();
    
    return (
        <EmptyStateComponent
            icon={<DesktopComputerIcon className={classes.dataIcon}/>}
            title={ t("empty_asset") }
            subtitle={ t("empty_asset_summary")} />
    )
}

export default AssetScreen;