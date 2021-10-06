import { Timestamp } from "@firebase/firestore-types";

import { AssetCore } from "../asset/Asset";
import { UserCore } from "../user/User";

export type Request = {
    requestId: string,
    asset?: AssetCore,
    petitioner?: UserCore,
    endorser?: UserCore,
    endorsedTimestamp?: Timestamp
    submittedTimestamp?: Timestamp
}