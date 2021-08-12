import React from "react";
import Box from "@material-ui/core/Box";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import HomeRoundedIcon from "@material-ui/icons/HomeRounded";
import CropFreeRoundedIcon from "@material-ui/icons/CropFreeRounded";
import DesktopWindowsRoundedIcon from "@material-ui/icons/DesktopWindowsRounded";
import GroupRoundedIcon from "@material-ui/icons/GroupRounded";
import AssignmentIndRoundedIcon from "@material-ui/icons/AssignmentIndRounded";
import SettingsRoundedIcon from "@material-ui/icons/SettingsRounded";
import ExitToAppRoundedIcon from "@material-ui/icons/ExitToAppRounded";

import firebase from "firebase/app";

export enum Destination {
    HOME = 1, 
    SCAN, 
    ASSETS, 
    USERS, 
    ASSIGNMENTS,
    SETTINGS
}

type NavigationItemType = {
    icon: JSX.Element,
    title: string,
    destination?: Destination
}

const destinations: NavigationItemType[] = [
    { icon: <HomeRoundedIcon/>, title: "Home", destination: Destination.HOME },
    { icon: <CropFreeRoundedIcon/>, title: "Scan", destination: Destination.SCAN },
    { icon: <DesktopWindowsRoundedIcon/>, title: "Assets", destination: Destination.ASSETS },
    { icon: <GroupRoundedIcon/>, title: "Users", destination: Destination.USERS },
    { icon: <AssignmentIndRoundedIcon />, title: "Assignments", destination: Destination.ASSIGNMENTS }
]

const minorDestinations: NavigationItemType[] = [
    { icon: <SettingsRoundedIcon/>, title: "Settings", destination: Destination.SETTINGS },
]

type NavigationComponentPropsType =  {
    onNavigate: (destination: Destination) => void,
    currentDestination: Destination
}

export const NavigationComponent = (props: NavigationComponentPropsType) => {

    const triggerSignOut = () => {
        firebase.auth().signOut();
    }

    return (
        <Box>
            <List>
                <NavigationList 
                    items={destinations} 
                    destination={props.currentDestination}
                    onNavigate={props.onNavigate}/>
            </List>
            <Divider/>
            <List>
                <NavigationList
                    items={minorDestinations}
                    destination={props.currentDestination}
                    onNavigate={props.onNavigate}/>
                <NavigationListItem
                    itemKey={0}
                    navigation={{icon: <ExitToAppRoundedIcon/>, title: "Sign-out"}}
                    isActive={false}
                    action={() => triggerSignOut()}/>
            </List>
        </Box>
    )
}

type NavigationListItemPropsType = {
    itemKey: any,
    navigation: NavigationItemType,
    action: () => void,
    isActive: boolean
}

const NavigationListItem = (props: NavigationListItemPropsType) => {
    const useStyles = makeStyles((theme) => ({
        container: {
            [theme.breakpoints.down("xs")]: {
                paddingLeft: '12px',
                paddingRight: '12px',
            }
        }
    }))
    const classes = useStyles();

    return (
        <ListItem 
                button
                className={classes.container} 
                key={props.itemKey} 
                selected={props.isActive}
                onClick={props.action}>
                <ListItemIcon>{props.navigation.icon}</ListItemIcon>
                <ListItemText primary={
                    <Typography variant="body2" noWrap>{props.navigation.title}</Typography>
                }/>
            </ListItem> 
    )
}

type NavigationListPropsType = {
    items: NavigationItemType[],
    destination: Destination,
    onNavigate: (destination: Destination) => void
}

const NavigationList = (props: NavigationListPropsType) => {

    return (
        <React.Fragment>{
            props.items.map((navigation: NavigationItemType) => {
                return <NavigationListItem
                            itemKey={navigation.destination}
                            navigation={navigation}
                            action={() => props.onNavigate(navigation.destination!!)}
                            isActive={props.destination === navigation.destination} />
                
            })
        }</React.Fragment>
    );
}