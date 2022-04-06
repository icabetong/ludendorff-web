import { GridDensity } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { usePreferences } from "../settings/Preference";

type UseDensityValue = {
  density: GridDensity,
  onDensityChanged: (density: GridDensity | string) => void,
}
const useDensity = (key: string) => {
  const preferences = usePreferences();
  const [density, setDensity] = useState<GridDensity | string>('standard');

  useEffect(() => {
    let globalDensity = localStorage.getItem('globalDensity');
    let localDensity = localStorage.getItem(key);
    setDensity(localDensity ? localDensity : globalDensity ? globalDensity : 'standard');
  }, [key]);

  const onDensityChanged = (density: GridDensity | string) => {
    setDensity(density);
    if (density === preferences.density) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, density);
    }
  }

  return { density, onDensityChanged } as UseDensityValue
}

export default useDensity;