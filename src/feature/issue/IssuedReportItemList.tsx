import { IssuedReportItem } from "./IssuedReport";
import { ListItemButton, ListItemText } from "@mui/material";

type IssuedReportItemListProps = {
  items?: IssuedReportItem[],
  onItemSelected: (item: IssuedReportItem) => void,
}

const IssuedReportItemList = (props: IssuedReportItemListProps) => {
  return (
    <>
      {props.items && props.items.map((item: IssuedReportItem) => {
        return (
          <IssuedReportItemListItem
            item={item}
            onItemSelected={props.onItemSelected}/>
        )
      })
      }
    </>
  )
}

type IssuedReportItemListItemProps = {
  item: IssuedReportItem,
  onItemSelected: (item: IssuedReportItem) => void,
}

const IssuedReportItemListItem = (props: IssuedReportItemListItemProps) => {
  const onListItemClick = () => {
    props.onItemSelected(props.item)
  }
  return (
    <ListItemButton
      key={props.item.stockNumber}
      onClick={onListItemClick}>
      <ListItemText
        primary={props.item.description}
        secondary={props.item.stockNumber}/>
    </ListItemButton>
  )
}

export default IssuedReportItemList;