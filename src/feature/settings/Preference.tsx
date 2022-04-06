import React, { useContext, useEffect, useState, } from "react";
import { GridDensity } from "@mui/x-data-grid";

type Preferences = {
  theme: string,
  density: GridDensity
}

const defaultPreferences: Preferences = {
  theme: 'light',
  density: 'standard'
}

type PreferencesContext = {
  preferences: Preferences,
  setPreferences: Function
}

export const PreferenceContext = React.createContext<PreferencesContext>({
  preferences: defaultPreferences,
  setPreferences: () => {
  }
});

export const PreferenceProvider: React.FC = ({ children }) => {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);

  useEffect(() => {
    onPreferenceFetch()
      .then(() => {
      })
      .catch((e) => {
      });
  }, [])

  const onPreferenceFetch = async () => {
    const userPreferences = localStorage.getItem("preferences")
    setPreferences(JSON.parse(userPreferences !== null ? userPreferences : JSON.stringify(defaultPreferences)));
  }

  const onPreferenceChanged = async (pref: Preferences) => {
    localStorage.setItem("preferences", JSON.stringify(pref));
    await onPreferenceFetch();
  }

  return (
    <PreferenceContext.Provider value={{ preferences: preferences, setPreferences: onPreferenceChanged }}>
      {children}
    </PreferenceContext.Provider>
  );
}

export const usePreferences = (): Preferences => {
  const { preferences } = useContext(PreferenceContext);
  return preferences;
}