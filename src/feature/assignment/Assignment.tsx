import { firestore } from "../../index";
import { DocumentSnapshot, DocumentData, Timestamp } from "@firebase/firestore-types";

import { Asset } from "../asset/Asset";
import { User } from "../user/User";
import { newId } from "../../shared/utils";

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

    static from(data: any): Assignment {
        let assignment = new Assignment(data.assignmentId);
        assignment.asset = data.asset;
        assignment.user = data.user;
        assignment.dateAssigned = data.dateAssigned;
        assignment.dateReturned = data.dateReturned;
        assignment.location = data.location;
        assignment.remarks = data.remarks;
        
        return assignment;
    }

    static COLLECTION = "assignments"
    static FIELD_ID = "assignmentId"
    static FIELD_ASSET = "asset"
    static FIELD_ASSET_ID = `${Assignment.FIELD_ASSET}.assetId`;
    static FIELD_ASSET_NAME = `${Assignment.FIELD_ASSET}.assetName`;
    static FIELD_CATEGORY = `${Assignment.FIELD_ASSET}.category`
    static FIELD_CATEGORY_ID = `${Assignment.FIELD_ASSET}.category.categoryId`;
    static FIELD_USER = "user"
    static FIELD_USER_ID = `${Assignment.FIELD_USER}.${User.FIELD_USER_ID}`;
    static FIELD_DATE_ASSIGNED = "dateAssigned";
    static FIELD_DATE_RETURNED = "dateReturned";
    static FIELD_LOCATION = "location";
    static FIELD_REMARKS = "remarks";
}

export class AssignmentRepository {

    async fetch(startWith: DocumentSnapshot<DocumentData> | null): Promise<[Assignment[], DocumentSnapshot<DocumentData>]> {
        let assignments: Assignment[] = [];

        let query = firestore.collection(Assignment.COLLECTION)
            .orderBy(Assignment.FIELD_ID, "asc")
            .limit(15)

        if (startWith)
            query = query.startAt(startWith)

        let task = await query.get()
        task.docs.forEach((document: DocumentSnapshot) => {
            
            assignments.push(Assignment.from(document.data()))
        })
        
        return [assignments, task.docs[task.docs.length - 1]]
    }
}