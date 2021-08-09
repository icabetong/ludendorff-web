import { Box } from "@material-ui/core";
import { ComponentHeader } from "../../components/ComponentHeader";

type HomeComponentPropsType = {
    onDrawerToggle: () => void
}

export const HomeComponent = (props: HomeComponentPropsType) => {
    return (
        <Box>
            <ComponentHeader title="Home" onDrawerToggle={props.onDrawerToggle}/>
        </Box>
    )
}