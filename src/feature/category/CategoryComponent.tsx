import { useTranslation } from "react-i18next";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import TagIcon from "@heroicons/react/outline/TagIcon";

import { Category } from "./Category";
import React from "react";

type CategoryComponentPropsType = {
    categories: Category[],
    onItemSelect?: (category: Category) => void,
}

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: '60vh'
    },
    icon: {
        width: '2em',
        height: '2em',
        fontSize: '2em'
    }
}));
export const EmptyStateComponent = () => {
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

export const CategoryComponent = (props: CategoryComponentPropsType) => {
    const classes = useStyles();

    return (
        <React.Fragment>
            { props.categories.length > 0 
            ?   <List className={classes.root}>{
                    props.categories.map((category: Category) => {
                        return <CategoryItem category={category} onItemSelect={props.onItemSelect}/>
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