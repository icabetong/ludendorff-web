import { useContext } from "react";
import { useTranslation } from "react-i18next";
import Box from "@material-ui/core/Box";
import Switch from "@material-ui/core/Switch";

import ColorSwatchIcon from "@heroicons/react/outline/ColorSwatchIcon";

import { ThemeContext } from "../core/Core";
import ComponentHeader from "../../components/ComponentHeader";

import { Preference } from "../settings/Settings";
import PreferenceList from "../settings/SettingsList";

type SettingsScreenProps = {
    onDrawerToggle: () => void,
}

const SettingsScreen = (props: SettingsScreenProps) => {
    const { t } = useTranslation();
    const theme = useContext(ThemeContext);

    const onTriggerThemeChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        theme.setTheme(event.target.checked ? 'dark' : 'light');
    }

    const preferences: Preference[] = [
        { 
            key: 'preference:theme', 
            title: t("settings_dark_theme"), 
            summary: t("settings_dark_theme_summary"),
            icon: ColorSwatchIcon,
            action: <Switch edge="end" checked={theme.theme === 'dark'} onChange={onTriggerThemeChanged}/>
        }
    ]

    return (
        <Box>
            <ComponentHeader title={t("navigation.settings")} onDrawerToggle={props.onDrawerToggle}/>
            <PreferenceList preferences={preferences}/>
        </Box>
    )
}

export default SettingsScreen;