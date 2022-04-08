import { GridDensity } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { usePreferences } from "../settings/Preference";

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

    if (componentDensity) {
      setDensity(componentDensity)
    } else if (preferences.density) {
      setDensity(preferences.density)
    } else {
      setDensity('standard')
    }
  }, [key, preferences.density]);

  const onDensityChanged = (gridDensity: GridDensity | string) => {
    if (gridDensity === preferences.density) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, gridDensity);
    }
  }

  return { density, onDensityChanged } as UseDensityValue
}

export default useDensity;