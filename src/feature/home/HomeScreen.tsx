import { useTranslation } from "react-i18next";
import { Box } from "@material-ui/core";
import ComponentHeader from "../../components/ComponentHeader";

type HomeScreenProps = {
    onDrawerToggle: () => void
}

const HomeScreen = (props: HomeScreenProps) => {
    const { t } = useTranslation();

    return (
        <Box>
            <ComponentHeader title={t("navigation.home")} onDrawerToggle={props.onDrawerToggle}/>
        </Box>
    )
}

export default HomeScreen;