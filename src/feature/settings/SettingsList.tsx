import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { 
    List, 
    ListItem, 
    ListItemIcon, 
    ListItemText, 
    ListItemSecondaryAction 
} from "@material-ui/core";

import { Preference } from "./Settings";

const useStyles = makeStyles((theme) => ({
    icon: { 
        width: '2em', 
        height: '2em',
        color: theme.palette.text.primary
    }
}));

type PreferenceListProps = {
    preferences: Preference[]
}

const PreferenceList = (props: PreferenceListProps) => {
    return (
        <List>
            {   props.preferences.map((preference: Preference) => {
                    return <PreferenceItem preference={preference}/>
                })
            }
        </List>
    );
}

type PreferenceItemType = {
    preference: Preference
}

const PreferenceItem = (props: PreferenceItemType) => {
    const classes = useStyles();

    return (
        <ListItem key={props.preference.key}>
            { props.preference.icon && 
                <ListItemIcon>
                    {  React.createElement(props.preference.icon, 
                        { className: classes.icon }) 
                    }
                </ListItemIcon> 
            }
            <ListItemText
                    primary={props.preference.title}
                    secondary={props.preference.summary}/>
            { props.preference.action && 
                <ListItemSecondaryAction>{props.preference.action}</ListItemSecondaryAction>
            }
        </ListItem>
    )
}

export default PreferenceList;