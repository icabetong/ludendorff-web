import { useTranslation } from "react-i18next";
import Box from "@material-ui/core/Box";

import ComponentHeader from "../../components/ComponentHeader";

type AssignmentScreenProps = {
    onDrawerToggle: () => void
}

const AssignmentScreen = (props: AssignmentScreenProps) => {
    const { t } = useTranslation();

    return (
        <Box>
            <ComponentHeader title={t("navigation.assignments")} onDrawerToggle={props.onDrawerToggle}/>
        </Box>
    )
}

export default AssignmentScreen;