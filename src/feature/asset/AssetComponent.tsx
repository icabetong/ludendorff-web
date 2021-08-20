import { useEffect, useState, lazy } from "react";
import { useTranslation } from "react-i18next";
import Box from "@material-ui/core/Box";
import Hidden from "@material-ui/core/Hidden";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import LinearProgress from "@material-ui/core/LinearProgress";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { DataGrid, GridRowParams, GridValueGetterParams, GridOverlay } from "@material-ui/data-grid";
import { useSnackbar } from "notistack";

import DesktopComputerIcon from "@heroicons/react/outline/DesktopComputerIcon";
import PlusIcon from "@heroicons/react/outline/PlusIcon";
import TagIcon from "@heroicons/react/outline/TagIcon";

import { CategoryDeleteConfirmComponent } from "../category/CategorySubComponents";
import GridLinearProgress from "../../components/GridLinearProgress";
import PaginationController from "../../components/PaginationController";
import { ListItemContent } from "../../components/ListItemContent";
import { ComponentHeader } from "../../components/ComponentHeader";
import EmptyStateComponent from "../state/EmptyStates";

import { firestore } from "../../index";
import { Asset, Status } from "./Asset";
import { Category, CategoryCore, CategoryRepository } from "../category/Category";
import { usePagination } from "../../shared/pagination";

