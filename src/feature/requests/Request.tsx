import { Timestamp } from "@firebase/firestore-types";
import firebase from "firebase";
import { AssetCore } from "../asset/Asset";
import { Assignment, AssignmentRepository } from "../assignment/Assignment";
import { UserCore } from "../user/User";
import { firestore } from "../../index";
import { requestCollection } from "../../shared/const";
import { newId } from "../../shared/utils";

export type Request = {
  requestId: string,
  asset?: AssetCore,
  petitioner?: UserCore,
  endorser?: UserCore,
  endorsedTimestamp?: Timestamp
  submittedTimestamp?: Timestamp
}

export class RequestRepository {

  static async create(request: Request): Promise<any> {
    return await firestore.collection(requestCollection)
      .doc(request.requestId).set(request);
  }

  static async update(request: Request): Promise<any> {
    return await firestore.collection(requestCollection)
      .doc(request.requestId).update(request)
  }

  static async approve(request: Request, endorser: UserCore): Promise<any> {
    const r: Request = {
      ...request,
      endorser: endorser,
      endorsedTimestamp: firebase.firestore.Timestamp.now(),
    }
    const assignment: Assignment = {
      assignmentId: newId(),
      asset: r.asset,
      user: r.petitioner,
      dateAssigned: firebase.firestore.Timestamp.now()
    }
    await firestore.collection(requestCollection)
      .doc(request.requestId).update(r);

    return await AssignmentRepository.create(assignment, endorser.name ? endorser.name : "");
  }

  static async remove(request: Request): Promise<any> {
    return await firestore.collection(requestCollection)
      .doc(request.requestId)
      .delete();
  }

}