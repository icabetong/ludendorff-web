import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@material-ui/core/Box";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Switch from "@material-ui/core/Switch";

import {
    ChevronRightIcon,
    ColorSwatchIcon,
    TableIcon,
    ViewListIcon,
    MenuIcon,
    MenuAlt4Icon
} from "@heroicons/react/outline";

import ComponentHeader from "../../components/ComponentHeader";
import HeroIconButton from "../../components/HeroIconButton";
import HeroListItemIcon from "../../components/HeroListItemIcon";

import { PreferenceContext } from "./Preference";
import { Setting } from "../settings/Settings";
import SettingsList from "../settings/SettingsList";

type SettingsScreenProps = {
    onDrawerToggle: () => void,
}

const SettingsScreen = (props: SettingsScreenProps) => {
    const { t } = useTranslation();
    const userPreferences = useContext(PreferenceContext);

    const [densityMenuAnchor, setDensityMenuAnchor] = useState<null | HTMLElement>(null);
    const onDensityMenuView = (e: React.MouseEvent<HTMLElement>) => { setDensityMenuAnchor(e.currentTarget); }
    const onDensityMenuDismiss = () => { setDensityMenuAnchor(null) } 

    const onDensityMenuItemClick = (density: string) => {
        userPreferences.setPreferences({
            ...userPreferences.preferences,
            density: density
        })
        setDensityMenuAnchor(null);
    }

    const onTriggerThemeChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        userPreferences.setPreferences({
            ...userPreferences.preferences,
            theme: event.target.checked ? 'dark' : 'light'
        });
    }

    const preferences: Setting[] = [
        { 
            key: 'preference:theme', 
            title: t("settings.dark_theme"), 
            summary: t("settings.dark_theme_summary"),
            icon: ColorSwatchIcon,
            action: <Switch edge="end" checked={userPreferences.preferences.theme === 'dark'} onChange={onTriggerThemeChanged}/>
        },{
            key: 'preference:density',
            title: t("settings.table_row_density"),
            summary: t(`settings.table_row_density_${userPreferences.preferences.density}`),
            icon: TableIcon,
            action: <>
                      <HeroIconButton 
                        icon={ChevronRightIcon} 
                        aria-controls="density-menu" 
                        aria-haspopup="true" 
                        onClick={onDensityMenuView}/>
                      <Menu
                        keepMounted
                        id="density-menu"
                        anchorEl={densityMenuAnchor}
                        open={Boolean(densityMenuAnchor)}
                        onClose={onDensityMenuDismiss}>
                        <MenuItem 
                            key="compact"
                            onClick={() => onDensityMenuItemClick("compact")}>
                                <HeroListItemIcon icon={ViewListIcon}/>
                                {t(`settings.table_row_density_compact`)}
                        </MenuItem>
                        <MenuItem 
                            key="standard" 
                            onClick={() => onDensityMenuItemClick("standard")}>
                                <HeroListItemIcon icon={MenuIcon}/>
                                {t(`settings.table_row_density_standard`)}
                        </MenuItem>
                        <MenuItem 
                            key="comfortable" 
                            onClick={() => onDensityMenuItemClick("comfortable")}>
                                <HeroListItemIcon icon={MenuAlt4Icon}/>
                                {t(`settings.table_row_density_comfortable`)}
                        </MenuItem>
                      </Menu>
                    </>
        }
    ]

    return (
        <Box>
            <ComponentHeader title={t("navigation.settings")} onDrawerToggle={props.onDrawerToggle}/>
            <SettingsList preferences={preferences}/>
        </Box>
    )
}

export default SettingsScreen;