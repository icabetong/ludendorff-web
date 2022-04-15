import { StockCard } from "./StockCard";
import { List, ListItem, ListItemText } from "@mui/material";

type StockCardListProps = {
  stockCards: StockCard[],
  onItemSelect: (stockCard: StockCard) => void,
  onItemRemove: (stockCard: StockCard) => void,
}

const StockCardList = (props: StockCardListProps) => {
  return (
    <List>
      {
        props.stockCards.map((stockCard: StockCard) => {
          return (
            <StockCardListItem
              key={stockCard.stockCardId}
              stockCard={stockCard}
              onItemSelect={props.onItemSelect}/>
          )
        })
      }
    </List>
  )
}

type StockCardListItemProps = {
  stockCard: StockCard,
  onItemSelect: (stockCard: StockCard) => void,
  onItemRemove?: (stockCard: StockCard) => void,
}
const StockCardListItem = (props: StockCardListItemProps) => {
  return (
    <ListItem
      button
      key={props.stockCard.stockCardId}
      onClick={() => props.onItemSelect(props.stockCard)}>
      <ListItemText
        primary={props.stockCard.description}
        secondary={props.stockCard.entityName}/>
    </ListItem>
  )
}

export default StockCardList