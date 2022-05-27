import { IconButton, List, ListItem, ListItemSecondaryAction, ListItemText } from "@mui/material";
import { DeleteOutlineRounded } from "@mui/icons-material";

type SubcategoryListProps = {
  subcategories: string[],
  onItemSelect: (subcategory: string) => void,
  onItemRemove: (subcategory: string) => void,
}

const SubcategoryList = (props: SubcategoryListProps) => {
  return (
    <List>
      {
        props.subcategories.map((subcategory) => {
          return (
            <SubcategoryListItem
              key={subcategory}
              subcategory={subcategory}
              onItemSelect={props.onItemSelect}
              onItemRemove={props.onItemRemove}/>
          )
        })
      }
    </List>
  )
}

type SubcategoryListItemProps = {
  subcategory: string,
  onItemSelect: (subcategory: string) => void,
  onItemRemove: (subcategory: string) => void,
}
const SubcategoryListItem = (props: SubcategoryListItemProps) => {
  const onHandleItemSelect = () => props.onItemSelect(props.subcategory);
  const onHandleItemRemove = () => props.onItemRemove(props.subcategory);

  return (
    <ListItem
      button
      key={props.subcategory}
      onClick={onHandleItemSelect}>
      <ListItemText>{props.subcategory}</ListItemText>
      <ListItemSecondaryAction>
        <IconButton edge="end" onClick={onHandleItemRemove}>
          <DeleteOutlineRounded/>
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default SubcategoryList;