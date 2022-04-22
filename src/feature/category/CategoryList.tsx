import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Tooltip } from "@mui/material";
import { DeleteOutlineRounded, CategoryRounded } from "@mui/icons-material";
import { useSnackbar } from "notistack";

import EmptyStateComponent from "../state/EmptyStates";

import { Category, CategoryRepository } from "./Category";
import { usePermissions } from "../auth/AuthProvider";
import ConfirmationDialog from "../shared/ConfirmationDialog";

type CategoryListProps = {
  categories: Category[],
  onItemSelect: (category: Category) => void
}

const CategoryList = (props: CategoryListProps) => {
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
        ? <List sx={{ minHeight: '100%' }}>
          {
            props.categories.map((category: Category) => {
              return (
                <CategoryListItem
                  key={category.categoryId}
                  type={category}
                  onItemSelect={props.onItemSelect}
                  onItemRemove={onRemoveInvoke}/>
              );
            })
          }
        </List>
        : <EmptyStateComponent
            icon={CategoryRounded}
            title={t("empty.category")}
            subtitle={t("empty.category_summary")}/>
      }
      <ConfirmationDialog
        isOpen={category !== undefined}
        title="dialog.category_remove"
        summary="dialog.category_remove_summary"
        onDismiss={onRemoveDismiss}
        onConfirm={onCategoryRemove}/>
    </>
  );
}

type CategoryListItemProps = {
  type: Category,
  onItemSelect: (category: Category) => void,
  onItemRemove: (category: Category) => void,
}

const CategoryListItem = (props: CategoryListItemProps) => {
  const { t } = useTranslation();
  const { canDelete } = usePermissions();

  const deleteButton = (
    <IconButton
      edge="end"
      disabled={props.type.count > 0}
      aria-label={t("delete")}
      onClick={() => props.onItemRemove(props.type)}
      size="large">
      <DeleteOutlineRounded/>
    </IconButton>
  );

  const getSecondaryListText = (subcategories: string[]) => {
     if (subcategories.length > 1) {
      return t("template.subcategories_include", { includes: subcategories.join(", ") });
    } else if (subcategories.length === 1) {
       return subcategories[0];
     } else {
       return "";
     }
  }

  return (
    <ListItem
      button
      key={props.type.categoryId}
      onClick={() => props.onItemSelect(props.type)}>
      <ListItemText
        primary={props.type.categoryName}
        secondary={getSecondaryListText(props.type.subcategories)}/>
      {canDelete &&
        <ListItemSecondaryAction>
          {props.type.count > 0
            ? <Tooltip title={<>{t("info.type_count_not_zero")}</>}>
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