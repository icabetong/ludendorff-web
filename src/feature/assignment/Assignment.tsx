import { Timestamp } from "@firebase/firestore-types";

import { Asset } from "../asset/Asset";
import { User } from "../user/User";
import { newId } from "../../shared/IdUtils";

export class Assignment {
    assignmentId: string
    asset?: Asset
    user?: User
    dateAssigned?: Timestamp
    dateReturned?: Timestamp
    location?: string
    remarks?: string

    constructor(id: string = newId()) {
        this.assignmentId = id
    }
}