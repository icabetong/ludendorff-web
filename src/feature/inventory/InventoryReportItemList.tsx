import { InventoryReportItem } from "./InventoryReport";
import { ListItemButton, ListItemText } from "@mui/material";

type InventoryReportItemListProps = {
  items?: InventoryReportItem[],
  onItemSelected: (item: InventoryReportItem) => void,
}

const InventoryReportItemList = (props: InventoryReportItemListProps) => {
  return (
    <>
      {
        props.items && props.items.map((item: InventoryReportItem) => {
          return (
            <InventoryReportItemListItem
              key={item.stockNumber}
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
  const onHandleItemSelect = () => props.onItemSelected(props.item)

  return (
    <ListItemButton
      key={props.item.stockNumber}
      onClick={onHandleItemSelect}>
      <ListItemText
        primary={props.item.description}
        secondary={props.item.article}/>
    </ListItemButton>
  )
}

export default InventoryReportItemList;