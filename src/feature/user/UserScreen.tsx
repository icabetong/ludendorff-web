import { useState, lazy } from "react";
import { useTranslation } from "react-i18next";
import Box from "@material-ui/core/Box";
import Hidden from "@material-ui/core/Hidden";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import LinearProgress from "@material-ui/core/LinearProgress";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles } from "@material-ui/core/styles";
import { DataGrid, GridOverlay } from "@material-ui/data-grid";

import PlusIcon from "@heroicons/react/outline/PlusIcon";
import UserIcon from "@heroicons/react/outline/UserIcon";

import ComponentHeader from "../../components/ComponentHeader";
import GridLinearProgress from "../../components/GridLinearProgress";
import ListItemContent from "../../components/ListItemContent";
import PaginationController from "../../components/PaginationController";
import EmptyStateComponent from "../state/EmptyStates";

import { firestore } from "../../index";
import { usePagination } from "../../shared/pagination";
import { User } from "./User";
import { Department } from "../department/Department";

const DepartmentScreen = lazy(() => import("../department/DepartmentScreen"));
const DepartmentEditor = lazy(() => import("../department/DepartmentEditor"));

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

type UserScreenProps = {
    onDrawerToggle: () => void
}

const UserScreen = (props: UserScreenProps) => {
    const { t } = useTranslation();
    const classes = useStyles();

    const columns = [
        { field: User.FIELD_USER_ID, headerName: t("id"), hide: true },
        { field: User.FIELD_LAST_NAME, headerName: t("last_name"), flex: 1 },
        { field: User.FIELD_FIRST_NAME, headerName: t("first_name"), flex: 1 },
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

    const [_userDepartment, setUserDepartment] = useState<Department | undefined>(undefined);

    const onUserSelected = (user: User) => {

    }

    const {
        items: departments,
        isLoading: isDepartmentsLoading,
        isStart: atDepartmentStart,
        isEnd: atDepartmentEnd,
        getPrev: getPreviousDepartments,
        getNext: getNextDepartments,
    } = usePagination<Department>(
        firestore
            .collection(Department.COLLECTION)
            .orderBy(Department.FIELD_DEPARTMENT_NAME, "asc"), { limit: 15 } 
    );


    const [isDepartmentOpen, setDepartmentOpen] = useState(false);
    const [isDepartmentEditorOpen, setDepartmentEditorOpen] = useState(false);
    const [_department, setDepartment] = useState<Department | undefined>(undefined);

    const onDepartmentEditorCommit = (department: Department) => {

    }

    return (
        <Box className={classes.root}>
            <ComponentHeader 
                title={ t("users") } 
                onDrawerToggle={props.onDrawerToggle}
                buttonText={ t("add") }
                buttonIcon={<PlusIcon className={classes.icon}/>}
                menuItems={[
                    <MenuItem key={0} onClick={() => setDepartmentOpen(true)}>{ t("departments") }</MenuItem>
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
                { !isUsersLoading &&
                    <List>{
                        users.map((user: User) => {
                            return <UserListItem
                                        key={user.userId}
                                        user={user}
                                        onClick={onUserSelected}/>
                        })
                    }</List>
                }
            </Hidden>
            {
                !atUserStart && !atUserEnd &&
                <PaginationController
                    hasPrevious={atUserStart}
                    hasNext={atUserEnd}
                    getPrevious={getPreviousUsers}
                    getNext={getNextUsers}/>
            }

            <DepartmentScreen
                isOpen={isDepartmentOpen}
                departments={departments}
                isLoading={isDepartmentsLoading}
                hasPrevious={atDepartmentStart}
                hasNext={atDepartmentEnd}
                onPrevious={getPreviousDepartments}
                onNext={getNextDepartments}
                onDismiss={() => setDepartmentOpen(false)}
                onAddItem={() => setDepartmentEditorOpen(true)}
                onSelectItem={setDepartment}
                onDeleteItem={() => setDepartmentOpen(false)}/>

            <DepartmentEditor
                isOpen={isDepartmentEditorOpen}
                department={_department}
                onSubmit={onDepartmentEditorCommit}
                onCancel={() => setDepartmentEditorOpen(false)}
                onDepartmentChanged={setUserDepartment}/>
        </Box>
    )
}

type UserListPropsType = {
    user: User,
    onClick: (user: User) => void
}

const UserListItem = (props: UserListPropsType) => {
    return (
        <ListItem
            button
            key={props.user.userId}
            onClick={() => props.onClick(props.user)}>
            <ListItemContent
                title={`${props.user.firstName} ${props.user.lastName}`}
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

export default UserScreen