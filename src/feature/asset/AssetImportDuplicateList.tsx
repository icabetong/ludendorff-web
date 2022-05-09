import React from "react";
import { IconButton, List, ListItem, ListSubheader, ListItemText, ListItemSecondaryAction } from "@mui/material";
import { DeleteOutlineRounded } from "@mui/icons-material";
import { AssetImport } from "./AssetImport";
import { newId } from "../../shared/utils";
import { GroupedArray } from "../shared/types/GroupedArray";

type AssetImportDuplicateListProps = {
  assets: GroupedArray<AssetImport>,
  selected?: AssetImport,
  onItemSelected: (asset: AssetImport) => void,
  onItemRemoved: (asset: AssetImport) => void,
}
const AssetImportDuplicateList = (props: AssetImportDuplicateListProps) => {
  return (
    <List>
      {
        Array.from(Object.keys(props.assets).map((stockNumber) => {
          return (
            <React.Fragment key={stockNumber}>
              <ListSubheader>{stockNumber}</ListSubheader>
              {
                props.assets[stockNumber].map((item) => {
                  const key = newId()
                  return (
                    <AssetImportDuplicateListItem
                      key={key}
                      asset={item}
                      active={item === props.selected}
                      onItemSelected={props.onItemSelected}
                      onItemRemoved={props.onItemRemoved}/>
                  )
                })
              }
            </React.Fragment>
          )
        }))
      }
    </List>
  )
}


type AssetImportDuplicateListItemProps = {
  asset: AssetImport,
  active: boolean,
  onItemSelected: (asset: AssetImport) => void,
  onItemRemoved: (asset: AssetImport) => void
}
const AssetImportDuplicateListItem = (props: AssetImportDuplicateListItemProps) => {
  const onHandleItemSelect = () => props.onItemSelected(props.asset);
  const onHandleItemRemove = () => props.onItemRemoved(props.asset);

  return (
    <ListItem button onClick={onHandleItemSelect} selected={props.active}>
      <ListItemText
        primary={props.asset.description}
        secondary={props.asset.remarks}/>
      <ListItemSecondaryAction>
        <IconButton edge="end" onClick={onHandleItemRemove}>
          <DeleteOutlineRounded/>
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default AssetImportDuplicateList;