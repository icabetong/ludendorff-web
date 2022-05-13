import { Asset } from "./Asset";

export type AssetImport = Asset & {
  id: string,
  status: "exists" | "duplicate" | "absent"
}