import { useTranslation } from "react-i18next";
import { IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Tooltip } from "@mui/material";
import { DeleteOutlineRounded } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { Category, CategoryRepository } from "./Category";
import { usePermissions } from "../auth/AuthProvider";
import { useDialog } from "../../components/dialog/DialogProvider";
import { isDev } from "../../shared/utils";
import { CategoryEmptyState } from "./CategoryEmptyState";

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

  if (props.categories.length > 0) {
    return (
      <List sx={{ minHeight: '100%' }}>
        { props.categories.map((category) => (
            <CategoryListItem
              key={category.categoryId}
              category={category}
              onItemSelect={props.onItemSelect}
              onItemRemove={onCategoryRemove}/>
          ))
        }
      </List>
    )
  } else return <CategoryEmptyState/>

}

type CategoryListItemProps = {
  category: Category,
  onItemSelect: (category: Category) => void,
  onItemRemove: (category: Category) => void,
}

const CategoryListItem = (props: CategoryListItemProps) => {
  const { t } = useTranslation();
  const { canDelete } = usePermissions();

  const deleteButton = (
    <IconButton
      edge="end"
      disabled={props.category.count > 0}
      aria-label={t("delete")}
      onClick={() => props.onItemRemove(props.category)}
      size="large">
      <DeleteOutlineRounded/>
    </IconButton>
  );

  const getSecondaryListText = (subcategories: string[]) => {
     if (subcategories.length > 1) {
      if (subcategories.length > 3) {
        let count = subcategories.length - 3;
        let items = subcategories.slice(0, 3).join(", ");
        return t("template.subcategories_include_over_10", { includes: items, count: count });
      } else return t("template.subcategories_include", { includes: subcategories.join(", ") });
    } else if (subcategories.length === 1) {
       return subcategories[0];
     } else {
       return t("empty.subcategories");
     }
  }

  return (
    <ListItem
      button
      key={props.category.categoryId}
      onClick={() => props.onItemSelect(props.category)}>
      <ListItemText
        primary={props.category.categoryName}
        secondary={getSecondaryListText(props.category.subcategories)}/>
      {canDelete &&
        <ListItemSecondaryAction>
          {props.category.count > 0
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