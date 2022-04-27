import { Asset } from "./Asset";
import { List, ListItemButton, ListItemText } from "@mui/material";
import { HitsProvided } from "react-instantsearch-core";
import { connectHits } from "react-instantsearch-dom";
import { assetDescription, assetStockNumber } from "../../shared/const";
import { Highlight } from "../../components/Search";

type AssetSearchListProps = HitsProvided<Asset> & {
  onItemSelect: (asset: Asset) => void
}
const AssetSearchListCore = (props: AssetSearchListProps) => {
  return (
    <List>
      { props.hits.map((asset) => {
        return (
          <AssetSearchListItem
            key={asset.stockNumber}
            asset={asset}
            onItemSelect={props.onItemSelect}/>
        )
      })
      }
    </List>
  )
}

type AssetSearchListItemProps = {
  asset: Asset,
  onItemSelect: (asset: Asset) => void,
}
const AssetSearchListItem = (props: AssetSearchListItemProps) => {
  const onHandleItemClick = () => props.onItemSelect(props.asset);

  return (
    <ListItemButton onClick={onHandleItemClick}>
      <ListItemText
        primary={<Highlight hit={props.asset} attribute={assetDescription}/>}
        secondary={<Highlight hit={props.asset} attribute={assetStockNumber}/>}/>
    </ListItemButton>
  )
}
const AssetSearchList = connectHits<AssetSearchListProps, Asset>(AssetSearchListCore);
export default AssetSearchList;