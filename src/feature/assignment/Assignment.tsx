import { firestore } from "../../index";
import { DocumentSnapshot, DocumentData, Timestamp } from "@firebase/firestore-types";

import { AssetCore } from "../asset/Asset";
import { UserCore } from "../user/User";

export type Assignment = {
    assignmentId: string
    asset?: AssetCore
    user?: UserCore
    dateAssigned?: Timestamp
    dateReturned?: Timestamp
    location?: string
    remarks?: string
}

export class AssignmentRepository {

}