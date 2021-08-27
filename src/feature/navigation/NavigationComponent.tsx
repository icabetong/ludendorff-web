import React, { FunctionComponent, ComponentClass, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import HomeIcon from "@heroicons/react/outline/HomeIcon";
import QrcodeIcon from "@heroicons/react/outline/QrcodeIcon";
import DesktopComputerIcon from "@heroicons/react/outline/DesktopComputerIcon";
import UserGroupIcon from "@heroicons/react/outline/UserGroupIcon";
import IdentificationIcon from "@heroicons/react/outline/IdentificationIcon";
import CogIcon from "@heroicons/react/outline/CogIcon";
import UserIcon from "@heroicons/react/outline/UserIcon";
import LogoutIcon from "@heroicons/react/outline/LogoutIcon";

import firebase from "firebase/app";
import { AuthContext, AuthFetched } from "../auth/AuthProvider";

export enum Destination {
    HOME = 1, 
    SCAN, 
    ASSETS, 
    USERS, 
    ASSIGNMENTS,
    PROFILE,
    SETTINGS
}

type NavigationItemType = {
    icon: string | FunctionComponent<any> | ComponentClass<any, any>,
    title: string,
    destination?: Destination
}

type NavigationComponentPropsType =  {
    onNavigate: (destination: Destination) => void,
    currentDestination: Destination
}

export const NavigationComponent = (props: NavigationComponentPropsType) => {
    const authState = useContext(AuthContext);
    const [triggerConfirmSignOut, setTriggerConfirmSignOut] = useState(false);
    const { t } = useTranslation();

    const destinations: NavigationItemType[] = [
        { icon: HomeIcon, title: "navigation.home", destination: Destination.HOME },
        { icon: QrcodeIcon, title: "navigation.scan", destination: Destination.SCAN },
        { icon: DesktopComputerIcon, title: "navigation.assets", destination: Destination.ASSETS },
        { icon: UserGroupIcon, title: "navigation.users", destination: Destination.USERS },
        { icon: IdentificationIcon, title: "navigation.assignments", destination: Destination.ASSIGNMENTS }
    ]

    const minorDestinations: NavigationItemType[] = [
        { icon: CogIcon, title: "navigation.settings", destination: Destination.SETTINGS },
    ]

    const confirmSignOut = () => {
        setTriggerConfirmSignOut(true);
    }

    const triggerSignOut = () => {
        firebase.auth().signOut();
        setTriggerConfirmSignOut(false);
    }
    
    return (
        <Box>
            <h1>{
                
            }</h1>
            <ListSubheader>{ t("navigation.manage") }</ListSubheader>
            <List>
                <NavigationList 
                    items={destinations} 
                    destination={props.currentDestination}
                    onNavigate={props.onNavigate}/>
            </List>
            <Divider/>
            <ListSubheader>{ t("navigation.account") }</ListSubheader>
            <List>
                <NavigationListItem
                    itemKey={0}
                    navigation={{
                        icon: UserIcon,
                        title: authState instanceof AuthFetched && authState.user?.firstName !== undefined
                            ? authState.user?.firstName
                            : t("profile")
                    }}
                    isActive={false}
                    action={() => props.onNavigate(Destination.PROFILE)}/>
                <NavigationList
                    items={minorDestinations}
                    destination={props.currentDestination}
                    onNavigate={props.onNavigate}/>
                <NavigationListItem
                    itemKey={1}
                    navigation={{icon: LogoutIcon, title: t("signout")}}
                    isActive={false}
                    action={() => confirmSignOut()}/>
            </List>
            <Dialog
                open={triggerConfirmSignOut}
                fullWidth={true}
                maxWidth="xs"
                onClose={() => setTriggerConfirmSignOut(false)}>
                <DialogTitle>{ t("confirm.signout") }</DialogTitle>
                <DialogContent>
                    <DialogContentText>{ t("confirm.signout_message") }</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={() => setTriggerConfirmSignOut(false)}>{ t("cancel") }</Button>
                    <Button color="primary" onClick={triggerSignOut}>{ t("continue") }</Button>
                </DialogActions>
            </Dialog>
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
        },
        navigationText: {
            color: theme.palette.text.primary
        },
        icon: {
            width: '1.6em',
            height: '1.6em',
            color: theme.palette.text.primary
        }
    }))
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <ListItem 
            button
            className={classes.container} 
            key={props.itemKey} 
            selected={props.isActive}
            onClick={props.action}>
            <ListItemIcon>{
                React.createElement(props.navigation.icon,
                    { className: classes.icon }
                )
            }
            </ListItemIcon>
            <ListItemText primary={
                <Typography className={classes.navigationText} variant="body2" noWrap>{ t(props.navigation.title) }</Typography>
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
                            key={navigation.destination}
                            itemKey={navigation.destination}
                            navigation={navigation}
                            action={() => props.onNavigate(navigation.destination!!)}
                            isActive={props.destination === navigation.destination} />
                
            })
        }</React.Fragment>
    );
}