import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Tooltip,
  makeStyles
} from "@material-ui/core";
import {
  LocalOfferOutlined,
  DeleteOutlineRounded,
} from "@material-ui/icons";
import { useSnackbar } from "notistack";

import EmptyStateComponent from "../state/EmptyStates";
import PaginationController from "../../components/PaginationController";

import { Category, CategoryRepository } from "./Category";
import { usePermissions } from "../auth/AuthProvider";
import ConfirmationDialog from "../shared/ConfirmationDialog";

const useStyles = makeStyles(() => ({
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
  onItemSelect: (category: Category) => void
}

const CategoryList = (props: CategoryListProps) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [category, setCategory] = useState<Category | undefined>(undefined);

  const onRemoveInvoke = (category: Category) => setCategory(category);
  const onRemoveDismiss = () => setCategory(undefined);

  const onCategoryRemove = () => {
    if (category !== undefined) {
      CategoryRepository.remove(category)
        .then(() => enqueueSnackbar(t("feedback.category_removed")))
        .catch(() => enqueueSnackbar(t("feedback.category_remove_error")))
        .finally(onRemoveDismiss)
    }
  }

  return (
    <>
      {props.categories.length > 0
        ? <>
          <List className={classes.root}>{
            props.categories.map((category: Category) => {
              return (
                <CategoryItem
                  key={category.categoryId}
                  category={category}
                  onItemSelect={props.onItemSelect}
                  onItemRemove={onRemoveInvoke} />
              );
            })
          }</List>
          <PaginationController
            hasPrevious={props.hasPrevious}
            hasNext={props.hasNext}
            getPrevious={props.onPrevious}
            getNext={props.onNext} />
        </>
        : <EmptyStateComponent
          icon={LocalOfferOutlined}
          title={t("empty_category")}
          subtitle={t("empty_category_summary")} />
      }
      {category &&
        <ConfirmationDialog
          isOpen={category !== undefined}
          title="dialog.category_remove"
          summary="dialog.category_remove_summary"
          onDismiss={onRemoveDismiss}
          onConfirm={onCategoryRemove} />
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
    <IconButton
      edge="end"
      disabled={props.category.count > 0}
      aria-label={t("delete")}
      onClick={() => props.onItemRemove(props.category)}>
      <DeleteOutlineRounded/>
    </IconButton>
  );

  return (
    <ListItem
      button
      key={props.category.categoryId}
      onClick={() => props.onItemSelect(props.category)}>
      <ListItemText
        primary={props.category.categoryName}
        secondary={t("template.count", { count: props.category.count })} />
      {canDelete &&
        <ListItemSecondaryAction>
          {props.category.count > 0
            ? <Tooltip title={<>{t("info.category_count_not_zero")}</>}>
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