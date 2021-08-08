import React, { useContext, useState } from "react";
import Box from "@material-ui/core/Box";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Switch from "@material-ui/core/Switch";
import ColorSwatchIcon from "@heroicons/react/outline/ColorSwatchIcon";
import { ListItemContent } from "../../components/ListItemContent";
import { HeaderBarComponent } from "../../components/HeaderBar";
import { ThemeContext } from "../core/Core";

export const SettingsComponent: React.FC = () => {
    const theme = useContext(ThemeContext);
    const [isDarkEnabled, setDarkEnabled] = useState<boolean>(false);

    const onTriggerThemeChanged = () => {
        theme.setTheme(isDarkEnabled);
        setDarkEnabled(!isDarkEnabled);
    }

    return (
        <Box>
            <HeaderBarComponent title="Settings"/>
            <List>
                <ListItem button onClick={() => onTriggerThemeChanged()}>
                    <ListItemIcon><ColorSwatchIcon/></ListItemIcon>
                    <ListItemContent title="Dark Theme" summary="Make the interface darker and easier on the eyes."/>
                    <ListItemSecondaryAction>
                        <Switch
                            edge="end"
                            value={isDarkEnabled}
                            onChange={() => onTriggerThemeChanged()}/>
                    </ListItemSecondaryAction>
                </ListItem>
            </List>
        </Box>
    )
}