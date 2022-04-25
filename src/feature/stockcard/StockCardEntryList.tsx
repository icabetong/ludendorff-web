import { StockCardEntry } from "./StockCard";
import { ListItem, ListItemText } from "@mui/material";

type StockCardEntryListProps = {
  entries?: StockCardEntry[],
  onItemSelected: (entry: StockCardEntry) => void,
}

const StockCardEntryList = (props: StockCardEntryListProps) => {
  return (
    <>
      {props.entries && props.entries.map((entry: StockCardEntry) => {
        return (
          <StockCardEntryListItem
            entry={entry}
            onItemSelected={props.onItemSelected}/>
        )
      })}
    </>
  )
}

type StockCardEntryListItemProps = {
  entry: StockCardEntry,
  onItemSelected: (entry: StockCardEntry) => void
}

const StockCardEntryListItem = (props: StockCardEntryListItemProps) => {
  const onListItemClick = () => {
    props.onItemSelected(props.entry)
  }

  return (
    <ListItem button key={props.entry.stockCardEntryId} onClick={onListItemClick}>
      <ListItemText
        primary={props.entry.reference}
        secondary={props.entry.issueOffice}/>
    </ListItem>
  )
}

export default StockCardEntryList;