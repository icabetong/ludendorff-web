import { Box } from "@material-ui/core";
import ComponentHeader from "../../components/ComponentHeader";

type HomeScreenProps = {
    onDrawerToggle: () => void
}

const HomeScreen = (props: HomeScreenProps) => {
    return (
        <Box>
            <ComponentHeader title="Home" onDrawerToggle={props.onDrawerToggle}/>
        </Box>
    )
}

export default HomeScreen;