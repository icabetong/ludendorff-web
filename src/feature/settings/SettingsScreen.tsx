import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@material-ui/core/Box";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Switch from "@material-ui/core/Switch";

import {
    ChevronRightIcon,
    ColorSwatchIcon,
    ArrowsExpandIcon
} from "@heroicons/react/outline";

import { ThemeContext } from "../core/Core";
import ComponentHeader from "../../components/ComponentHeader";
import HeroIconButton from "../../components/HeroIconButton";
import useLocalStorage from "../../shared/persistence";

import { Preference } from "../settings/Settings";
import PreferenceList from "../settings/SettingsList";

enum Density { 
    COMPACT = "compact", 
    STANDARD = "standard", 
    COMFORTABLE = "comfortable"
}

type SettingsScreenProps = {
    onDrawerToggle: () => void,
}

const SettingsScreen = (props: SettingsScreenProps) => {
    const { t } = useTranslation();
    const theme = useContext(ThemeContext);

    const [density, setDensity] = useLocalStorage("preference:density", Density.STANDARD);
    const [densityMenuAnchor, setDensityMenuAnchor] = useState<null | HTMLElement>(null);
    const onDensityMenuView = (e: React.MouseEvent<HTMLElement>) => { setDensityMenuAnchor(e.currentTarget); }
    const onDensityMenuDismiss = () => { setDensityMenuAnchor(null) } 

    const onDensityMenuItemClick = (density: Density) => {
        setDensity(density);
        setDensityMenuAnchor(null);
    }

    const onTriggerThemeChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        theme.setTheme(event.target.checked ? 'dark' : 'light');
    }

    const preferences: Preference[] = [
        { 
            key: 'preference:theme', 
            title: t("settings.dark_theme"), 
            summary: t("settings.dark_theme_summary"),
            icon: ColorSwatchIcon,
            action: <Switch edge="end" checked={theme.theme === 'dark'} onChange={onTriggerThemeChanged}/>
        },{
            key: 'preference:density',
            title: t("settings.component_density"),
            summary: t(`settings.component_density_${density}`),
            icon: ArrowsExpandIcon,
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
                        <MenuItem key={Density.COMPACT} onClick={() => onDensityMenuItemClick(Density.COMPACT)}>{t(`settings.component_density_${Density.COMPACT}`)}</MenuItem>
                        <MenuItem key={Density.STANDARD} onClick={() => onDensityMenuItemClick(Density.STANDARD)}>{t(`settings.component_density_${Density.STANDARD}`)}</MenuItem>
                        <MenuItem key={Density.COMFORTABLE} onClick={() => onDensityMenuItemClick(Density.COMFORTABLE)}>{t(`settings.component_density_${Density.COMFORTABLE}`)}</MenuItem>
                      </Menu>
                    </>
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