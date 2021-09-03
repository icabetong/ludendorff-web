import { useTranslation } from "react-i18next";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Tooltip from "@material-ui/core/Tooltip";
import { makeStyles } from "@material-ui/core/styles";

import { TagIcon, TrashIcon } from "@heroicons/react/outline";

import EmptyStateComponent from "../state/EmptyStates";
import PaginationController from "../../components/PaginationController";
import HeroIconButton from "../../components/HeroIconButton";

import { usePermissions } from "../auth/AuthProvider";
import { Category } from "./Category";

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: '60vh'
    },
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
        <>
            { props.categories.length > 0 
            ?   <>
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
                </>
            : <EmptyStateComponent
                icon={TagIcon}
                title={t("empty_category")}
                subtitle={t("empty_category_summary")}/>

        }
        </>
    );
}

type CategoryItemProps = {
    category: Category,
    onItemSelect: (category: Category) => void,
    onItemRemove: (category: Category) => void,
}

const CategoryItem = (props: CategoryItemProps) => {
    const { t } = useTranslation();
    const { canDelete } = usePermissions();

    const deleteButton = (
        <HeroIconButton
            icon={TrashIcon}
            edge="end" 
            disabled={props.category.count > 0}
            aria-label={t("delete")} 
            onClick={() => props.onItemRemove(props.category)}/>
    );

    return (
        <ListItem
            button
            key={props.category.categoryId}
            onClick={() => props.onItemSelect(props.category)}>
            <ListItemText 
                primary={props.category.categoryName}
                secondary={ t("template.count", { count: props.category.count }) }/>
            { canDelete &&
                <ListItemSecondaryAction>
                    { props.category.count > 0
                        ? <Tooltip title={<>{t("error.category_count_not_zero")}</>}>
                            <span>{deleteButton}</span>
                          </Tooltip>
                        : <>{deleteButton}</>
                    }
                </ListItemSecondaryAction>
            }
        </ListItem>
    )
}

export default CategoryList;