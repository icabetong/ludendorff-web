import React from "react";
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
    specifications: Map<string, string>,
    onNameChanged: (name: string) => void,
    onStatusChanged: (status: Status) => void,
    onCategoryChanged: (category: Category) => void,
    onSpecificationsChanged: (specifications: Map<string, string>) => void
}

const AssetEditorComponent = (props: AssetEditorComponentPropsType) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

    const isInUpdateMode = Boolean(props.assetId);

    const onCategoryChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        let index = parseInt(event.target.value);
        if (index < props.categories.length) {
            props.onCategoryChanged(props.categories[index]);
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
                        value={props.assetName}
                        variant="outlined"
                        size="small"
                        className={classes.textField}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.onNameChanged(e.target.value)}/>

                    <FormControl component="fieldset" className={classes.textField}>
                        <FormLabel component="legend">{ t("status") }</FormLabel>
                        <RadioGroup 
                            aria-label={ t("status") } 
                            name="editor-status" 
                            value={props.assetStatus} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.onStatusChanged(e.target.value as Status)}>
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
                        value={props.category?.categoryName}
                        defaultValue={props.categories && props.categories[0]}
                        onChange={onCategoryChanged}
                        className={classes.textField}>
                        <CategoryListItem categories={props.categories} />
                    </TextField>

                    <FormLabel component="legend">{ t("specification") }</FormLabel>
                    <List>
                        <SpecificationListItems specifications={props.specifications} onItemSelected={props.onSelectSpecification}/>
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

type CategoryListItemsPropsType = {
    categories: Category[]
}

const CategoryListItem = (props: CategoryListItemsPropsType) => {
    return (
        <React.Fragment>{   
            props.categories.map((category: Category, index: number) => {
                return (
                    <MenuItem 
                        key={category.categoryId} 
                        value={index}>{category.categoryName}</MenuItem>
                    )
            })            
        }</React.Fragment>
    )
}

type SpecificationListItemsPropsType = {
    specifications: Map<string, string>,
    onItemSelected: (specs: [string, string]) => void
}

const SpecificationListItems = (props: SpecificationListItemsPropsType) => {
    return (
        <React.Fragment>{ 
            Array.from(props.specifications.entries()).map((entry) => {
                return (
                    <ListItem
                        button
                        onClick={() => props.onItemSelected(entry)}
                        key={entry[0]}>
                        <ListItemContent 
                            title={entry[1]}
                            summary={entry[0]}/>
                    </ListItem>
                )
            } )
        }</React.Fragment>
    );
}

export default AssetEditorComponent;