import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import Hidden from "@material-ui/core/Hidden";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import MenuItem from "@material-ui/core/MenuItem";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { DataGrid, GridValueGetterParams } from "@material-ui/data-grid";

import PlusIcon from "@heroicons/react/outline/PlusIcon";

import { ListItemContent } from "../../components/ListItemContent";
import { ComponentHeader } from "../../components/ComponentHeader";
import { Asset, AssetRepository, Status } from "./Asset";
import { Category, CategoryRepository } from "../category/Category";
import CategoryComponent from "../category/CategoryComponent";
import CategoryEditorComponent from "../category/CategoryEditorComponent";
import SpecificationEditorComponent from "../specs/SpecificationEditorComponent";
import { DocumentSnapshot, DocumentData } from "@firebase/firestore-types";
import AssetEditorComponent from "./AssetEditorComponent";

type AssetComponentPropsType = {
    onDrawerToggle: () => void
}

export const AssetComponent = (props: AssetComponentPropsType) => {
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
            color: theme.palette.primary.main
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
    const classes = useStyles();
    const theme = useTheme();
    const fullscreen = useMediaQuery(theme.breakpoints.down('xs'));

    const columns = [
        { field: Asset.FIELD_ASSET_ID, headerName: 'ID', hide: true },
        { field: Asset.FIELD_ASSET_NAME, headerName: 'Name', flex: 1 },
        { field: Asset.FIELD_CATEGORY, headerName: 'Category', flex: 0.5, valueGetter: (params: GridValueGetterParams) => params.row.category?.categoryName },
        { field: Asset.FIELD_DATE_CREATED, headerName: 'Date Created', flex: 0.5, valueGetter: (params: GridValueGetterParams) => params.row.formatDate() },
        { field: Asset.FIELD_STATUS, headerName: 'Status', flex: 0.35, valueGetter: (params: GridValueGetterParams) => t(params.row.getLocalizedStatus()) }
    ];

    const { t } = useTranslation();

    const [assets, setAssets] = useState<Asset[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(0);
    const [documentHistory, setDocumentHistory] = useState<DocumentSnapshot<DocumentData>[]>([]);

    useEffect(() => {
        AssetRepository.fetch(documentHistory[documentHistory.length - 1])
            .then((data: [Asset[], DocumentSnapshot<DocumentData>]) => {
                setAssets(data[0]);

                let newHistory = documentHistory;
                newHistory.push(data[1]);
                setDocumentHistory(newHistory);
            });
        CategoryRepository.fetch()
            .then((data: Category[]) => {
                setCategories(data);
            })
    }, [pageNumber]);

    const onIncrementPageNumber = () => {
        setPageNumber(pageNumber + 1);
    }

    const onDecrementPageNumber = () => {
        let newHistory = documentHistory;
        // we need to pop it two times
        // because the reference we need 
        // is two times behind.
        newHistory.pop();
        newHistory.pop();

        setDocumentHistory(newHistory);
        setPageNumber(pageNumber - 1);
    }
    const [isEditorOpened, setEditorOpened] = useState<boolean>(false);
    const [editorAssetId, setEditorAssetId] = useState<string>('');
    const [editorAssetName, setEditorAssetName] = useState<string>('');
    const [editorStatus, setEditorStatus] = useState<Status>(Status.IDLE);
    const [editorCategory, setEditorCategory] = useState<Category | null>(null);
    const [editorSpecifications, setEditorSpecifications] = useState<[string, string][]>([]);

    const onResetAssetEditor = () => {
        setEditorAssetName('');
        setEditorStatus(Status.IDLE);
        setEditorCategory(null);
        setEditorSpecifications([]);

        setEditorOpened(false);
    }
    const onCommitAssetEditor = () => {

    }

    const [isSpecificationEditorOpened, setSpecificationEditorOpened] = useState<boolean>(false);
    const [specificationKey, setSpecificationKey] = useState<string>('');
    const [specificationValue, setSpecificationValue] = useState<string>('');

    const onSpecificationEditorReset = () => {
        setSpecificationEditorOpened(false);
        setSpecificationKey('');
        setSpecificationValue('');
    }
    const onSpecificationEditorCommit = (specification: [string, string], isUpdate: boolean) => {
        if (!isUpdate) {
            let specifications = editorSpecifications;
            specifications.push(specification);
        } else {
            let specifications = editorSpecifications;
            let index = specifications.findIndex(s => s[0] === specification[0]);
            if (index > -1) {
                specifications[index] = specification;
                setEditorSpecifications([...specifications]);
            }
        }
        onSpecificationEditorReset();
    }
    const onSpecificationItemSelected = (spec: [string, string]) => {
        setSpecificationKey(spec[0]);
        setSpecificationValue(spec[1]);
        setSpecificationEditorOpened(true);
    }

    const [isCategoryScreenOpened, setCategoryScreenOpened] = useState<boolean>(false);
    
    const onCategoryItemSelected = (category: Category) => {
        setEditorCategoryId(category.categoryId);
        setEditorCategoryName(category.categoryName !== undefined ? category.categoryName : 'undefined');

        setCategoryEditorOpened(true);
    }

    const [isCategoryEditorOpened, setCategoryEditorOpened] = useState<boolean>(false);
    const [editorCategoryId, setEditorCategoryId] = useState<string>('');
    const [editorCategoryName, setEditorCategoryName] = useState<string>('');
    
    const onCategoryEditorReset = () => {
        setCategoryEditorOpened(false);
        setEditorCategoryId('');
        setEditorCategoryName('');
    }
    const onCategoryEditorCommit = (category: Category, isNew: boolean) => {
        if (editorCategoryName === '')
            return;

        if (isNew) {
            CategoryRepository.create(category)
                .then(() => {
                    onCategoryEditorReset();
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
                        columns={columns}
                        rows={assets}
                        getRowId={(r) => r.assetId}
                        pageSize={15}
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
                <button onClick={onDecrementPageNumber}>Previous</button>
                <button onClick={onIncrementPageNumber}>Next</button>
            </Hidden>
            
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
                onCancel={onCategoryEditorReset}
                onSubmit={onCategoryEditorCommit}
                categoryId={editorCategoryId}
                categoryName={editorCategoryName}
                onCategoryNameChanged={setEditorCategoryName}/>

            {/* Asset Editor Screen */}
            <AssetEditorComponent
                isOpen={isEditorOpened}
                onCancel={onResetAssetEditor}
                onSubmit={() => onCommitAssetEditor()}
                onAddSpecification={() => setSpecificationEditorOpened(true)}
                onSelectSpecification={onSpecificationItemSelected}
                categories={categories}
                assetId={editorAssetId}
                assetName={editorAssetName}
                assetStatus={editorStatus}
                category={editorCategory}
                specifications={editorSpecifications}/>

            {/* Specification Editor Screen */}
            <SpecificationEditorComponent 
                isOpen={isSpecificationEditorOpened} 
                onSubmit={onSpecificationEditorCommit}
                onCancel={onSpecificationEditorReset}
                specificationKey={specificationKey} 
                specificationValue={specificationValue}
                onSpecificationKeyChanged={setSpecificationKey}
                onSpecificationValueChanged={setSpecificationValue}/>
        </Box>
    )
}