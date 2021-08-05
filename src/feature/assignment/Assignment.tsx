import firebase from "firebase";

import { Asset } from "../asset/Asset";
import { User } from "../user/User";
import { newId } from "../../shared/IdUtils";

const Timestamp = firebase.firestore.Timestamp

export class Assignment {
    assignmentId: string
    asset?: Asset
    user?: User
    dateAssigned?: typeof Timestamp
    dateReturned?: typeof Timestamp
    location?: string
    remarks?: string

    constructor(id: string = newId()) {
        this.assignmentId = id
    }
}