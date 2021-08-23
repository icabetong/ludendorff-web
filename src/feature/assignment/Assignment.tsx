import { firestore } from "../../index";
import { DocumentSnapshot, DocumentData, Timestamp } from "@firebase/firestore-types";

import { Asset } from "../asset/Asset";
import { User } from "../user/User";

export type Assignment = {
    assignmentId: string
    asset?: Asset
    user?: User
    dateAssigned?: Timestamp
    dateReturned?: Timestamp
    location?: string
    remarks?: string
}

export class AssignmentRepository {

}