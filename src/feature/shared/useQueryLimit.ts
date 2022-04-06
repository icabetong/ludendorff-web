import { useEffect, useState } from "react";

type UseQueryLimitValue = {
  limit: number,
  onLimitChanged: (limit: number) => void,
}

const useQueryLimit = (key: string) => {
  const [limit, setLimit] = useState<number>(15);

  useEffect(() => {
    let raw = localStorage.getItem(key);
    try {
      if (raw) {
        setLimit(parseInt(raw))
      }
    } catch (error) {
    }
  }, [key])

  const onLimitChanged = (limit: number) => {
    localStorage.setItem(key, limit.toString());
    setLimit(limit);
  }

  return { limit, onLimitChanged } as UseQueryLimitValue
}

export default useQueryLimit;