import React, { useState, useEffect } from "react";
import Box from "@material-ui/core/Box";
import { HeaderBarComponent } from "../../components/HeaderBar";
import { DocumentSnapshot, DocumentData } from "@firebase/firestore-types";
import { Assignment, AssignmentRepository } from "./Assignment";

export const AssignmentComponent: React.FC = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [triggerFetch, setTriggerFetch] = useState<Boolean>(false);
    const [lastDocument, setLastDocument] = useState<DocumentSnapshot<DocumentData> | null>(null);

    useEffect(() => {

    }, [triggerFetch])
    
    return (
        <Box>
            <HeaderBarComponent title="Assignments"/>
        </Box>
    )
}

