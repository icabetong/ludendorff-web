import React, { FunctionComponent, ComponentClass } from "react";
import { useTranslation } from "react-i18next";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import { makeStyles } from "@material-ui/core/styles"; 

type ProfileAction = {
    key: string,
    icon: FunctionComponent<any> | ComponentClass<any, any>,
    title: string,
    action: () => void
}

const useStyles = makeStyles((theme) => ({
    icon: { width: '2em', height: '2em' },
    container: {
        '& .MuiListItem-root': {
            borderRadius: theme.spacing(1)
        }
    }
}));

type ProfileActionListProps = {
    actions: ProfileAction[]
}

const ProfileActionList = (props: ProfileActionListProps) => {
    const { t } = useTranslation();
    const classes = useStyles();

    return (
        <React.Fragment>
            <ListSubheader>{ t("actions") }</ListSubheader>
            <List className={classes.container}>
                { props.actions.map((action) => 
                    <ProfileActionItem action={action}/>
                )}
            </List>
        </React.Fragment>
    )
} 

type ProfileActionItemProps = {
    action: ProfileAction
}
const ProfileActionItem = (props: ProfileActionItemProps) => {
    const { t } = useTranslation();
    const classes = useStyles();

    return (
        <ListItem
            button
            key={props.action.key}
            onClick={() => props.action.action()}>
            <ListItemIcon>
            { 
                React.createElement(props.action.icon, 
                    { className: classes.icon } ) 
            }
            </ListItemIcon>
            <ListItemText>{t(props.action.title)}</ListItemText>
        </ListItem> 
    )
}

export default ProfileActionList;