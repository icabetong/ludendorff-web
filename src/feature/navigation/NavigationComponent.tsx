import React from "react";
import Box from "@material-ui/core/Box";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import Hidden from "@material-ui/core/Hidden";
import { makeStyles } from "@material-ui/core/styles";

import HomeIcon from "@heroicons/react/outline/HomeIcon";
import QrcodeIcon from "@heroicons/react/outline/QrcodeIcon";
import DesktopComputerIcon from "@heroicons/react/outline/DesktopComputerIcon";
import UserIcon from "@heroicons/react/outline/UserIcon";
import IdentificationIcon from "@heroicons/react/outline/IdentificationIcon";
import CogIcon from "@heroicons/react/outline/CogIcon";

import "./Navigation.scss";

export enum Destination {
    HOME, 
    SCAN, 
    ASSETS, 
    USERS, 
    ASSIGNMENTS,
    SETTINGS
}

type NavigationItemType = {
    icon: JSX.Element,
    title: string,
    destination: Destination
}

const destinations: NavigationItemType[] = [
    { icon: <HomeIcon className="icon"/>, title: "Home", destination: Destination.HOME },
    { icon: <QrcodeIcon className="icon"/>, title: "Scan", destination: Destination.SCAN },
    { icon: <DesktopComputerIcon className="icon"/>, title: "Assets", destination: Destination.ASSETS },
    { icon: <UserIcon className="icon"/>, title: "Users", destination: Destination.USERS },
    { icon: <IdentificationIcon className="icon"/>, title: "Assignments", destination: Destination.ASSIGNMENTS }
]

const minorDestinations: NavigationItemType[] = [
    { icon: <CogIcon className="icon"/>, title: "Settings", destination: Destination.SETTINGS },
]

type NavigationComponentPropsType =  {
    onNavigate: (destination: Destination) => void,
    currentDestination: Destination
}

export const NavigationComponent = (props: NavigationComponentPropsType) => {
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
            </List>
        </Box>
    )
}

type NavigationListPropsType = {
    items: NavigationItemType[],
    destination: Destination,
    onNavigate: (destination: Destination) => void
}

const NavigationList = (props: NavigationListPropsType) => {
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
        <React.Fragment>{
            props.items.map((nav: NavigationItemType) => {
                return (
                    <ListItem 
                        button
                        className={classes.container} 
                        key={nav.destination} 
                        selected={nav.destination === props.destination}
                        onClick={() => props.onNavigate(nav.destination)}>
                        <ListItemIcon>{nav.icon}</ListItemIcon>
                        <Hidden smDown>
                            <ListItemText primary={
                                <Typography variant="body2">{nav.title}</Typography>
                            }/>
                        </Hidden>
                    </ListItem> 
                )
            })
        }</React.Fragment>
    );
}