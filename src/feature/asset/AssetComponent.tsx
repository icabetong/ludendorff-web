import { useEffect, useState, lazy } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles } from "@material-ui/core/styles";
import { DataGrid, GridRowParams, GridValueGetterParams } from "@material-ui/data-grid";
import { DocumentSnapshot } from "@firebase/firestore-types";

import PlusIcon from "@heroicons/react/outline/PlusIcon";

import { ListItemContent } from "../../components/ListItemContent";
import { ComponentHeader } from "../../components/ComponentHeader";
import { Asset, AssetRepository, Status } from "./Asset";
import { Category, CategoryCore, CategoryRepository } from "../category/Category";

const AssetEditorComponent = lazy(() => import("./AssetEditorComponent"));
const CategoryComponent = lazy(() => import("../category/CategoryComponent"));
const QrCodeViewComponent = lazy(() => import("../qrcode/QrCodeViewComponent"));
const CategoryEditorComponent = lazy(() => import("../category/CategoryEditorComponent"));
const SpecificationEditorComponent = lazy(() => import("../specs/SpecificationEditorComponent"));

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100%',
        width: '100%'
    },
    icon: {
        width: '1em',
        height: '1em',
    },
    actionButtonIcon: {
        color: theme.palette.primary.contrastText
    },
    overflowButtonIcon: {
        color: theme.palette.text.primary
    },
    overflowButton: {
        marginLeft: '0.6em'
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
    }
}));

type AssetComponentPropsType = {
    onDrawerToggle: () => void
}

