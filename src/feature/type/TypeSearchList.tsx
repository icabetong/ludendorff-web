import { Type } from "./Type";
import { List, ListItemButton, ListItemText } from "@mui/material";
import { Highlight } from "../../components/Search";
import { typeName } from "../../shared/const";
import { HitsProvided } from "react-instantsearch-core";
import { connectHits } from "react-instantsearch-dom";

type TypeSearchListProps = HitsProvided<Type> & {
  onItemSelect: (type: Type) => void,
}
const TypeSearchListCore = (props: TypeSearchListProps) => {
  return (
    <List>
      { props.hits.map((type: Type) => {
        return (
          <TypeSearchListItem type={type} onItemSelect={props.onItemSelect}/>
        );
      })
      }
    </List>
  )
}

type TypeSearchListItemProps = {
  type: Type,
  onItemSelect: (type: Type) => void,
}
const TypeSearchListItem = (props: TypeSearchListItemProps) => {
  return (
    <ListItemButton onClick={() => props.onItemSelect(props.type)}>
      <ListItemText
        primary={<Highlight hit={props.type} attribute={typeName}/>}
        secondary={props.type.count}/>
    </ListItemButton>
  )
}
const TypeSearchList = connectHits<TypeSearchListProps, Type>(TypeSearchListCore);
export default TypeSearchList;