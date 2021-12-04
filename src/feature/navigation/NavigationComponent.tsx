import React, { FunctionComponent, ComponentClass, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Divider,
    Typography,
    makeStyles
} from "@material-ui/core";

import {
    HomeIcon,
    DesktopComputerIcon,
    UserGroupIcon,
    IdentificationIcon,
    CogIcon,
    UserIcon,
    LogoutIcon
} from "@heroicons/react/outline";

import firebase from "firebase/app";
import { AuthStatus, useAuthState, usePermissions } from "../auth/AuthProvider";

export enum Destination {
    HOME = 1,
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

const useStyles = makeStyles((theme) => ({
    inset: {
        marginBottom: '1em'
    },
    container: {
        borderRadius: theme.spacing(1),
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        [theme.breakpoints.down("xs")]: {
            paddingLeft: '12px',
            paddingRight: '12px',
        },
        '& .MuiListItemIcon-root': {
            width: '1.6em',
            height: '1.6em',
            color: theme.palette.text.primary
        },
        '&$selected': {
            backgroundColor: theme.palette.type === 'dark' ? 'rgba(189, 147, 249, 0.16)' : 'rgba(98, 114, 164, 0.16)',
            '& .MuiListItemIcon-root': {
                color: theme.palette.primary.main
            },
            '& .MuiListItemText-root': {
                '& .MuiTypography-root': {
                    color: theme.palette.primary.main
                },
            },
        },
        '&:hover': {
            backgroundColor: theme.palette.type === 'dark' ? 'rgba(189, 147, 249, 0.12)' : 'rgba(98, 114, 164, 0.12)',
        }
    },
    navigation: {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1)
    },
    navigationText: {
        color: theme.palette.text.primary
    },
    selected: {},
}));

export const NavigationComponent = (props: NavigationComponentPropsType) => {
    const classes = useStyles();
    const { status, user } = useAuthState();
    const [triggerConfirmSignOut, setTriggerConfirmSignOut] = useState(false);
    const { t } = useTranslation();

    const destinations: NavigationItemType[] = [
        { icon: HomeIcon, title: "navigation.home", destination: Destination.HOME },
        { icon: DesktopComputerIcon, title: "navigation.assets", destination: Destination.ASSETS },
        { icon: UserGroupIcon, title: "navigation.users", destination: Destination.USERS },
        { icon: IdentificationIcon, title: "navigation.assignments", destination: Destination.ASSIGNMENTS },
    ]

    const minorDestinations: NavigationItemType[] = [
        {   icon: UserIcon, 
            title: status === AuthStatus.FETCHED && user?.firstName !== undefined
                ? user!.firstName
                : t("profile"),
            destination: Destination.PROFILE
        }, 
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
            <Box className="inset"/>
            <ListSubheader>{ t("navigation.manage") }</ListSubheader>
            <List className={classes.navigation}>
                <NavigationList 
                    items={destinations} 
                    destination={props.currentDestination}
                    onNavigate={props.onNavigate}/>
            </List>
            <Divider/>
            <ListSubheader>{ t("navigation.account") }</ListSubheader>
            <List className={classes.navigation}>
                <NavigationList
                    items={minorDestinations}
                    destination={props.currentDestination}
                    onNavigate={props.onNavigate}/>
                <NavigationListItem
                    itemKey={1}
                    navigation={{icon: LogoutIcon, title: t("button.signout")}}
                    isActive={false}
                    action={() => confirmSignOut()}/>
            </List>
            <Dialog
                open={triggerConfirmSignOut}
                fullWidth={true}
                maxWidth="xs"
                onClose={() => setTriggerConfirmSignOut(false)}>
                <DialogTitle>{ t("dialog.signout") }</DialogTitle>
                <DialogContent>
                    <DialogContentText>{ t("dialog.signout_message") }</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={() => setTriggerConfirmSignOut(false)}>{ t("button.cancel") }</Button>
                    <Button color="primary" onClick={triggerSignOut}>{ t("button.continue") }</Button>
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
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <ListItem 
            button
            classes={{root: classes.container, selected: classes.selected}} 
            key={props.itemKey} 
            selected={props.isActive}
            onClick={props.action}>
            <ListItemIcon>{ 
                React.createElement(props.navigation.icon)
            }
            </ListItemIcon>
            <ListItemText primary={ <Typography variant="body2">{t(props.navigation.title)}</Typography> }/>
        </ListItem> 
    )
}

type NavigationListPropsType = {
    items: NavigationItemType[],
    destination: Destination,
    onNavigate: (destination: Destination) => void
}

const NavigationList = (props: NavigationListPropsType) => {
    const { canRead, canManageUsers, isAdmin } = usePermissions();

    return (
        <React.Fragment>{
            props.items.map((navigation: NavigationItemType) => {
                if (!canRead && navigation.destination === Destination.ASSETS)
                    return <></>;
                if (!canManageUsers && navigation.destination === Destination.USERS)
                    return <></>;
                if (!isAdmin && navigation.destination === Destination.ASSIGNMENTS)
                    return <></>;

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