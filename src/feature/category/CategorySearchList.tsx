import { Category } from "./Category";
import { List, ListItemButton, ListItemText } from "@mui/material";
import { Highlight } from "../../components/Search";
import { categoryName } from "../../shared/const";
import { HitsProvided } from "react-instantsearch-core";
import { connectHits } from "react-instantsearch-dom";

type CategorySearchListProps = HitsProvided<Category> & {
  onItemSelect: (type: Category) => void,
}
const CategorySearchListCore = (props: CategorySearchListProps) => {
  return (
    <List>
      { props.hits.map((category: Category) => {
        return (
          <CategorySearchListItem category={category} onItemSelect={props.onItemSelect}/>
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
  return (
    <ListItemButton onClick={() => props.onItemSelect(props.category)}>
      <ListItemText
        primary={<Highlight hit={props.category} attribute={categoryName}/>}
        secondary={props.category.count}/>
    </ListItemButton>
  )
}
const CategorySearchList = connectHits<CategorySearchListProps, Category>(CategorySearchListCore);
export default CategorySearchList;