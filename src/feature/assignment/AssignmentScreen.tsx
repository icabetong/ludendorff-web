import Box from "@material-ui/core/Box";

import ComponentHeader from "../../components/ComponentHeader";

type AssignmentScreenProps = {
    onDrawerToggle: () => void
}

const AssignmentScreen = (props: AssignmentScreenProps) => {
    return (
        <Box>
            <ComponentHeader title="Assignments" onDrawerToggle={props.onDrawerToggle}/>
        </Box>
    )
}

export default AssignmentScreen;