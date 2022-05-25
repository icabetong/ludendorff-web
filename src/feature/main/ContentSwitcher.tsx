import React, { lazy, Suspense } from "react";
import { Destination } from "../navigation/NavigationContainer";
import { ErrorNotFoundState } from "../state/ErrorStates";
import { PageLoadingState } from "../state/LoadingStates";

const AssetScreen = lazy(() => import("../asset/AssetScreen"));
const InventoryReportScreen = lazy(() => import("../inventory/InventoryReportScreen"));
const IssuedReportScreen = lazy(() => import("../issue/IssuedReportScreen"));
const StockCardScreen = lazy(() => import("../stockcard/StockCardScreen"));
const UserScreen = lazy(() => import("../user/UserScreen"));
const ProfileScreen = lazy(() => import("../profile/ProfileScreen"));
const SettingsScreen = lazy(() => import("../settings/SettingsScreen"));

type ContentSwitcherProps = {
  destination: Destination,
  onDrawerToggle: () => void
}
const Pages = (props: ContentSwitcherProps) => {
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
const ContentSwitcher = (props: ContentSwitcherProps) => {
  return (
    <Suspense fallback={<PageLoadingState/>}>
      <Pages {...props}/>
    </Suspense>
  )
}

export default ContentSwitcher;
