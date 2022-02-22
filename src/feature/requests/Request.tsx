import { setDoc, updateDoc, deleteDoc, doc, Timestamp  } from "firebase/firestore";
import { firestore } from "../../index";
import { AssetCore } from "../asset/Asset";
import { Assignment, AssignmentRepository } from "../assignment/Assignment";
import { UserCore } from "../user/User";
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
    return await setDoc(doc(firestore, requestCollection, request.requestId), 
      request);
  }

  static async update(request: Request): Promise<any> {
    return await updateDoc(doc(firestore, requestCollection, request.requestId), 
      request);
  }

  static async approve(request: Request, endorser: UserCore): Promise<any> {
    const r: Request = {
      ...request,
      endorser: endorser,
      endorsedTimestamp: Timestamp.now(),
    }
    const assignment: Assignment = {
      assignmentId: newId(),
      asset: r.asset,
      user: r.petitioner,
      dateAssigned: Timestamp.now()
    }
    await updateDoc(doc(firestore, requestCollection, request.requestId), r);

    return await AssignmentRepository.create(assignment, endorser.name ? endorser.name : "");
  }

  static async remove(request: Request): Promise<any> {
    return await deleteDoc(doc(firestore, requestCollection, request.requestId));
  }

}