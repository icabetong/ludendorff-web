import React from "react";
import { useTranslation } from "react-i18next";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import { makeStyles } from "@material-ui/core/styles";

import { TagIcon, TrashIcon } from "@heroicons/react/outline";

import EmptyStateComponent from "../state/EmptyStates";
import PaginationController from "../../components/PaginationController";

import { Category } from "./Category";

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: '60vh'
    },
    actionIcon: {
        width: '1em',
        height: '1em',
        color: theme.palette.text.primary
    }
}));

type CategoryListProps = {
    categories: Category[],
    hasPrevious: boolean,
    hasNext: boolean,
    onPrevious: () => void,
    onNext: () => void,
    onItemSelect: (category: Category) => void,
    onItemRemove: (category: Category) => void
}

const CategoryList = (props: CategoryListProps) => {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <React.Fragment>
            { props.categories.length > 0 
            ?   <React.Fragment>
                    <List className={classes.root}>{
                        props.categories.map((category: Category) => {
                            return (
                                <CategoryItem 
                                        key={category.categoryId} 
                                        category={category} 
                                        onItemSelect={props.onItemSelect}
                                        onItemRemove={props.onItemRemove}/>
                            );
                        })
                    }</List>
                    { !props.hasNext && !props.hasPrevious &&
                        <PaginationController
                            hasPrevious={props.hasPrevious}
                            hasNext={props.hasNext}
                            getPrevious={props.onPrevious}
                            getNext={props.onNext}/>
                    }
                </React.Fragment>
            : <EmptyStateComponent
                icon={TagIcon}
                title={t("empty_category")}
                subtitle={t("empty_category_summary")}/>

        }
        </React.Fragment>
    );
}

type CategoryItemProps = {
    category: Category,
    onItemSelect: (category: Category) => void,
    onItemRemove: (category: Category) => void,
}

const CategoryItem = (props: CategoryItemProps) => {
    const { t } = useTranslation();
    const classes = useStyles();

    return (
        <ListItem
            button
            key={props.category.categoryId}
            onClick={() => props.onItemSelect(props.category)}>
            <ListItemText 
                primary={props.category.categoryName}
                secondary={ t("count", { count: props.category.count }) }/>
            <ListItemSecondaryAction>
                <IconButton edge="end" aria-label={t("delete")} onClick={() => props.onItemRemove(props.category)}>
                    <TrashIcon className={classes.actionIcon}/>
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    )
}

export default CategoryList;