const AssetComponent = (props: AssetComponentPropsType) => {
    const classes = useStyles();
    const { t } = useTranslation();

    const columns = [
        { field: Asset.FIELD_ASSET_ID, headerName: t("id"), hide: true },
        { field: Asset.FIELD_ASSET_NAME, headerName: t("name"), flex: 1 },
        { field: Asset.FIELD_CATEGORY, headerName: t("category"), flex: 0.5, valueGetter: (params: GridValueGetterParams) => params.row.category?.categoryName },
        { field: Asset.FIELD_DATE_CREATED, headerName: t("date_created"), flex: 0.5, valueGetter: (params: GridValueGetterParams) => params.row.formatDate() },
        { field: Asset.FIELD_STATUS, headerName: t("status"), flex: 0.35, valueGetter: (params: GridValueGetterParams) => t(params.row.getLocalizedStatus()) }
    ];

    const [assets, setAssets] = useState<Asset[]>([]);
    const [nextAssets, setNextAssets] = useState<Asset[]>([]);
    const [page, setPage] = useState<number>(0);
    const [documents, setDocuments] = useState<DocumentSnapshot[]>([]);

    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        AssetRepository.fetch(documents[page])
            .then((data: DocumentSnapshot[]) => {
                let asset: Asset[] = [];
                data.forEach((snapshot: DocumentSnapshot) => {
                    asset.push(Asset.from(snapshot.data()))
                })
                setAssets(asset);

                let docs = documents;
                console.log(docs);
                docs[page + 1] = data[data.length - 1];
                setDocuments([...docs]);
            });
    }, [page]);

    useEffect(() => {
        AssetRepository.fetch(documents[page + 1])
            .then((data: DocumentSnapshot[]) => {
                let asset: Asset[] = [];
                data.forEach((snapshot: DocumentSnapshot) => {
                    asset.push(Asset.from(snapshot.data()))
                })
                console.log(asset.length);
                setNextAssets(asset);
            })
    }, [page, documents])

    const [isEditorOpened, setEditorOpened] = useState<boolean>(false);
    const [editorAssetId, setEditorAssetId] = useState<string>('');
    const [editorAssetName, setEditorAssetName] = useState<string>('');
    const [editorStatus, setEditorStatus] = useState<Status>(Status.IDLE);
    const [editorCategory, setEditorCategory] = useState<CategoryCore | null>(null);
    const [editorSpecifications, setEditorSpecifications] = useState<Map<string, string>>(new Map<string, string>());

    useEffect(() => {
        if (!isEditorOpened) {
            setTimeout(() => {
                setEditorAssetName('');
                setEditorStatus(Status.IDLE);
                setEditorCategory(null);
                setEditorSpecifications(new Map<string, string>());
            }, 500);
        }
    }, [isEditorOpened]);

    const onCommitAssetEditor = () => {
        
    }

    const onAssetSelected = (asset: Asset) => {
        setEditorAssetId(asset.assetId);
        setEditorAssetName(asset.assetName !== undefined ? asset.assetName : '');
        setEditorStatus(asset.status !== undefined ? asset.status : Status.IDLE);
        setEditorCategory(asset.category !== undefined ? asset.category : null);
        setEditorSpecifications(asset.specifications !== undefined ? asset.specifications : new Map<string, string>());
        setEditorOpened(true);
    }

    const [isSpecificationEditorOpened, setSpecificationEditorOpened] = useState<boolean>(false);
    const [specificationKey, setSpecificationKey] = useState<string>('');
    const [specificationValue, setSpecificationValue] = useState<string>('');

    useEffect(() => {
        if (!isSpecificationEditorOpened) {
            setTimeout(() => {
                setSpecificationKey('');
                setSpecificationValue('');
            }, 500);
        }
    }, [isSpecificationEditorOpened])

    const onSpecificationEditorCommit = (specification: [string, string], isUpdate: boolean) => {
        if (!isUpdate) {
            let specifications = editorSpecifications;
            specifications.set(specification[0], specification[1]);
            
            setEditorSpecifications(specifications);
        } else {
            let specifications = editorSpecifications;
            // check if the key in the map exists
            if (specification[0] in specifications) {
                specifications.set(specification[0], specification[1]);
                setEditorSpecifications(new Map<string, string>(specifications));
            }
        }
        setSpecificationEditorOpened(false);
    }
    const onSpecificationItemSelected = (spec: [string, string]) => {
        setSpecificationKey(spec[0]);
        setSpecificationValue(spec[1]);
        setSpecificationEditorOpened(true);
    }

    const [isQrCodeView, setQrCodeView] = useState<boolean>(false);

    const [isCategoryScreenOpened, setCategoryScreenOpened] = useState<boolean>(false);
    
    const onCategoryItemSelected = (category: Category) => {
        setEditorCategoryId(category.categoryId);
        setEditorCategoryName(category.categoryName !== undefined ? category.categoryName : 'undefined');

        setCategoryEditorOpened(true);
    }

    const [isCategoryEditorOpened, setCategoryEditorOpened] = useState<boolean>(false);
    const [editorCategoryId, setEditorCategoryId] = useState<string>('');
    const [editorCategoryName, setEditorCategoryName] = useState<string>('');

    useEffect(() => {
        if (!isCategoryEditorOpened){
            // used in UI glitch
            setTimeout(() => {
                setEditorCategoryId('');
                setEditorCategoryName('');
            }, 500);
        }
    }, [isCategoryEditorOpened]);

    const onCategoryEditorCommit = (category: Category, isNew: boolean) => {
        if (editorCategoryName === '')
            return;

        if (isNew) {
            CategoryRepository.create(category)
                .then(() => {
                    setCategoryScreenOpened(false);
                }).catch((error) => {
                    console.log(error);
                })
        }
    }

    return (
        <Box className={classes.root}>
            <ComponentHeader 
                title={ t("assets") } 
                onDrawerToggle={props.onDrawerToggle} 
                buttonText={ t("add") }
                buttonIcon={<PlusIcon className={clsx(classes.icon, classes.actionButtonIcon)}/>}
                buttonOnClick={() => setEditorOpened(true) }
                menuItems={[
                    <MenuItem key={0} onClick={() => setCategoryScreenOpened(true)}>{ t("categories") }</MenuItem>
                ]}/>
            <Hidden xsDown>
                <div className={classes.wrapper}>
                    <DataGrid
                        rows={assets}
                        columns={columns}
                        pageSize={15}
                        paginationMode="server"
                        getRowId={(r) => r.assetId}
                        onRowClick={(params: GridRowParams, e: any) => onAssetSelected(params.row as Asset)}
                        hideFooterPagination/>
                </div>
            </Hidden>
            <Hidden smUp>
                <List>{
                    assets.map((asset: Asset) => {
                        return (
                            <ListItem button key={asset.assetId}>
                                <ListItemContent title={asset.assetName} summary={asset.category?.categoryName}/>
                            </ListItem>
                        )
                    })    
                }</List>
            </Hidden>
            <Container>
                <Grid container spacing={2} alignItems="center" justifyContent="center" direction="row">
                    <Grid item>
                        <Button 
                            variant="outlined" 
                            color="primary" 
                            disabled={page < 1}
                            onClick={() => setPage(page - 1)}>
                                Previous
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button 
                            variant="outlined" 
                            color="primary" 
                            disabled={nextAssets.length < 1}
                            onClick={() => setPage(page + 1)}>
                                Next
                        </Button>
                    </Grid>
                </Grid>
            </Container>
            
            {/* Category Screen */}
            <CategoryComponent
                isOpen={isCategoryScreenOpened}
                categories={categories}
                onDismiss={() => setCategoryScreenOpened(false)}
                onAddItem={() => setCategoryEditorOpened(true)}
                onSelectItem={onCategoryItemSelected}/>

            {/* Category Editor Screen */}
            <CategoryEditorComponent
                editorOpened={isCategoryEditorOpened}
                onCancel={() => setCategoryEditorOpened(false)}
                onSubmit={onCategoryEditorCommit}
                categoryId={editorCategoryId}
                categoryName={editorCategoryName}
                onCategoryNameChanged={setEditorCategoryName}/>

            {/* Asset Editor Screen */}
            <AssetEditorComponent
                isOpen={isEditorOpened}
                onCancel={() => setEditorOpened(false)}
                onSubmit={() => onCommitAssetEditor()}
                onViewQrCode={() => setQrCodeView(true)}
                onAddSpecification={() => setSpecificationEditorOpened(true)}
                onSelectSpecification={onSpecificationItemSelected}
                categories={categories}
                assetId={editorAssetId}
                assetName={editorAssetName}
                assetStatus={editorStatus}
                category={editorCategory}
                specifications={new Map(Object.entries(editorSpecifications))}
                onNameChanged={setEditorAssetName}
                onStatusChanged={setEditorStatus}
                onCategoryChanged={setEditorCategory}
                onSpecificationsChanged={setEditorSpecifications}/>

            {/* Specification Editor Screen */}
            <SpecificationEditorComponent 
                isOpen={isSpecificationEditorOpened} 
                onSubmit={onSpecificationEditorCommit}
                onCancel={() => setSpecificationEditorOpened(false)}
                specificationKey={specificationKey} 
                specificationValue={specificationValue}
                onSpecificationKeyChanged={setSpecificationKey}
                onSpecificationValueChanged={setSpecificationValue}/>

            <QrCodeViewComponent
                assetId={editorAssetId}
                isOpened={isQrCodeView}
                onClose={() => setQrCodeView(false)}/>
        </Box>
    )
}

export default AssetComponent