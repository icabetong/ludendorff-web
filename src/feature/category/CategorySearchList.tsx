import { useTranslation } from "react-i18next";
import { HitsProvided, connectHits } from "react-instantsearch-core";
import { List, ListItemButton, ListItemText } from "@mui/material";
import { Category } from "./Category";
import Highlight from "../search/Highlight";
import { categoryName } from "../../shared/const";

type CategorySearchListProps = HitsProvided<Category> & {
  onItemSelect: (type: Category) => void,
}
const CategorySearchListCore = (props: CategorySearchListProps) => {
  return (
    <List>
      { props.hits.map((category: Category) => {
        return (
          <CategorySearchListItem
            key={category.categoryId}
            category={category}
            onItemSelect={props.onItemSelect}/>
        );
      })
      }
    </List>
  )
}

type TypeSearchListItemProps = {
  category: Category,
  onItemSelect: (type: Category) => void,
}
const CategorySearchListItem = (props: TypeSearchListItemProps) => {
  const { t } = useTranslation();
  const onHandleItemSelect = () => props.onItemSelect(props.category);

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
    <ListItemButton onClick={onHandleItemSelect}>
      <ListItemText
        primary={<Highlight hit={props.category} attribute={categoryName}/>}
        secondary={getSecondaryListText(props.category.subcategories)}/>
    </ListItemButton>
  )
}
const CategorySearchList = connectHits<CategorySearchListProps, Category>(CategorySearchListCore);
export default CategorySearchList;