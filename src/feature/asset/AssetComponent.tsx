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
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import TextField from "@material-ui/core/TextField";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { DataGrid, GridValueGetterParams } from "@material-ui/data-grid";

import PlusIcon from "@heroicons/react/outline/PlusIcon";

import { ListItemContent } from "../../components/ListItemContent";
import { ComponentHeader } from "../../components/ComponentHeader";
import { Asset, AssetRepository, Status } from "./Asset";
import { Category, CategoryRepository } from "../category/Category";
import { DocumentSnapshot, DocumentData } from "@firebase/firestore-types";

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

    const [isEditorOpened, setEditorOpened] = useState<boolean>(false);;

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

    const [editorAssetName, setEditorAssetName] = useState<string>('');
    const [editorStatus, setEditorStatus] = useState<Status>(Status.IDLE);
    const [editorCategory, setEditorCategory] = useState<Category | null>(null);
    const [editorSpecifications, setEditorSpecifications] = useState<[string, string][]>([]);
    const resetEditorForms = () => {
        setEditorAssetName('');
        setEditorStatus(Status.IDLE);
        setEditorCategory(null);
        setEditorSpecifications([]);

        setEditorOpened(false);
    }
    
    const onEditorStatusChanged = (event: React.ChangeEvent<HTMLInputElement>) => { 
        setEditorStatus(event.target.value as Status);
    }
    const onEditorCategoryChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        let index = parseInt(event.target.value);
        if (index < categories.length) {
            setEditorCategory(categories[index]);
        }
    }

    return (
        <Box className={classes.root}>
            <ComponentHeader 
                title={ t("assets") } 
                onDrawerToggle={props.onDrawerToggle} 
                buttonText={ t("add") }
                buttonIcon={<PlusIcon className={clsx(classes.icon, classes.actionButtonIcon) }/>}
                buttonOnClick={() => setEditorOpened(true) }
                menuItems={[
                    <MenuItem>{ t("categories") }</MenuItem>
                ]}/>
            <Hidden xsDown>
                <div className={classes.wrapper}>
                    <Button onClick={() => setEditorOpened(true)}>Open</Button>
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
            
            <Dialog
                fullScreen={fullscreen}
                open={isEditorOpened}
                onClose={() => setEditorOpened(false) }>
                <DialogTitle>{ t("asset_create") }</DialogTitle>
                <DialogContent dividers={true}>
                    <Container disableGutters>
                        <TextField
                            autoFocus
                            id="editor-asset-name"
                            type="text"
                            label={ t("asset_name") }
                            value={editorAssetName}
                            variant="outlined"
                            size="small"
                            className={clsx(classes.textField, classes.editor)}/>
                        <FormControl component="fieldset" className={classes.editor}>
                            <FormLabel component="legend">{ t("status") }</FormLabel>
                            <RadioGroup aria-label={ t("status") } name="editor-status" value={editorStatus} onChange={onEditorStatusChanged}>
                                <FormControlLabel value={Status.OPERATIONAL} control={<Radio/>} label={ t("status_operational") } />
                                <FormControlLabel value={Status.IDLE} control={<Radio/>} label={ t("status_idle") }/>
                                <FormControlLabel value={Status.UNDER_MAINTENANCE} control={<Radio/>} label={ t("status_under_maintenance") } />
                                <FormControlLabel value={Status.RETIRED} control={<Radio/>} label={ t("status_retired") } />
                            </RadioGroup>
                        </FormControl>
                        <TextField
                            select
                            id="editor-category"
                            label={ t("category") }
                            variant="outlined"
                            size="small"
                            value={editorCategory?.categoryName}
                            defaultValue={categories && categories[0]}
                            onChange={onEditorCategoryChanged}
                            className={clsx(classes.textField, classes.editor)}>
                            {   categories.map((category: Category, index: number) => {
                                    return <MenuItem key={category.categoryId} value={index}>{category.categoryName}</MenuItem>
                                })
                            }
                        </TextField>
                    </Container>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={() => resetEditorForms() }>{ t("cancel") }</Button>
                    <Button color="primary" onClick={() => setEditorOpened(false) }>{ t("save") }</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )

}