import Box from "@material-ui/core/Box";

import { ComponentHeader } from "../../components/ComponentHeader";

type AssignmentComponentPropsType = {
    onDrawerToggle: () => void
}

const AssignmentComponent = (props: AssignmentComponentPropsType) => {
    return (
        <Box>
            <ComponentHeader title="Assignments" onDrawerToggle={props.onDrawerToggle}/>
        </Box>
    )
}

export default AssignmentComponent;