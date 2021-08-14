import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import MenuItem from "@material-ui/core/MenuItem";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import TextField from "@material-ui/core/TextField";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles, useTheme } from "@material-ui/core/styles";

import PlusIcon from "@heroicons/react/outline/PlusIcon";

import { Asset, Status } from "./Asset";
import { Category, CategoryCore } from "../category/Category";
import { ListItemContent } from "../../components/ListItemContent";

const useStyles = makeStyles((theme) => ({
    textField: {
        width: '100%',
        margin: '0.6em 0'
    },
    icon: {
        width: '1.4em',
        height: '1.4em',
        color: theme.palette.text.primary
    }
}));

type AssetEditorComponentPropsType = {
    isOpen: boolean,
    onCancel: () => void,
    onSubmit: (asset: Asset) => void,
    onAddSpecification: () => void,
    onSelectSpecification: (specification: [string, string]) => void,
    categories: Category[],
    assetId: string,
    assetName: string,
    assetStatus: Status,
    category: CategoryCore | null,
    specifications: [string, string][]
}

const AssetEditorComponent = (props: AssetEditorComponentPropsType) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

    const dependencies = [props.assetId, props.assetName, props.assetStatus, props.categories, props.specifications];
    useEffect(() => {
        setId(props.assetId);
        setName(props.assetName);
        setStatus(props.assetStatus);
        setCategory(props.category);
        setSpecifications(props.specifications);
    }, dependencies);

    const [id, setId] = useState<string>(props.assetId);
    const [name, setName] = useState<string>(props.assetName);
    const [status, setStatus] = useState<Status>(props.assetStatus);
    const [category, setCategory] = useState<CategoryCore | null>(props.category);
    const [specifications, setSpecifications] = useState<[string, string][]>(props.specifications);
    const isInUpdateMode = Boolean(id);

    const [categories, setCategories] = useState<Category[]>([]);
    useEffect(() => {
        setCategories(props.categories);
    }, [props.categories]);

    const onNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    }
    const onStatusChanged = (event: React.ChangeEvent<HTMLInputElement>) => { 
        setStatus(event.target.value as Status);
    }
    const onCategoryChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        let index = parseInt(event.target.value);
        if (index < categories.length) {
            setCategory(categories[index]);
        }
    }

    const onDismiss = () => {
        props.onCancel()
    }
    const onPreSubmit = () => {

    }

    return (
        <Dialog
            fullScreen={isMobile}
            fullWidth={true}
            maxWidth="xs"
            open={props.isOpen}
            onClose={() => onDismiss() }>

            <DialogTitle>{ 
            isInUpdateMode 
            ? t("asset_create") 
            : t("asset_update")
            }</DialogTitle>

            <DialogContent dividers={true}>
                <Container disableGutters>

                    <TextField
                        autoFocus
                        id="editor-asset-name"
                        type="text"
                        label={ t("asset_name") }
                        value={name}
                        variant="outlined"
                        size="small"
                        className={classes.textField}
                        onChange={onNameChanged}/>

                    <FormControl component="fieldset" className={classes.textField}>
                        <FormLabel component="legend">{ t("status") }</FormLabel>
                        <RadioGroup aria-label={ t("status") } name="editor-status" value={status} onChange={onStatusChanged}>
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
                        value={category?.categoryName}
                        defaultValue={categories && categories[0]}
                        onChange={onCategoryChanged}
                        className={classes.textField}>
                        {   categories.map((category: Category, index: number) => {
                                return <MenuItem key={category.categoryId} value={index}>{category.categoryName}</MenuItem>
                            })
                        }
                    </TextField>

                    <FormLabel component="legend">{ t("specification") }</FormLabel>
                    <List>
                        <SpecificationListItems specifications={specifications} onItemSelected={props.onSelectSpecification}/>
                        <ListItem
                            button
                            onClick={() => props.onAddSpecification()}
                            dense={true}>
                            <ListItemIcon><PlusIcon className={classes.icon}/></ListItemIcon>
                            <ListItemContent title={ t("add") }></ListItemContent>
                        </ListItem>
                    </List>
                </Container>
            </DialogContent>

            <DialogActions>
                <Button color="primary" onClick={() => onDismiss() }>{ t("cancel") }</Button>
                <Button color="primary" onClick={() => onPreSubmit() }>{ t("save") }</Button>
            </DialogActions>

        </Dialog>
    );
}

type SpecificationListItemsPropsType = {
    specifications: [string, string][],
    onItemSelected: (specs: [string, string]) => void
}

const SpecificationListItems = (props: SpecificationListItemsPropsType) => {
    return (
        <React.Fragment>{ 
            props.specifications.map((specification: [string, string]) => {
                return (
                        <ListItem
                            button
                            onClick={() => props.onItemSelected(specification)}
                            key={specification[0]}>
                            <ListItemContent 
                                title={specification[1]}
                                summary={specification[0]}/>
                        </ListItem>
                    )
                })
        }</React.Fragment>
    );
}

export default AssetEditorComponent;