import Box from "@material-ui/core/Box";
import { ComponentHeader } from "../../components/ComponentHeader";

type ScanComponentPropsType = {
    onDrawerToggle: () => void
}

export const ScanComponent = (props: ScanComponentPropsType) => {
    return (
        <Box>
            <ComponentHeader title="Scan" onDrawerToggle={props.onDrawerToggle}/>
        </Box>
    )
}