import { ListItemButton, ListItemText } from "@mui/material";
import { StockCardEntry } from "./StockCard";

type StockCardEntryListProps = {
  entries?: StockCardEntry[],
  onItemSelected: (entry: StockCardEntry) => void,
}

const StockCardEntryList = (props: StockCardEntryListProps) => {
  return (
    <>
      {
        props.entries && props.entries.map((entry: StockCardEntry) => {
          return (
            <StockCardEntryListItem
              entry={entry}
              onItemSelected={props.onItemSelected}/>
          )
        })
      }
    </>
  )
}

type StockCardEntryListItemProps = {
  entry: StockCardEntry,
  onItemSelected: (entry: StockCardEntry) => void
}

const StockCardEntryListItem = (props: StockCardEntryListItemProps) => {
  const onHandleItemClick = () => props.onItemSelected(props.entry);

  return (
    <ListItemButton
      key={props.entry.stockCardEntryId}
      onClick={onHandleItemClick}>
      <ListItemText
        primary={props.entry.reference}
        secondary={props.entry.issueOffice}/>
    </ListItemButton>
  )
}

export default StockCardEntryList;