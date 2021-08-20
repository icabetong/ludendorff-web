import React from "react";
import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Typography from "@material-ui/core/Typography";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles, useTheme } from "@material-ui/core/styles";

import TagIcon from "@heroicons/react/outline/TagIcon";
import TrashIcon from "@heroicons/react/outline/TrashIcon";

import { Category } from "./Category";
import EmptyStateComponent from "../state/EmptyStates";
import PaginationController from "../../components/PaginationController";

const useStyles = makeStyles(() => ({
    root: {
        minHeight: '60vh'
    },
    icon: {
        width: '2em',
        height: '2em',
        fontSize: '2em'
    },
    actionIcon: {
        width: '0.8em',
        height: '0.8em'
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
    onDeleteItem: (category: Category) => void,
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
                <CategoryList 
                    hasPrevious={props.hasPrevious}
                    hasNext={props.hasNext}
                    onPreviousBatch={props.onPreviousBatch}
                    onNextBatch={props.onNextBatch}
                    categories={props.categories} 
                    onItemSelect={props.onSelectItem}
                    onItemDelete={props.onDeleteItem}/>
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={() => props.onAddItem()}>{ t("add") }</Button>
                <div style={{flex: '1 0 0'}}></div>
                <Button color="primary" onClick={() => props.onDismiss()}>{ t("close") }</Button>
            </DialogActions>
        </Dialog>
    )
}

type CategoryListPropsType = {
    categories: Category[],
    hasPrevious: boolean,
    hasNext: boolean,
    onPreviousBatch: () => void,
    onNextBatch: () => void
    onItemSelect: (category: Category) => void,
    onItemDelete: (category: Category) => void,
}

const CategoryList = (props: CategoryListPropsType) => {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <React.Fragment>
            { props.categories.length > 0 
            ?   <React.Fragment>
                    <List className={classes.root}>{
                        props.categories.map((category: Category) => {
                            return <CategoryItem 
                                        key={category.categoryId} 
                                        category={category} 
                                        onItemSelect={props.onItemSelect}
                                        onItemDelete={props.onItemDelete}/>
                        })
                    }</List>
                    { !props.hasNext && !props.hasPrevious &&
                        <PaginationController
                            hasPrevious={props.hasPrevious}
                            hasNext={props.hasNext}
                            getPrevious={props.onPreviousBatch}
                            getNext={props.onNextBatch}/>
                    }
                </React.Fragment>
            : <EmptyStateComponent
                icon={<TagIcon className={classes.icon}/>}
                title={t("empty_category")}
                subtitle={t("empty_category_summary")}/>

        }
        </React.Fragment>
    )
}

type CategoryItemPropsType = {
    category: Category,
    onItemSelect: (category: Category) => void,
    onItemDelete: (category: Category) => void,
}

const CategoryItem = (props: CategoryItemPropsType) => {
    const { t } = useTranslation(); 
    const classes = useStyles();

    return (
        <ListItem
            dense
            button
            key={props.category.categoryId}
            onClick={() => props.onItemSelect(props.category)}>
            <ListItemText 
                primary={
                    <Typography variant="body2">{props.category.categoryName}</Typography>
                }
                secondary={
                    <Typography variant="caption">{ t("count", { count: props.category.count }) }</Typography>
                }/>
            <ListItemSecondaryAction>
                <IconButton edge="end" aria-label={t("delete")} onClick={() => props.onItemDelete(props.category)}>
                    <TrashIcon className={classes.actionIcon}/>
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    )
}

export default CategoryComponent;