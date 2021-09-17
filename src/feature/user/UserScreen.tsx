import { useState, useReducer, lazy } from "react";
import { useTranslation } from "react-i18next";
import Box from "@material-ui/core/Box";
import Hidden from "@material-ui/core/Hidden";
import LinearProgress from "@material-ui/core/LinearProgress";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles } from "@material-ui/core/styles";
import { DataGrid, GridOverlay, GridRowParams, GridValueGetterParams, GridCellParams } from "@material-ui/data-grid";
import { useSnackbar } from "notistack";

import {
    BanIcon,
    CheckIcon,
    PlusIcon,
    UserIcon,
    TrashIcon,
} from "@heroicons/react/outline";

import ComponentHeader from "../../components/ComponentHeader";
import GridLinearProgress from "../../components/GridLinearProgress";
import GridToolbar from "../../components/GridToolbar";
import HeroIconButton from "../../components/HeroIconButton";
import PaginationController from "../../components/PaginationController";
import EmptyStateComponent from "../state/EmptyStates";

import { usePermissions } from "../auth/AuthProvider";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { usePreferences } from "../settings/Preference";
import { User, minimize, UserRepository } from "./User";
import UserList from "./UserList";

import { firestore } from "../../index";
import { usePagination } from "../../shared/pagination";
import { newId } from "../../shared/utils";

import { 
    Department, 
    DepartmentRepository,
    minimize as minimizeDepartment 
} from "../department/Department";

import {
    UserEditorActionType,
    userEditorInitialState,
    userEditorReducer
} from "./UserEditorReducer";

import {
    UserRemoveActionType,
    userRemoveInitialState,
    userRemoveReducer
} from "./UserRemoveReducer";

import {
    DepartmentEditorActionType,
    departmentEditorInitialState,
    departmentEditorReducer
} from "../department/DepartmentEditorReducer";

import {
    DepartmentRemoveActionType,
    departmentRemoveInitialState,
    departmentRemoveReducer
} from "../department/DepartmentRemoveReducer";

import {
    userCollection,
    departmentCollection,
    userId,
    firstName,
    lastName,
    email,
    position,
    department,
    departmentName
} from "../../shared/const";

import ConfirmationDialog from "../shared/ItemRemoveDialog";


const UserEditor = lazy(() => import("./UserEditor"));
const UserPicker = lazy(() => import("./UserPicker"));

const DepartmentScreen = lazy(() => import("../department/DepartmentScreen"));
const DepartmentEditor = lazy(() => import("../department/DepartmentEditor"));
const DepartmentPicker = lazy(() => import("../department/DepartmentPicker"));

