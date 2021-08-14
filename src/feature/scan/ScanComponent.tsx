import { useTranslation } from "react-i18next";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";

import FolderOpenIcon from "@heroicons/react/outline/FolderOpenIcon";

import { ComponentHeader } from "../../components/ComponentHeader";

type ScanComponentPropsType = {
    onDrawerToggle: () => void
}

const ScanComponent = (props: ScanComponentPropsType) => {
    const useStyles = makeStyles((theme) => ({
        icon: {
            width: '1em',
            height: '1em'
        }
    }));
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <Box>
            <ComponentHeader 
                title={ t("scan") } 
                onDrawerToggle={props.onDrawerToggle}
                buttonText={ t("select") }
                buttonIcon={<FolderOpenIcon className={classes.icon}/>}/>
        </Box>
    )
}

export default ScanComponent;