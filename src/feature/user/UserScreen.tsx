import { useState, useReducer, lazy } from "react";
import { useTranslation } from "react-i18next";
import Box from "@material-ui/core/Box";
import Hidden from "@material-ui/core/Hidden";
import LinearProgress from "@material-ui/core/LinearProgress";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles } from "@material-ui/core/styles";
import { DataGrid, GridOverlay, GridRowParams } from "@material-ui/data-grid";

import PlusIcon from "@heroicons/react/outline/PlusIcon";
import UserIcon from "@heroicons/react/outline/UserIcon";

import ComponentHeader from "../../components/ComponentHeader";
import GridLinearProgress from "../../components/GridLinearProgress";
import PaginationController from "../../components/PaginationController";
import EmptyStateComponent from "../state/EmptyStates";

import { firestore } from "../../index";
import { usePagination } from "../../shared/pagination";
import { newId } from "../../shared/utils";
import { User } from "./User";
import UserList from "./UserList";
import { Department } from "../department/Department";

import {
    UserEditorActionType,
    userEditorInitialState,
    userEditorReducer
} from "./UserEditorReducer";

import {
    DepartmentEditorActionType,
    departmentEditorInitialState,
    departmentEditorReducer
} from "../department/DepartmentEditorReducer";

import {
    userCollection,
    departmentCollection,
    userId,
    firstName,
    lastName,
    email,
    position,
    departmentName
} from "../../shared/const";

const UserEditor = lazy(() => import("./UserEditor"));

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
        { field: userId, headerName: t("id"), hide: true },
        { field: lastName, headerName: t("last_name"), flex: 1 },
        { field: firstName, headerName: t("first_name"), flex: 1 },
        { field: email, headerName: t("email"), flex: 0.5 },
        { field: position, headerName: t("position"), flex: 0.5 }
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
            .collection(userCollection)
            .orderBy(lastName, "asc"), { limit: 15 }
    )

    const [editorState, editorDispatch] = useReducer(userEditorReducer, userEditorInitialState);

    const onUserEditorCommit = (user: User) => {

    }

    const onUserSelected = (user: User) => {
        editorDispatch({
            type: UserEditorActionType.UPDATE,
            payload: user
        })
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
            .collection(departmentCollection)
            .orderBy(departmentName, "asc"), { limit: 15 } 
    );

    const [isDepartmentOpen, setDepartmentOpen] = useState(false);
    const [departmentEditorState, departmentEditorDispatch] = useReducer(departmentEditorReducer, departmentEditorInitialState);

    const onDepartmentItemSelected = (department: Department) => {
        departmentEditorDispatch({
            type: DepartmentEditorActionType.UPDATE,
            payload: department
        })
    }

    const onDepartmentEditorCommit = () => {

    }

    return (
        <Box className={classes.root}>
            <ComponentHeader 
                title={ t("users") } 
                onDrawerToggle={props.onDrawerToggle}
                buttonText={ t("add") }
                buttonIcon={<PlusIcon className={classes.icon}/>}
                buttonOnClick={() => editorDispatch({ type: UserEditorActionType.CREATE })}
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
                        onRowDoubleClick={(params: GridRowParams, e: any) =>
                            onUserSelected(params.row as User)
                        }
                        hideFooter/>
                        
                </div>
            </Hidden>
            <Hidden smUp>
                { !isUsersLoading 
                    ? users.length < 1
                        ? <UserEmptyStateComponent/>
                        : <UserList users={users} onItemSelect={onUserSelected}/>
                    : <LinearProgress/>
                }
            </Hidden>
            { !atUserStart && !atUserEnd &&
                <PaginationController
                    hasPrevious={atUserStart}
                    hasNext={atUserEnd}
                    getPrevious={getPreviousUsers}
                    getNext={getNextUsers}/>
            }

            <UserEditor
                isOpen={editorState.isOpen}
                id={editorState.user?.userId}
                lastName={editorState.user?.lastName}
                firstName={editorState.user?.firstName}
                email={editorState.user?.email}
                permissions={editorState.user?.permissions === undefined ? 0 : editorState.user?.permissions}
                position={editorState.user?.position}
                department={editorState.user?.department}
                onCancel={() => editorDispatch({ type: UserEditorActionType.DISMISS })}
                onSubmit={onUserEditorCommit}
                onLastNameChanged={(lastName) => {
                    let user = editorState.user;
                    if (user === undefined)
                        user = { userId: newId(), permissions: 0 }
                    user!.lastName = lastName;
                    return editorDispatch({
                        type: UserEditorActionType.CHANGED,
                        payload: user
                    });
                }}
                onFirstNameChanged={(firstName) => {
                    let user = editorState.user;
                    if (user === undefined)
                        user = { userId: newId(), permissions: 0 }
                    user!.firstName = firstName;
                    return editorDispatch({
                        type: UserEditorActionType.CHANGED,
                        payload: user
                    });
                }}
                onEmailChanged={(email) => {
                    let user = editorState.user;
                    if (user === undefined)
                        user = { userId: newId(), permissions: 0 }
                    user!.email = email;
                    return editorDispatch({
                        type: UserEditorActionType.CHANGED,
                        payload: user
                    })
                }}
                onPermissionsChanged={(permissions) => {
                    let user = editorState.user;
                    if (user === undefined)
                        user = { userId: newId(), permissions: 0 }
                    user!.permissions = permissions;
                    return editorDispatch({
                        type: UserEditorActionType.CHANGED,
                        payload: user
                    })
                }}
                onPositionChanged={(position) => {
                    let user = editorState.user;
                    if (user === undefined)
                        user = { userId: newId(), permissions: 0 }
                    user!.position = position;
                    return editorDispatch({
                        type: UserEditorActionType.CHANGED,
                        payload: user
                    })
                }}/>

            <DepartmentScreen
                isOpen={isDepartmentOpen}
                departments={departments}
                isLoading={isDepartmentsLoading}
                hasPrevious={atDepartmentStart}
                hasNext={atDepartmentEnd}
                onPrevious={getPreviousDepartments}
                onNext={getNextDepartments}
                onDismiss={() => setDepartmentOpen(false)}
                onAddItem={() => departmentEditorDispatch({
                    type: DepartmentEditorActionType.CREATE
                })}
                onSelectItem={onDepartmentItemSelected}
                onDeleteItem={() => setDepartmentOpen(false)}/>

            <DepartmentEditor
                isOpen={departmentEditorState.isOpen}
                name={departmentEditorState.department?.name}
                onSubmit={onDepartmentEditorCommit}
                onCancel={() => departmentEditorDispatch({
                    type: DepartmentEditorActionType.DISMISS
                })}
                onNameChanged={(name) => {
                    let department = departmentEditorState.department;
                    if (department === undefined)
                        department = { departmentId: newId(), count: 0 }
                    department!.name = name;
                    return departmentEditorDispatch({
                        type: DepartmentEditorActionType.CHANGED,
                        payload: department
                    })
                }}/>
        </Box>
    )
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

export default UserScreen;