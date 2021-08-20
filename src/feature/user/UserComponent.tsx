import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Box from "@material-ui/core/Box";
import Hidden from "@material-ui/core/Hidden";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import LinearProgress from "@material-ui/core/LinearProgress";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles } from "@material-ui/core/styles";
import { DataGrid, GridRowParams, GridValueGetterParams, GridOverlay } from "@material-ui/data-grid";

import PlusIcon from "@heroicons/react/outline/PlusIcon";
import UserIcon from "@heroicons/react/outline/UserIcon";

import { ComponentHeader } from "../../components/ComponentHeader";
import GridLinearProgress from "../../components/GridLinearProgress";
import ListItemContent from "../../components/ListItemContent";
import EmptyStateComponent from "../state/EmptyStates";

import { firestore } from "../../index";
import { usePagination } from "../../shared/pagination";
import { User, UserRepository } from "./User";

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100%',
        width: '100%'
    },
    icon: {
        width: '1em',
        height: '1em',
        color: theme.palette.primary.contrastText
    },
    dataIcon: {
        width: '4em',
        height: '4em',
        color: theme.palette.text.primary
    },
    wrapper: {
        height: '80%',
        padding: '1.4em'
    }
}));

type UserComponentPropsType = {
    onDrawerToggle: () => void
}

const UserComponent = (props: UserComponentPropsType) => {
    const { t } = useTranslation();
    const classes = useStyles();

    const columns = [
        { field: User.FIELD_USER_ID, headerName: t("id"), hide: true },
        { field: User.FIELD_LAST_NAME, headerName: t("last_name"), flex: 1 },
        { field: User.FIELD_FIRST_NAME, headerName: t("first_name"), flex: 1},
        { field: User.FIELD_EMAIL, headerName: t("email"), flex: 0.5 },
        { field: User.FIELD_POSITION, headerName: t("position"), flex: 0.5 }
    ]

    const {
        items: users,
        isLoading: isUsersLoading,
        isStart: atUserStart,
        isEnd: atUserEnd,
        getPrev: getPreviousUsers,
        getNext: getNextUsers
    } = usePagination<User>(
        firestore
            .collection(User.COLLECTION)
            .orderBy(User.FIELD_LAST_NAME, "asc"), { limit: 15 }
    )

    return (
        <Box className={classes.root}>
            <ComponentHeader 
                title={ t("users") } 
                onDrawerToggle={props.onDrawerToggle}
                buttonText={ t("add") }
                buttonIcon={<PlusIcon className={classes.icon}/>}
                menuItems={[
                    <MenuItem key={0}>{ t("departments") }</MenuItem>
                ]}
            />
            <Hidden xsDown>
                <div className={classes.wrapper}>
                    <DataGrid
                        components={{
                            LoadingOverlay: GridLinearProgress,
                            NoRowsOverlay: EmptyStateOverlay
                        }}
                        rows={users}
                        columns={columns}
                        pageSize={15}
                        loading={isUsersLoading}
                        paginationMode="server"
                        getRowId={(r) => r.userId}
                        hideFooter/>
                        
                </div>
            </Hidden>
            <Hidden smUp>
                { isUsersLoading && <LinearProgress/> }
                { !isUsersLoading && users.length < 1 &&
                    <UserEmptyStateComponent/>
                }
            </Hidden>
        </Box>
    )
}

type UserListPropsType = {
    user: User,
    onClick: (user: User) => void
}

const UserListItem = (props: UserListPropsType) => {
    const displayName = props.user.getDisplayName()
    return (
        <ListItem
            button
            key={props.user.userId}
            onClick={() => props.onClick(props.user)}>
            <ListItemContent
                title={displayName}
                summary={props.user.email}/>
        </ListItem>
    );
}

const EmptyStateOverlay = () => {
    return (
        <GridOverlay>
            <UserEmptyStateComponent/>
        </GridOverlay>
    )
}

const UserEmptyStateComponent = () => {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <EmptyStateComponent
            icon={<UserIcon className={classes.dataIcon}/>}
            title={ t("empty_user") }
            subtitle={ t("empty_user_summary") }/>
    );
}

export default UserComponent