import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Typography from "@material-ui/core/Typography";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles, useTheme } from "@material-ui/core/styles";

import { TrashIcon, OfficeBuildingIcon } from "@heroicons/react/outline";

import ListItemContent from "../../components/ListItemContent";
import PaginationController from "../../components/PaginationController";
import EmptyStateComponent from "../state/EmptyStates";

import { Department, DepartmentRepository } from "./Department";

const useStyles = makeStyles(() => ({
    root: {
        minHeight: '60vh'
    },
    stateIcon: {
        width: '4em',
        height: '4em'
    },
    listItemIcon: {
        width: '1em',
        height: '1em',
    }
}));

type DepartmentComponentPropsType = {
    isOpen: boolean,
    departments: Department[],
    isLoading: boolean,
    hasPrevious: boolean,
    hasNext: boolean,
    onPrevious: () => void,
    onNext: () => void,
    onDismiss: () => void,
    onAddItem: () => void,
    onSelectItem: () => void,
    onDeleteItem: () => void
}

const DepartmentComponent = (props: DepartmentComponentPropsType) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

    return (
        <Dialog
            fullScreen={isMobile}
            fullWidth={true}
            maxWidth="sm"
            open={props.isOpen}
            onClose={() => props.onDismiss() }>
            <DialogTitle>{ t("departments") }</DialogTitle>
            <DialogContent dividers={true}>
                <DepartmentList
                    departments={props.departments}
                    hasPrevious={props.hasPrevious}
                    hasNext={props.hasNext}
                    onPreviousBatch={props.onPrevious}
                    onNextBatch={props.onNext}
                    onItemSelect={props.onSelectItem}
                    onItemDelete={props.onDeleteItem}/>
            </DialogContent>
            <DialogActions>
            <Button color="primary" onClick={() => props.onAddItem()}>{ t("add") }</Button>
                <div style={{flex: '1 0 0'}}></div>
                <Button color="primary" onClick={() => props.onDismiss()}>{ t("close") }</Button>
            </DialogActions>
        </Dialog>
    )
}

type DepartmentListPropsType = {
    departments: Department[],
    hasPrevious: boolean,
    hasNext: boolean,
    onPreviousBatch: () => void,
    onNextBatch: () => void,
    onItemSelect: (department: Department) => void,
    onItemDelete: (department: Department) => void
}

const DepartmentList = (props: DepartmentListPropsType) => {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <React.Fragment>
            { props.departments.length > 0
                ? <React.Fragment>
                    <List className={classes.root}>{
                        props.departments.map((department: Department) => {
                            return <DepartmentItem
                                        key={department.departmentId}
                                        department={department}
                                        onItemSelect={props.onItemSelect}
                                        onItemDelete={props.onItemDelete}/>
                        })
                    }</List>
                    { !props.hasNext && !props.hasPrevious &&
                        <PaginationController
                            hasPrevious={props.hasPrevious}
                            hasNext={props.hasNext}
                            getPrevious={props.onPreviousBatch}
                            getNext={props.onNextBatch}/>
                    }
                    </React.Fragment>
            :   <EmptyStateComponent
                    icon={<OfficeBuildingIcon className={classes.stateIcon}/>}
                    title={t("empty_department")}
                    subtitle={t("empty_department_summary")}/>
            } 
        </React.Fragment>
    )
}

type DepartmentItemPropsType = {
    department: Department,
    onItemSelect: (department: Department) => void,
    onItemDelete: (department: Department) => void,
}

const DepartmentItem = (props: DepartmentItemPropsType) => {
    const { t } = useTranslation();
    const classes = useStyles();

    return (
        <ListItem
            dense
            button
            key={props.department.departmentId}
            onClick={() => props.onItemSelect(props.department)}>
            <ListItemText
                primary={
                    <Typography variant="body2">{props.department.name}</Typography>
                }
                secondary={
                    <Typography variant="caption">{props.department.managerSSN?.name}</Typography>
                }/>
            <ListItemSecondaryAction>
                <IconButton edge="end" aria-label={t("delete")} onClick={() => props.onItemDelete(props.department)}>
                    <TrashIcon className={classes.listItemIcon}/>
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    )
}

export default DepartmentComponent;