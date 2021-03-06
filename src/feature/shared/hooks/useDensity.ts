import { GridDensity } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { usePreferences } from "../../settings/Preference";

type UseDensityValue = {
  density: GridDensity,
  onDensityChanged: (density: GridDensity | string) => void,
}
const useDensity = (key: string) => {
  const preferences = usePreferences();
  const [density, setDensity] = useState<GridDensity | string>(() => {
    let returned = localStorage.getItem(key);
    return returned ? returned : 'standard'
  });

  useEffect(() => {
    let componentDensity = localStorage.getItem(key);

    if (preferences.overrideDensity) {
      setDensity(preferences.density);
    } else if (componentDensity) {
      setDensity(componentDensity);
    } else {
      setDensity('standard');
    }
  }, [key, preferences, preferences.density, preferences.overrideDensity]);

  const onDensityChanged = (gridDensity: GridDensity | string) => {
    if (preferences.overrideDensity)
      return;

    setDensity(gridDensity);
    localStorage.setItem(key, gridDensity);
  }

  return { density, onDensityChanged } as UseDensityValue
}

export default useDensity;