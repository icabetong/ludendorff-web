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
  types: Category[],
  onItemSelect: (category: Category) => void
}

const CategoryList = (props: CategoryListProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [type, setType] = useState<Category | undefined>(undefined);

  const onRemoveInvoke = (category: Category) => setType(category);
  const onRemoveDismiss = () => setType(undefined);

  const onCategoryRemove = () => {
    if (type !== undefined) {
      CategoryRepository.remove(type)
        .then(() => enqueueSnackbar(t("feedback.type_removed")))
        .catch(() => enqueueSnackbar(t("feedback.type_remove_error")))
        .finally(onRemoveDismiss)
    }
  }

  return (
    <>
      {props.types.length > 0
        ? <List sx={{ minHeight: '100%' }}>
          {
            props.types.map((category: Category) => {
              return (
                <TypeItem
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
        isOpen={type !== undefined}
        title="dialog.category_remove"
        summary="dialog.category_remove_summary"
        onDismiss={onRemoveDismiss}
        onConfirm={onCategoryRemove}/>
    </>
  );
}

type TypeItemProps = {
  type: Category,
  onItemSelect: (type: Category) => void,
  onItemRemove: (type: Category) => void,
}

const TypeItem = (props: TypeItemProps) => {
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

  return (
    <ListItem
      button
      key={props.type.categoryId}
      onClick={() => props.onItemSelect(props.type)}>
      <ListItemText
        primary={props.type.categoryName}
        secondary={t("template.count", { count: props.type.count })}/>
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