import { useState, lazy } from "react";
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
import { User } from "./User";
import UserList from "./UserList";
import { Department, DepartmentCore } from "../department/Department";

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

    const [isEditorOpen, setEditorOpen] = useState(false);
    const [_userId, setUserId] = useState('');
    const [_userLastName, setUserLastName] = useState('');
    const [_userFirstName, setUserFirstName] = useState('');
    const [_userEmail, setUserEmail] = useState('');
    const [_userPermissions, setUserPermissions] = useState(0);
    const [_userPosition, setUserPosition] = useState('');
    const [_userDepartment, setUserDepartment] = useState<DepartmentCore | undefined>(undefined);

    const onUserEditorCommit = (user: User) => {

    }

    const onUserSelected = (user: User) => {
        setUserId(user.userId);
        setUserLastName(user.lastName === undefined ? '' : user.lastName);
        setUserFirstName(user.firstName === undefined ? '' : user.firstName);
        setUserEmail(user.email === undefined ? '' : user.email);
        setUserPermissions(user.permissions);
        setUserPosition(user.position === undefined ? '' : user.position);
        setUserDepartment(user.department);
        setEditorOpen(true);
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
                buttonOnClick={() => setEditorOpen(true)}
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
            {
                !atUserStart && !atUserEnd &&
                <PaginationController
                    hasPrevious={atUserStart}
                    hasNext={atUserEnd}
                    getPrevious={getPreviousUsers}
                    getNext={getNextUsers}/>
            }

            <UserEditor
                isOpen={isEditorOpen}
                id={_userId}
                lastName={_userLastName}
                firstName={_userFirstName}
                email={_userEmail}
                permissions={_userPermissions}
                position={_userPosition}
                department={_userDepartment}
                onCancel={() => setEditorOpen(false)}
                onSubmit={onUserEditorCommit}
                onLastNameChanged={setUserLastName}
                onFirstNameChanged={setUserFirstName}
                onEmailChanged={setUserEmail}
                onPermissionsChanged={setUserPermissions}
                onPositionChanged={setUserPosition}/>

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