import { useTranslation } from "react-i18next";
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from "@material-ui/core";
import { TrashIcon } from "@heroicons/react/outline";

import { Asset, Status } from "./Asset";
import { usePermissions } from "../auth/AuthProvider";
import HeroIconButton from "../../components/HeroIconButton";

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
            key={asset.assetId}
            asset={asset}
            onItemSelect={props.onItemSelect}
            onItemRemove={props.onItemRemove} />
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
  const { t } = useTranslation();
  const { canDelete } = usePermissions();

  return (
    <ListItem
      button
      key={props.asset.assetId}
      onClick={() => props.onItemSelect(props.asset)}>
      <ListItemText
        primary={props.asset.assetName}
        secondary={props.asset.category?.categoryName} />
      {canDelete &&
        <ListItemSecondaryAction>
          <HeroIconButton
            icon={TrashIcon}
            aria-label={t("button.delete")}
            disabled={props.asset.status === Status.OPERATIONAL}
            onClick={() => props.onItemRemove && props.onItemRemove(props.asset)} />
        </ListItemSecondaryAction>
      }
    </ListItem>
  )
}

export default AssetList;