const AssetEditorComponent = lazy(() => import("./AssetEditorComponent"));
const CategoryComponent = lazy(() => import("../category/CategoryComponent"));
const QrCodeViewComponent = lazy(() => import("../qrcode/QrCodeViewComponent"));
const CategoryEditorComponent = lazy(() => import("../category/CategoryEditorComponent"));
const SpecificationEditorComponent = lazy(() => import("../specs/SpecificationEditorComponent"));

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
    menuIcon: {
        width: '1.8em',
        height: '1.8em'
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

type AssetComponentPropsType = {
    onDrawerToggle: () => void
}

const AssetComponent = (props: AssetComponentPropsType) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();

    const columns = [
        { field: Asset.FIELD_ASSET_ID, headerName: t("id"), hide: true },
        { field: Asset.FIELD_ASSET_NAME, headerName: t("name"), flex: 1 },
        { 
            field: Asset.FIELD_CATEGORY, headerName: 
            t("category"), 
            flex: 0.5,
            valueGetter: (params: GridValueGetterParams) => t(Asset.from(params.row).getLocalizedCategory())},
        { 
            field: Asset.FIELD_DATE_CREATED, 
            headerName: t("date_created"), 
            flex: 0.5, 
            valueGetter: (params: GridValueGetterParams) => t(Asset.from(params.row).formatDate()) },
        { 
            field: Asset.FIELD_STATUS, 
            headerName: t("status"), 
            flex: 0.35, 
            valueGetter: (params: GridValueGetterParams) => t(Asset.from(params.row).getLocalizedStatus()) }
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
            .collection(Asset.COLLECTION)
            .orderBy(Asset.FIELD_ASSET_NAME, "asc"), { limit: 15 }
    )

    // AssetEditor Props
    const [isEditorOpen, setEditorOpen] = useState<boolean>(false);
    const [isSpecsEditorOpen, setSpecsEditorOpen] = useState<boolean>(false);
    const [isQrCodeOpen, setQrCodeOpen] = useState<boolean>(false);

    const [_assetId, setAssetId] = useState<string>('');
    const [_assetName, setAssetName] = useState<string>('');
    const [_assetStatus, setAssetStatus] = useState<Status>(Status.IDLE);
    const [_assetCategory, setAssetCategory] = useState<CategoryCore | null>(null);
    const [_assetSpecs, setAssetSpecs] = useState<Map<string, string>>(new Map<string, string>());

    const [_specKey, setSpecKey] = useState<string>('');
    const [_specValue, setSpecValue] = useState<string>('');

    useEffect(() => {
        if (!isEditorOpen) {
            setTimeout(() => {
                setAssetName('');
                setAssetStatus(Status.IDLE);
                setAssetCategory(null);
                setAssetSpecs(new Map<string, string>());
            }, 500);
        }
    }, [isEditorOpen]);

    useEffect(() => {
        if (!isSpecsEditorOpen) {
            setTimeout(() => {
                setSpecKey('');
                setSpecValue('');
            }, 500);
        }
    }, [isSpecsEditorOpen]);

    const onAssetSelected = (asset: Asset) => {
        setAssetId(asset.assetId);
        setAssetName(asset.assetName !== undefined ? asset.assetName : '');
        setAssetStatus(asset.status !== undefined ? asset.status : Status.IDLE);
        setAssetCategory(asset.category !== undefined ? asset.category : null);
        setAssetSpecs(asset.specifications !== undefined ? asset.specifications : new Map<string, string>());
        setEditorOpen(true);
    }

    const onAssetEditorCommit = () => {
        
    }

    const onSpecificationItemSelected = (spec: [string, string]) => {
        setSpecKey(spec[0]);
        setSpecValue(spec[1]);
        setSpecsEditorOpen(true);
    }

    const onSpecificationEditorCommit = (spec: [string, string], exists: boolean) => {
        if (!exists) {
            let specs = _assetSpecs;
            specs.set(spec[0], spec[1]);
            
            setAssetSpecs(specs);
        } else {
            let specifications = _assetSpecs;
            // check if the key in the map exists
            if (spec[0] in specifications) {
                specifications.set(spec[0], spec[1]);
                setAssetSpecs(new Map<string, string>(specifications));
            }
        }
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
            .collection(Category.COLLECTION)
            .orderBy(Category.FIELD_CATEGORY_NAME, "asc"), { limit: 15 }   
    )

    const [isCategoryListOpen, setCategoryListOpen] = useState<boolean>(false);
    const [isCategoryEditorOpen, setCategoryEditorOpen] = useState<boolean>(false);
    const [isCategoryDeleteOpened, setCategoryDeleteOpened] = useState<boolean>(false);

    const [_category, setCategory] = useState<Category | null>(null);

    useEffect(() => {
        if (!isCategoryEditorOpen){
            // used in UI glitch
            setTimeout(() => {
                setCategory(null);
            }, 100);
        }
    }, [isCategoryEditorOpen]);
    
    const onCategoryItemSelected = (category: Category) => {
        setCategory(category);
        setCategoryEditorOpen(true);
    }

    const onCategoryItemRemoved = (category: Category) => {
        setCategory(category);
        setCategoryDeleteOpened(true);
    }

    const onCategoryItemRemoveConfirmed = (category: Category | null) => {
        if (category !== null) {
            CategoryRepository.remove(category)
                .then(() => {
                    setCategoryDeleteOpened(false);

                    enqueueSnackbar(t("feedback_category_removed"));
                }).catch((error) => {
                    console.log(error); 
                })
        }
    }

    const onCategoryEditorCommit = (category: Category, isNew: boolean) => {
        if (_category?.categoryName === '')
            return;

        if (isNew) {
            CategoryRepository.create(category)
                .then(() => {
                    setCategoryEditorOpen(false);

                    enqueueSnackbar(t("feedback_category_created"));
                })
        } else {
            CategoryRepository.update(category)
                .then(() => {
                    setCategoryEditorOpen(false);

                    enqueueSnackbar(t("feedback_category_updated"));
                })
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
                    <MenuItem key={0} onClick={() => setCategoryListOpen(true)}>
                        <ListItemIcon><TagIcon className={classes.menuIcon}/></ListItemIcon>
                        <Typography variant="inherit">{ t("categories") }</Typography>
                    </MenuItem>
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
                        onRowClick={(params: GridRowParams, e: any) => onAssetSelected(params.row as Asset)}
                        hideFooter/>
                </div>
            </Hidden>
            <Hidden smUp>
                { isAssetsLoading && <LinearProgress/> }
                { !isAssetsLoading && assets.length < 1 &&
                    <AssetEmptyStateComponent/>
                }
                { !isAssetsLoading &&
                    <List>{
                        assets.map((asset: Asset) => {
                            return <AssetListItem 
                                        key={asset.assetId}
                                        asset={asset} 
                                        onClick={onAssetSelected}/>
                        })    
                    }</List>
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
            <AssetEditorComponent
                isOpen={isEditorOpen}
                onCancel={() => setEditorOpen(false)}
                onSubmit={() => onAssetEditorCommit()}
                onViewQrCode={() => setQrCodeOpen(true)}
                onAddSpecification={() => setSpecsEditorOpen(true)}
                onSelectSpecification={onSpecificationItemSelected}
                categories={categories}
                assetId={_assetId}
                assetName={_assetName}
                assetStatus={_assetStatus}
                category={_assetCategory}
                specifications={new Map(Object.entries(_assetSpecs))}
                onNameChanged={setAssetName}
                onStatusChanged={setAssetStatus}
                onCategoryChanged={setAssetCategory}
                onSpecificationsChanged={setAssetSpecs}/>

            {/* Specification Editor Screen */}
            <SpecificationEditorComponent 
                isOpen={isSpecsEditorOpen} 
                onSubmit={onSpecificationEditorCommit}
                onCancel={() => setSpecsEditorOpen(false)}
                specKey={_specKey} 
                specValue={_specValue}
                onSpecKeyChanged={setSpecKey}
                onSpecValueChanged={setSpecValue}/>

            <QrCodeViewComponent
                assetId={_assetId}
                isOpened={isQrCodeOpen}
                onClose={() => setQrCodeOpen(false)}/>
            
            {/* Category Screen */}
            <CategoryComponent
                isOpen={isCategoryListOpen}
                isLoading={isCategoriesLoading}
                hasPrevious={atCategoryStart}
                hasNext={atCategoryEnd}
                categories={categories}
                onPreviousBatch={getPreviousCategories}
                onNextBatch={getNextCategories}
                onDismiss={() => setCategoryListOpen(false)}
                onAddItem={() => setCategoryEditorOpen(true)}
                onSelectItem={onCategoryItemSelected}
                onDeleteItem={onCategoryItemRemoved}/>

            {/* Category Editor Screen */}
            <CategoryEditorComponent
                editorOpened={isCategoryEditorOpen}
                onCancel={() => setCategoryEditorOpen(false)}
                onSubmit={onCategoryEditorCommit}
                category={_category}
                onCategoryChanged={setCategory}/>

            <CategoryDeleteConfirmComponent
                isOpen={isCategoryDeleteOpened}
                onDismiss={() => setCategoryDeleteOpened(false)}
                onConfirm={onCategoryItemRemoveConfirmed}
                category={_category} />

        </Box>
    )
}

type AssetListItemPropsType = {
    asset: Asset,
    onClick: (asset: Asset) => void,
}

const AssetListItem = (props: AssetListItemPropsType) => {
    return (
        <ListItem 
            button 
            key={props.asset.assetId}
            onClick={() => props.onClick(props.asset)}>
            <ListItemContent title={props.asset.assetName} summary={props.asset.category?.categoryName}/>
        </ListItem>
    );
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

export default AssetComponent;