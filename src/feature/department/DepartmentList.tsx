import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Tooltip,
    makeStyles
} from "@material-ui/core";
import { useSnackbar } from "notistack";

import { OfficeBuildingIcon, TrashIcon } from "@heroicons/react/outline";

import EmptyStateComponent from "../state/EmptyStates";
import PaginationController from "../../components/PaginationController";
import HeroIconButton from "../../components/HeroIconButton";

import { usePermissions } from "../auth/AuthProvider";
import { Department, DepartmentRepository } from "./Department";
import ConfirmationDialog from "../shared/ConfirmationDialog";

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: '60vh'
    },
    uiIcon: {
        width: '4em',
        height: '4em',
        color: theme.palette.text.primary
    },
}));

type DepartmentListProps = {
    departments: Department[],
    hasPrevious: boolean,
    hasNext: boolean,
    onPrevious: () => void,
    onNext: () => void,
    onItemSelect: (department: Department) => void
}

const DepartmentList = (props: DepartmentListProps) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const [department, setDepartment] = useState<Department | undefined>(undefined);

    const onRemoveInvoke = (department: Department) => setDepartment(department);
    const onRemoveDismiss = () => setDepartment(undefined);

    const onDepartmentRemove = () => {
        if (department !== undefined) {
            DepartmentRepository.remove(department)
                .then(() => enqueueSnackbar(t("feedback.department_removed")))
                .catch(() => enqueueSnackbar(t("feedback.department_remove_error")))
                .finally(onRemoveDismiss)
        }
    }

    return (
        <>
            { props.departments.length > 0
            ?   <>
                    <List className={classes.root}>{
                        props.departments.map((department: Department) => {
                            return (
                                <DepartmentItem
                                    key={department.departmentId}
                                    department={department}
                                    onItemSelect={props.onItemSelect}
                                    onItemRemove={onRemoveInvoke}/>
                            )
                        })
                    }</List>
                    <PaginationController
                        hasPrevious={props.hasPrevious}
                        hasNext={props.hasNext}
                        getPrevious={props.onPrevious}
                        getNext={props.onNext}/>
                </>
            : <EmptyStateComponent
                icon={OfficeBuildingIcon}
                title={t("empty_department")}
                subtitle={t("empty_department_summary")}/>
            }
            { department &&
                <ConfirmationDialog
                    isOpen={department !== undefined}
                    title="dialog.department_remove"
                    summary="dialog.department_remove_summary"
                    onDismiss={onRemoveDismiss}
                    onConfirm={onDepartmentRemove}/>
            }
        </>
    );
}

type DepartmentItemProps = {
    department: Department,
    onItemSelect: (department: Department) => void,
    onItemRemove: (department: Department) => void
}

const DepartmentItem = (props: DepartmentItemProps) => {
    const { t } = useTranslation();
    const { canDelete } = usePermissions();

    const deleteButton = (
        <HeroIconButton 
            icon={TrashIcon}
            edge="end" 
            disabled={props.department.count > 0}
            aria-label={t("delete")} 
            onClick={() => props.onItemRemove(props.department)}/>
    );

    return (
        <ListItem
            button
            key={props.department.departmentId}
            onClick={() => props.onItemSelect(props.department)}>
            <ListItemText
                primary={props.department.name}
                secondary={props.department.manager?.name}/>
            { canDelete &&
                <ListItemSecondaryAction>
                    { props.department.count > 0
                        ? <Tooltip title={<>{t("info.department_count_not_zero")}</>}>
                            <span>{deleteButton}</span>
                          </Tooltip>
                        : <>{deleteButton}</>
                    }
                </ListItemSecondaryAction>
            }
        </ListItem>
    )
} 

export default DepartmentList;