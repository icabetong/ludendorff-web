import React, { useContext, useEffect, useState, } from "react";
import { GridDensity } from "@mui/x-data-grid";
import { isDev } from "../../shared/utils";

type Preferences = {
  theme: string,
  overrideDensity: boolean,
  density: GridDensity
}

const defaultPreferences: Preferences = {
  theme: 'light',
  overrideDensity: false,
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

type PreferenceProviderProps = {
  children: React.ReactNode
}
export const PreferenceProvider = ({ children }: PreferenceProviderProps) => {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);

  useEffect(() => {
    onPreferenceFetch()
      .then((preferences) =>
        setPreferences(JSON.parse(preferences !== null ? preferences : JSON.stringify(defaultPreferences)))
      ).catch((error) => {
        if (isDev) console.log(error)
      });
  }, [])

  const onPreferenceFetch = async () => {
    const userPreferences = localStorage.getItem("preferences")
    return userPreferences;
  }

  const onPreferenceChanged = async (pref: Preferences) => {
    localStorage.setItem("preferences", JSON.stringify(pref));
    let preferences = await onPreferenceFetch();
    setPreferences(JSON.parse(preferences !== null ? preferences : JSON.stringify(defaultPreferences)))
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