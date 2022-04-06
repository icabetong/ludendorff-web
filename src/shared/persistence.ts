import { useEffect, useState } from "react";

const getStorageValue = (key: string, defaultValue: string): string => {
  const saved = localStorage.getItem(key);
  return saved !== null ? saved : defaultValue;
}

const useLocalStorage = (key: string, defaultValue: string): [string, Function] => {
  const [value, setValue] = useState<string>(() => {
    return getStorageValue(key, defaultValue);
  })

  useEffect(() => {
    localStorage.setItem(key, value)
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;