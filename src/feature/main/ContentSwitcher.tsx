import { Destination } from "../navigation/NavigationContainer";
import { ErrorNotFoundState } from "../state/ErrorStates";
import React from "react";
import AssetScreen from "../asset/AssetScreen";
import InventoryReportScreen from "../inventory/InventoryReportScreen";
import IssuedReportScreen from "../issue/IssuedReportScreen";
import StockCardScreen from "../stockcard/StockCardScreen";
import UserScreen from "../user/UserScreen";
import ProfileScreen from "../profile/ProfileScreen";
import SettingsScreen from "../settings/SettingsScreen";

type ContentSwitcherProps = {
  destination: Destination,
  onDrawerToggle: () => void
}
const ContentSwitcher = (props: ContentSwitcherProps) => {
  switch (props.destination) {
    case "assets":
      return <AssetScreen onDrawerToggle={props.onDrawerToggle}/>
    case "inventories":
      return <InventoryReportScreen onDrawerToggle={props.onDrawerToggle}/>
    case "issued":
      return <IssuedReportScreen onDrawerToggle={props.onDrawerToggle}/>
    case "stockCards":
      return <StockCardScreen onDrawerToggle={props.onDrawerToggle}/>
    case "users":
      return <UserScreen onDrawerToggle={props.onDrawerToggle}/>
    case "account":
      return <ProfileScreen onDrawerToggle={props.onDrawerToggle}/>
    case "settings":
      return <SettingsScreen onDrawerToggle={props.onDrawerToggle}/>
    default:
      return <ErrorNotFoundState/>
  }
}

export default ContentSwitcher;
