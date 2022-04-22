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
      { props.subcategories.map((subcategory) => {
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
  return (
    <ListItem
      button
      key={props.subcategory}
      onClick={() => props.onItemRemove(props.subcategory)}>
      <ListItemText>{props.subcategory}</ListItemText>
      <ListItemSecondaryAction>
        <IconButton edge="end" onClick={() => props.onItemRemove(props.subcategory)}>
          <DeleteOutlineRounded/>
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default SubcategoryList;