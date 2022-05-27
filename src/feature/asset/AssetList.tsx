import { List, ListItemButton, ListItemText } from "@mui/material";

import { Asset } from "./Asset";

type AssetListProps = {
  assets: Asset[],
  onItemSelect: (asset: Asset) => void,
}
const AssetList = (props: AssetListProps) => {
  return (
    <List>
    {
      props.assets.map((asset: Asset) => {
        return (
          <AssetItem
            key={asset.stockNumber}
            asset={asset}
            onItemSelect={props.onItemSelect}/>
        )
      })
    }
    </List>
  )
}

type AssetItemProps = {
  asset: Asset,
  onItemSelect: (asset: Asset) => void,
}
const AssetItem = (props: AssetItemProps) => {
  const onHandleItemSelect = () => props.onItemSelect(props.asset);

  return (
    <ListItemButton
      key={props.asset.stockNumber}
      onClick={onHandleItemSelect}>
      <ListItemText
        primary={props.asset.description}
        secondary={props.asset.category?.categoryName}/>
    </ListItemButton>
  )
}

export default AssetList;