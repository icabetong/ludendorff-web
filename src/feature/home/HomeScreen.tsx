import { useTranslation } from "react-i18next";
import { Box } from "@material-ui/core";

import ComponentHeader from "../../components/ComponentHeader";
import { ErrorNoPermissionState } from "../state/ErrorStates";

type HomeScreenProps = {
    onDrawerToggle: () => void
}

const HomeScreen = (props: HomeScreenProps) => {
    const { t } = useTranslation();

    return (
        <Box>
            <ComponentHeader title={t("navigation.home")} onDrawerToggle={props.onDrawerToggle}/>
            <ErrorNoPermissionState/>
        </Box>
    )
}

export default HomeScreen;