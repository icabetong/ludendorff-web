import { useState, useEffect } from "react";
import { IssuedReportItem } from "./IssuedReport";
import { List, ListItemButton, ListItemText } from "@mui/material";

type GroupedIssuedReportItemTemp = {
  [key: string]: IssuedReportItem[]
}

type GroupedIssuedReportItem = {
  stockNumber: string,
  description?: string,
  items: IssuedReportItem[]
}

type IssuedReportItemPickerListProps = {
  items: IssuedReportItem[],
  onItemSelect: (report: GroupedIssuedReportItem) => void
}
const IssuedReportItemPickerList = (props: IssuedReportItemPickerListProps) => {
  const [items, setItems] = useState<GroupedIssuedReportItem[]>([]);

  useEffect(() => {
    let grouped = props.items.reduce((r, a) => {
      r[a.stockNumber]  = [...r[a.stockNumber] || [], a];
      return r;
    }, {} as GroupedIssuedReportItemTemp);

    let current = Object.keys(grouped).map((key: string) => {
      return {
        stockNumber: key,
        description: grouped[key][0] ? grouped[key][0].description : "",
        items: grouped[key],
      } as GroupedIssuedReportItem
    });
    setItems(current);
  }, [props.items]);

  return (
    <List>
      {
        items.map((item) => {
          return (
            <IssuedReportItemPickerListItem
              key={item.stockNumber}
              item={item}
              onItemSelect={props.onItemSelect}/>
          )
        })
      }
    </List>
  )
}

type IssuedReportItemPickerListItemProps = {
  item: GroupedIssuedReportItem,
  onItemSelect: (item: GroupedIssuedReportItem) => void,
}
const IssuedReportItemPickerListItem = (props: IssuedReportItemPickerListItemProps) => {
  return (
    <ListItemButton onClick={() => props.onItemSelect(props.item)}>
      <ListItemText
        primary={props.item.stockNumber}
        secondary={props.item.description}/>
    </ListItemButton>
  )
}

export { GroupedIssuedReportItem, IssuedReportItemPickerList };