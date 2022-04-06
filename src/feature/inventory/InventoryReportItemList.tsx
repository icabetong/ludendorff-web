import { InventoryReportItem } from "./InventoryReport";
import { ListItem, ListItemText } from "@mui/material";

type InventoryReportItemListProps = {
  items?: InventoryReportItem[],
  onItemSelected: (item: InventoryReportItem) => void,
}

const InventoryReportItemList = (props: InventoryReportItemListProps) => {
  return (
    <>
      {props.items && props.items.map((item: InventoryReportItem) => {
        return (
          <InventoryReportItemListItem
            item={item}
            onItemSelected={props.onItemSelected}/>
        )
      })
      }
    </>
  )
}

type InventoryReportItemListItemProps = {
  item: InventoryReportItem,
  onItemSelected: (item: InventoryReportItem) => void,
}

const InventoryReportItemListItem = (props: InventoryReportItemListItemProps) => {
  const onListItemClick = () => {
    props.onItemSelected(props.item)
  }
  return (
    <ListItem
      button
      key={props.item.stockNumber}
      onClick={onListItemClick}>
      <ListItemText
        primary={props.item.description}
        secondary={props.item.article}/>
    </ListItem>
  )
}

export default InventoryReportItemList;