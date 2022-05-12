import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, IconButton, Menu, MenuItem, Switch } from "@mui/material";
import { ChevronRightRounded, ManageAccountsOutlined, PaletteOutlined, TableChartOutlined, } from "@mui/icons-material";

import { PreferenceContext } from "./Preference";
import { Setting } from "./Settings";
import SettingsList from "../settings/SettingsList";
import { AdaptiveHeader } from "../../components";
import EntityEditor from "../entity/EntityEditor";

type SettingsScreenProps = {
  onDrawerToggle: () => void,
}

const SettingsScreen = (props: SettingsScreenProps) => {
  const { t } = useTranslation();
  const [isEntityEditorOpen, setEntityEditorOpen] = useState(false);
  const userPreferences = useContext(PreferenceContext);

  const onEntityEditorInvoke = () => setEntityEditorOpen(true);
  const onEntityEditorDismiss = () => setEntityEditorOpen(false);

  const [densityMenuAnchor, setDensityMenuAnchor] = useState<null | HTMLElement>(null);
  const onDensityMenuView = (e: React.MouseEvent<HTMLElement>) => {
    setDensityMenuAnchor(e.currentTarget);
  }
  const onDensityMenuDismiss = () => setDensityMenuAnchor(null)

  const onOverrideDensityChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    userPreferences.setPreferences({
      ...userPreferences.preferences,
      overrideDensity: event.target.checked
    })
  }

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
      icon: PaletteOutlined,
      action: (
        <Switch
          edge="end"
          checked={userPreferences.preferences.theme === 'dark'}
          onChange={onTriggerThemeChanged}/>
      )
    },
    {
      key: 'preference:densityOverride',
      title: t("settings.override_individual_density"),
      summary: t("settings.override_individual_density_summary"),
      action: (
        <Switch
          edge="end"
          checked={userPreferences.preferences.overrideDensity}
          onChange={onOverrideDensityChanged}
        />
      )
    },
    {
      key: 'preference:density',
      title: t("settings.table_row_density"),
      summary: t(`settings.table_row_density_${userPreferences.preferences.density}`),
      icon: TableChartOutlined,
      action: (
        <>
          <IconButton
            size="large"
            disabled={!userPreferences.preferences.overrideDensity}
            aria-controls="density-menu"
            aria-haspopup="true"
            onClick={onDensityMenuView}>
            <ChevronRightRounded/>
          </IconButton>
          <Menu
            keepMounted
            id="density-menu"
            anchorEl={densityMenuAnchor}
            open={Boolean(densityMenuAnchor)}
            onClose={onDensityMenuDismiss}>
            <MenuItem
              key="compact"
              onClick={() => onDensityMenuItemClick("compact")}>
              {t(`settings.table_row_density_compact`)}
            </MenuItem>
            <MenuItem
              key="standard"
              onClick={() => onDensityMenuItemClick("standard")}>
              {t(`settings.table_row_density_standard`)}
            </MenuItem>
            <MenuItem
              key="comfortable"
              onClick={() => onDensityMenuItemClick("comfortable")}>
              {t(`settings.table_row_density_comfortable`)}
            </MenuItem>
          </Menu>
        </>
      )
    },
    {
      key: 'preference:entity',
      title: t("settings.configure_entity"),
      summary: t("settings.configure_entity_summary"),
      icon: ManageAccountsOutlined,
      action: (
        <IconButton
          size="large"
          onClick={onEntityEditorInvoke}>
          <ChevronRightRounded/>
        </IconButton>
      )
    }
  ]

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <AdaptiveHeader
        title={t("navigation.settings")}
        onDrawerTriggered={props.onDrawerToggle}/>
      <SettingsList preferences={preferences}/>
      <EntityEditor isOpen={isEntityEditorOpen} onDismiss={onEntityEditorDismiss}/>
    </Box>
  );
}

export default SettingsScreen;