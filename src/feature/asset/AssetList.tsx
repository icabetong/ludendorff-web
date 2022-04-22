import { List, ListItem, ListItemText } from "@mui/material";

import { Asset } from "./Asset";

type AssetListProps = {
  assets: Asset[],
  onItemSelect: (asset: Asset) => void,
  onItemRemove?: (asset: Asset) => void,
}
const AssetList = (props: AssetListProps) => {
  return (
    <List>{
      props.assets.map((asset: Asset) => {
        return (
          <AssetItem
            key={asset.stockNumber}
            asset={asset}
            onItemSelect={props.onItemSelect}
            onItemRemove={props.onItemRemove}/>
        )
      })
    }</List>
  )
}

type AssetItemProps = {
  asset: Asset,
  onItemSelect: (asset: Asset) => void,
  onItemRemove?: (asset: Asset) => void,
}
const AssetItem = (props: AssetItemProps) => {
  return (
    <ListItem
      button
      key={props.asset.stockNumber}
      onClick={() => props.onItemSelect(props.asset)}>
      <ListItemText
        primary={props.asset.description}
        secondary={props.asset.category?.categoryName}/>
    </ListItem>
  )
}

export default AssetList;