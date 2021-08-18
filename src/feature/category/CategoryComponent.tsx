import React from "react";
import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import TagIcon from "@heroicons/react/outline/TagIcon";

import { Category } from "./Category";

const useStyles = makeStyles(() => ({
    root: {
        minHeight: '60vh'
    },
    icon: {
        width: '2em',
        height: '2em',
        fontSize: '2em'
    }
}));

type CategoryComponentPropsType = {
    isOpen: boolean,
    categories: Category[],
    isLoading: boolean,
    hasPrevious: boolean,
    hasNext: boolean,
    onPreviousBatch: () => void,
    onNextBatch: () => void,
    onDismiss: () => void,
    onAddItem: () => void,
    onSelectItem: (category: Category) => void,
}

const CategoryComponent = (props: CategoryComponentPropsType) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

    return (
        <Dialog
            fullScreen={isMobile}
            fullWidth={true}
            maxWidth="sm"
            open={props.isOpen}
            onClose={() => props.onDismiss() }>
            <DialogTitle>{ t("categories") }</DialogTitle>
            <DialogContent dividers={true}>
                <CategoryList categories={props.categories} onItemSelect={props.onSelectItem}/>
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={() => props.onAddItem()}>{ t("add") }</Button>
                <div style={{flex: '1 0 0'}}></div>
                <Button color="primary" onClick={() => props.onDismiss()}>{ t("close") }</Button>
            </DialogActions>
        </Dialog>
    )
}

const EmptyStateComponent = () => {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <Grid 
            container 
            direction="column" 
            alignItems="center" 
            justifyContent="center" 
            className={classes.root}>
            <Grid item>
                <TagIcon className={classes.icon}/>
            </Grid>
            <Grid item>
                <Typography variant="h6">{ t("empty_category") }</Typography>    
            </Grid>
            <Grid item>
                <Typography variant="subtitle1">{ t("empty_category_summary") }</Typography>
            </Grid>
        </Grid>
    )
}

type CategoryListPropsType = {
    categories: Category[],
    onItemSelect?: (category: Category) => void,
}

const CategoryList = (props: CategoryListPropsType) => {
    const classes = useStyles();

    return (
        <React.Fragment>
            { props.categories.length > 0 
            ?   <List className={classes.root}>{
                    props.categories.map((category: Category) => {
                        return <CategoryItem key={category.categoryId} category={category} onItemSelect={props.onItemSelect}/>
                    })
                }</List>
            : <EmptyStateComponent/>
        }
        </React.Fragment>
    )
}

type CategoryItemPropsType = {
    category: Category,
    onItemSelect?: (category: Category) => void,
}

const CategoryItem = (props: CategoryItemPropsType) => {
    return (
        <ListItem
            button
            key={props.category.categoryId}
            onClick={() => props.onItemSelect && props.onItemSelect(props.category)}>
                <ListItemText primary={
                    <Typography variant="body1">{props.category.categoryName}</Typography>
                }/>
        </ListItem>
    )
}

export default CategoryComponent;