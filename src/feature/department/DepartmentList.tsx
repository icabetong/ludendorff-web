import React from "react";
import { useTranslation } from "react-i18next";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import { makeStyles } from "@material-ui/core/styles";

import { OfficeBuildingIcon, TrashIcon } from "@heroicons/react/outline";

import EmptyStateComponent from "../state/EmptyStates";
import PaginationController from "../../components/PaginationController";

import { Department } from "./Department";

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: '60vh'
    },
    uiIcon: {
        width: '4em',
        height: '4em',
        color: theme.palette.text.primary
    },
    actionIcon: {
        width: '1em',
        height: '1em',
        color: theme.palette.text.primary
    }
}));

type DepartmentListProps = {
    departments: Department[],
    hasPrevious: boolean,
    hasNext: boolean,
    onPrevious: () => void,
    onNext: () => void,
    onItemSelect: (department: Department) => void,
    onItemRemove: (department: Department) => void
}

const DepartmentList = (props: DepartmentListProps) => {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <React.Fragment>
            { props.departments.length > 0
            ?   <React.Fragment>
                    <List className={classes.root}>{
                        props.departments.map((department: Department) => {
                            return (
                                <DepartmentItem
                                    key={department.departmentId}
                                    department={department}
                                    onItemSelect={props.onItemSelect}
                                    onItemRemove={props.onItemRemove}/>
                            )
                        })
                    }</List>
                    { !props.hasNext && !props.hasPrevious &&
                        <PaginationController
                            hasPrevious={props.hasPrevious}
                            hasNext={props.hasNext}
                            getPrevious={props.onPrevious}
                            getNext={props.onNext}/>
                    }
                </React.Fragment>
            : <EmptyStateComponent
                icon={OfficeBuildingIcon}
                title={t("empty_department")}
                subtitle={t("empty_department_summary")}/>
            }
        </React.Fragment>
    );
}

type DepartmentItemProps = {
    department: Department,
    onItemSelect: (department: Department) => void,
    onItemRemove: (department: Department) => void
}

const DepartmentItem = (props: DepartmentItemProps) => {
    const { t } = useTranslation();
    const classes = useStyles();

    return (
        <ListItem
            button
            key={props.department.departmentId}
            onClick={() => props.onItemSelect(props.department)}>
            <ListItemText
                primary={props.department.name}
                secondary={props.department.manager?.name}/>
            <ListItemSecondaryAction>
                <IconButton edge="end" aria-label={t("delete")} onClick={() => props.onItemRemove(props.department)}>
                    <TrashIcon className={classes.actionIcon}/>
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    )
} 

export default DepartmentList;