const useStyles = makeStyles(() => ({
    root: {
        height: '100%',
        width: '100%'
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
    const { enqueueSnackbar } = useSnackbar();
    const { canRead, canManageUsers } = usePermissions();
    const preferences = usePreferences();

    const columns = [
        { field: userId, headerName: t("field.id"), hide: true },
        { field: lastName, headerName: t("field.last_name"), flex: 1 },
        { field: firstName, headerName: t("field.first_name"), flex: 1 },
        { field: email, headerName: t("field.email"), flex: 1 },
        { 
            field: position, 
            headerName: t("field.position"), 
            flex: 1,
            valueGetter: (params: GridValueGetterParams) => {
                let user = params.row as User;
                return user.position === undefined ? t("unknown") : user.position;
            } 
        },
        { 
            field: department, 
            headerName: t("field.department"), 
            flex: 1,
            valueGetter: (params: GridValueGetterParams) => {
                let user = params.row as User;
                return user.department?.name === undefined ? t("unknown") : user.department?.name;
            } 
        },{
            field: "manage",
            headerName: t("navigation.manage"),
            flex: 0.4,
            disableColumnMenu: true,
            sortable: false,
            renderCell: (params: GridCellParams) => {
                return (
                    <HeroIconButton
                        icon={params.row.disabled ? CheckIcon : BanIcon}
                        aria-label={params.row.disabled ? t("button.enable") : t("button.disable")}
                        onClick={() => onUserRequestChangeState(params.row as User)}/>
                )
            }
        },
        {
            field: "delete",
            headerName: t("button.delete"),
            flex: 0.4,
            disableColumnMenu: true,
            sortable: false,
            renderCell: (params: GridCellParams) => {
                return (
                    <HeroIconButton 
                        icon={TrashIcon}
                        aria-label={t("delete")}
                        onClick={() => onUserRequestRemove(params.row as User)}/>
                )
            }
        }
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
    const [isPickerOpen, setPickerOpen] = useState(false);

    const onUserPickerView = () => { setPickerOpen(true) }
    const onUserPickerDismiss = () => { setPickerOpen(false) }

    const onDataGridRowDoubleClick = (params: GridRowParams) => {
        onUserSelected(params.row as User)
    }

    const onUserEditorView = () => {
        editorDispatch({ 
            type: UserEditorActionType.CREATE 
        })
    }

    const onUserEditorDismiss = () => {
        editorDispatch({
            type: UserEditorActionType.DISMISS
        })
    }

    const onUserEditorLastNameChanged = (lastName: string) => {
        let user = editorState.user;
        if (user === undefined)
            user = { userId: newId(), permissions: [], disabled: false }
        user!.lastName = lastName;
        editorDispatch({
            type: UserEditorActionType.CHANGED,
            payload: user
        });
    }

    const onUserEditorFirstNameChanged = (firstName: string) => {
        let user = editorState.user;
        if (user === undefined)
            user = { userId: newId(), permissions: [], disabled: false }
        user!.firstName = firstName;
        editorDispatch({
            type: UserEditorActionType.CHANGED,
            payload: user
        });
    }

    const onUserEditorEmailAddressChanged = (email: string) => {
        let user = editorState.user;
        if (user === undefined)
            user = { userId: newId(), permissions: [], disabled: false }
        user!.email = email;
        editorDispatch({
            type: UserEditorActionType.CHANGED,
            payload: user
        })
    }

    const onUserEditorPermissionsChanged = (permissions: number[]) => {
        let user = editorState.user;
        if (user === undefined)
            user = { userId: newId(), permissions: [], disabled: false }
        user!.permissions = permissions;
        editorDispatch({
            type: UserEditorActionType.CHANGED,
            payload: user
        })
    }

    const onUserEditorPositionChanged = (position: string) => {
        let user = editorState.user;
        if (user === undefined)
            user = { userId: newId(), permissions: [], disabled: false }
        user!.position = position;
        editorDispatch({
            type: UserEditorActionType.CHANGED,
            payload: user
        })
    }

    const onUserDepartmentSelected = (department: Department) => {
        let user = editorState.user;
        if (user === undefined)
            user = { userId: newId(), permissions: [], disabled: false }
        user!.department = minimizeDepartment(department);
        setDepartmentPickerOpen(false);
        editorDispatch({
            type: UserEditorActionType.CHANGED,
            payload: user
        })
    }

    const onUserEditorCommit = () => {
        let user = editorState.user;
        if (user === undefined)
            return;

        if (editorState.isCreate) {
            UserRepository.create(user)
                .then(() => {
                    enqueueSnackbar(t("feedback.user_created"));
                }).catch(() => {
                    enqueueSnackbar(t("feedback.user_create_error"));
                }).finally(() => {
                    editorDispatch({ type: UserEditorActionType.DISMISS })
                })
        } else {
            UserRepository.update(user)
                .then(() => {
                    enqueueSnackbar(t("feedback.user_updated"))
                }).catch(() => {
                    enqueueSnackbar(t("feedback.user_update_error"))
                }).finally(() => {
                    editorDispatch({ type: UserEditorActionType.DISMISS })
                })
        }
    }

    const [removeState, removeDispatch] = useReducer(userRemoveReducer, userRemoveInitialState);

    const onUserRequestRemove = (user: User) => {
        removeDispatch({
            type: UserRemoveActionType.REQUEST,
            payload: user
        })
    }

    const onUserRequestRemoveDismiss = () => {
        removeDispatch({
            type: UserRemoveActionType.DISMISS
        })
    }

    const onUserRemove = () => {
        let user = removeState.user;
        if (user === undefined)
            return;

        UserRepository.remove(user)
            .then(() => {
                enqueueSnackbar(t("feedback.user_removed"));
            }).catch(() => {
                enqueueSnackbar(t("feedback.user_remove_error"));
            }).finally(() => {
                removeDispatch({
                    type: UserRemoveActionType.DISMISS
                })
            })
    }

    const onUserRequestChangeState = (user: User) => {

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
    const [isDepartmentPickerOpen, setDepartmentPickerOpen] = useState(false);
    
    const [departmentEditorState, departmentEditorDispatch] = useReducer(departmentEditorReducer, departmentEditorInitialState);
    const [departmentRemoveState, departmentRemoveDispatch] = useReducer(departmentRemoveReducer, departmentRemoveInitialState);

    const onDepartmentView = () => { setDepartmentOpen(true) }
    const onDepartmentDismiss = () => { setDepartmentOpen(false) }

    const onDepartmentPickerView = () => { setDepartmentPickerOpen(true) }
    const onDepartmentPickerDismiss = () => { setDepartmentPickerOpen(false) }

    const onDepartmentItemSelected = (department: Department) => {
        departmentEditorDispatch({
            type: DepartmentEditorActionType.UPDATE,
            payload: department
        })
    }

    const onDepartmentManagerSelected = (user: User) => {
        let department = departmentEditorState.department;
        if (department === undefined)
            department = { departmentId: newId(), count: 0 }
        department!.manager = minimize(user);
        setPickerOpen(false);
        departmentEditorDispatch({
            type: DepartmentEditorActionType.CHANGED,
            payload: department,
        })
    }

    const onDepartmentEditorView = () => {
        departmentEditorDispatch({
            type: DepartmentEditorActionType.CREATE
        })
    }

    const onDepartmentEditorDismiss = () => {
        departmentEditorDispatch({
            type: DepartmentEditorActionType.DISMISS
        })
    }

    const onDepartmentEditorNameChanged = (name: string) => {
        let department = departmentEditorState.department;
        if (department === undefined)
            department = { departmentId: newId(), count: 0 }
        department!.name = name;
        departmentEditorDispatch({
            type: DepartmentEditorActionType.CHANGED,
            payload: department
        })
    }

    const onDepartmentEditorCommit = () => {
        let department = departmentEditorState.department;
        if (department === undefined)
            return;

        if (departmentEditorState.isCreate) {
            DepartmentRepository.create(department)
                .then(() => {
                    enqueueSnackbar(t("feedback.department_created"));
                    
                }).catch(() => {
                    enqueueSnackbar(t("feedback.department_create_error"));

                }).finally(() => {
                    departmentEditorDispatch({ type: DepartmentEditorActionType.DISMISS })
                })
        } else {
            DepartmentRepository.update(department)
                .then(() => {
                    enqueueSnackbar(t("feedback.department_updated"));

                }).catch(() => {
                    enqueueSnackbar(t("feedback.department_update_error"))

                }).finally(() => {
                    departmentEditorDispatch({ type: DepartmentEditorActionType.DISMISS })
                })
        }
    }

    const onDepartmentItemRequestRemove = (department: Department) => {
        departmentRemoveDispatch({
            type: DepartmentRemoveActionType.REQUEST,
            payload: department
        })
    }

    const onDepartmentItemRemove = () => {
        let department = departmentRemoveState.department;
        if (department === undefined)
            return;

        DepartmentRepository.remove(department)
            .then(() => {
                enqueueSnackbar(t("feedback.department_removed"));

            }).catch(() => {
                enqueueSnackbar(t("feedback.department_remove_error"));

            }).finally(() => {
                departmentRemoveDispatch({
                    type: DepartmentRemoveActionType.DISMISS
                })
            })
    }

    const onDismissDepartmentConfirmation = () => {
        departmentRemoveDispatch({
            type: DepartmentRemoveActionType.DISMISS
        })
    }
    
    return (
        <Box className={classes.root}>
            <ComponentHeader 
                title={ t("navigation.users") } 
                onDrawerToggle={props.onDrawerToggle}
                buttonText={
                    canManageUsers 
                    ? t("button.add") 
                    : undefined
                }
                buttonIcon={PlusIcon}
                buttonOnClick={onUserEditorView}
                menuItems={[
                    <MenuItem key={0} onClick={onDepartmentView}>{ t("navigation.departments") }</MenuItem>
                ]}
            />
            { canRead || canManageUsers 
                ? <>
                    <Hidden xsDown>
                        <div className={classes.wrapper}>
                            <DataGrid
                                components={{
                                    LoadingOverlay: GridLinearProgress,
                                    NoRowsOverlay: EmptyStateOverlay,
                                    Toolbar: GridToolbar
                                }}
                                rows={users}
                                columns={columns}
                                density={preferences.density}
                                pageSize={15}
                                loading={isUsersLoading}
                                paginationMode="server"
                                getRowId={(r) => r.userId}
                                onRowDoubleClick={onDataGridRowDoubleClick}
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
                </>
                : <ErrorNoPermissionState/>
            }

            <UserEditor
                isOpen={editorState.isOpen}
                id={editorState.user?.userId}
                lastName={editorState.user?.lastName}
                firstName={editorState.user?.firstName}
                email={editorState.user?.email}
                permissions={editorState.user?.permissions === undefined ? [] : editorState.user?.permissions}
                position={editorState.user?.position}
                department={editorState.user?.department}
                onCancel={onUserEditorDismiss}
                onSubmit={onUserEditorCommit}
                onDepartmentSelect={onDepartmentPickerView}
                onLastNameChanged={onUserEditorLastNameChanged}
                onFirstNameChanged={onUserEditorFirstNameChanged}
                onEmailChanged={onUserEditorEmailAddressChanged}
                onPermissionsChanged={onUserEditorPermissionsChanged}
                onPositionChanged={onUserEditorPositionChanged}/>

            <UserPicker
                isOpen={isPickerOpen}
                users={users}
                isLoading={isUsersLoading}
                hasPrevious={atUserStart}
                hasNext={atUserEnd}
                onPrevious={getPreviousUsers}
                onNext={getNextUsers}
                onDismiss={onUserPickerDismiss}
                onSelectItem={onDepartmentManagerSelected}/>

            <DepartmentScreen
                isOpen={isDepartmentOpen}
                departments={departments}
                isLoading={isDepartmentsLoading}
                hasPrevious={atDepartmentStart}
                hasNext={atDepartmentEnd}
                onPrevious={getPreviousDepartments}
                onNext={getNextDepartments}
                onDismiss={onDepartmentDismiss}
                onAddItem={onDepartmentEditorView}
                onSelectItem={onDepartmentItemSelected}
                onDeleteItem={onDepartmentItemRequestRemove}/>

            <DepartmentEditor
                isOpen={departmentEditorState.isOpen}
                name={departmentEditorState.department?.name}
                manager={departmentEditorState.department?.manager}
                onSubmit={onDepartmentEditorCommit}
                onCancel={onDepartmentEditorDismiss}
                onManagerSelect={onUserPickerView}
                onNameChanged={onDepartmentEditorNameChanged}/>

            <DepartmentPicker
                isOpen={isDepartmentPickerOpen}
                departments={departments}
                isLoading={isDepartmentsLoading}
                hasPrevious={atDepartmentStart}
                hasNext={atDepartmentEnd}
                onPrevious={getPreviousDepartments}
                onNext={getNextDepartments}
                onDismiss={onDepartmentPickerDismiss}
                onAddItem={onDepartmentEditorView}
                onSelectItem={onUserDepartmentSelected}
                onDeleteItem={onDepartmentItemRequestRemove}/>

            <ConfirmationDialog
                isOpen={departmentRemoveState.isRequest}
                title="dialog.department_remove"
                summary="dialog.department_remove_summary"
                onDismiss={onDismissDepartmentConfirmation}
                onConfirm={onDepartmentItemRemove}/>

            <ConfirmationDialog
                isOpen={removeState.isRequest}
                title="dialog.user_remove"
                summary="dialog.user_remove_summary"
                onDismiss={onUserRequestRemoveDismiss}
                onConfirm={onUserRemove}/>
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
    const { t } = useTranslation();

    return (
        <EmptyStateComponent
            icon={UserIcon}
            title={ t("empty_user") }
            subtitle={ t("empty_user_summary") }/>
    );
}

export default UserScreen;