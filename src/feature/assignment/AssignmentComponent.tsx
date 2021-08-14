import { useState, useEffect } from "react";
import Box from "@material-ui/core/Box";

import { DocumentSnapshot, DocumentData } from "@firebase/firestore-types";
import { ComponentHeader } from "../../components/ComponentHeader";
import { Assignment, AssignmentRepository } from "./Assignment";

type AssignmentComponentPropsType = {
    onDrawerToggle: () => void
}

const AssignmentComponent = (props: AssignmentComponentPropsType) => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [triggerFetch, setTriggerFetch] = useState<Boolean>(false);
    const [lastDocument, setLastDocument] = useState<DocumentSnapshot<DocumentData> | null>(null);

    useEffect(() => {

    }, [triggerFetch])
    
    return (
        <Box>
            <ComponentHeader title="Assignments" onDrawerToggle={props.onDrawerToggle}/>
        </Box>
    )
}

export default AssignmentComponent;