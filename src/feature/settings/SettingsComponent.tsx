import { useContext } from "react";
import Box from "@material-ui/core/Box";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Switch from "@material-ui/core/Switch";
import { makeStyles } from "@material-ui/core/styles";

import ColorSwatchIcon from "@heroicons/react/outline/ColorSwatchIcon";

import { ListItemContent } from "../../components/ListItemContent";
import { ComponentHeader } from "../../components/ComponentHeader";
import { ThemeContext } from "../core/Core";

const useStyles = makeStyles((theme) => ({
    icon: {
        width: '2em',
        height: '2em',
        color: theme.palette.text.primary
    }
}));

type SettingsComponentPropsType = {
    onDrawerToggle: () => void,
}

export const SettingsComponent = (props: SettingsComponentPropsType) => {
    const theme = useContext(ThemeContext);
    const classes = useStyles();

    const onTriggerThemeChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        theme.setTheme(event.target.checked);
    }

    return (
        <Box>
            <ComponentHeader title="Settings" onDrawerToggle={props.onDrawerToggle}/>
            <List>
                <ListItem>
                    <ListItemIcon><ColorSwatchIcon className={classes.icon}/></ListItemIcon>
                    <ListItemContent title="Dark Theme" summary="Make the interface darker and easier on the eyes."/>
                    <ListItemSecondaryAction>
                        <Switch
                            edge="end"
                            checked={theme.darkThemeEnabled}
                            onChange={onTriggerThemeChanged}/>
                    </ListItemSecondaryAction>
                </ListItem>
            </List>
        </Box>
    )
}