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
    case Destination.ASSETS:
      return <AssetScreen onDrawerToggle={props.onDrawerToggle}/>
    case Destination.INVENTORY:
      return <InventoryReportScreen onDrawerToggle={props.onDrawerToggle}/>
    case Destination.ISSUED:
      return <IssuedReportScreen onDrawerToggle={props.onDrawerToggle}/>
    case Destination.STOCK_CARD:
      return <StockCardScreen onDrawerToggle={props.onDrawerToggle}/>
    case Destination.USERS:
      return <UserScreen onDrawerToggle={props.onDrawerToggle}/>
    case Destination.PROFILE:
      return <ProfileScreen onDrawerToggle={props.onDrawerToggle}/>
    case Destination.SETTINGS:
      return <SettingsScreen onDrawerToggle={props.onDrawerToggle}/>
    default:
      return <ErrorNotFoundState/>
  }
}

export default ContentSwitcher;
