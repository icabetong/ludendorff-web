import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Tooltip } from "@mui/material";
import { DeleteOutlineRounded, CategoryRounded } from "@mui/icons-material";
import { useSnackbar } from "notistack";

import EmptyStateComponent from "../state/EmptyStates";

import { Category, CategoryRepository } from "./Category";
import { usePermissions } from "../auth/AuthProvider";
import { useDialog } from "../../components/DialogProvider";
import { isDev } from "../../shared/utils";

type CategoryListProps = {
  categories: Category[],
  onItemSelect: (category: Category) => void
}

const CategoryList = (props: CategoryListProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const show = useDialog();

  const onCategoryRemove = async (category: Category) => {
    try {
      let result = await show({
        title: t("dialog.category_remove"),
        description: t("dialog.category_remove_summary"),
        confirmButtonText: t("button.delete"),
        dismissButtonText: t("button.cancel")
      });
      if (result) {
        await CategoryRepository.remove(category);
        enqueueSnackbar(t("feedback.category_removed"));
      }
    } catch (error) {
      enqueueSnackbar(t("feedback.category_remove_error"));
      if (isDev) console.log(error);
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
                  onItemRemove={onCategoryRemove}/>
              );
            })
          }
        </List>
        : <EmptyStateComponent
            icon={CategoryRounded}
            title={t("empty.category")}
            subtitle={t("empty.category_summary")}/>
      }
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