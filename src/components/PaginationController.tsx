import { useTranslation } from "react-i18next";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";

import {
    ChevronLeftIcon,
    ChevronRightIcon
} from "@heroicons/react/outline";

const useStyles = makeStyles(() => ({
    icon: {
        width: '1em',
        height: '1em'
    }
}));

type PaginationControllerPropsType = {
    hasPrevious: boolean,
    hasNext: boolean,
    getPrevious: () => void,
    getNext: () => void
}

const PaginationController = (props: PaginationControllerPropsType) => {
    const { t } = useTranslation();
    const classes = useStyles();

    return (
        <Container>
            <Grid container spacing={2} alignItems="center" justifyContent="center" direction="row">
                <Grid item>
                    <Button 
                        variant="outlined" 
                        color="primary" 
                        disabled={props.hasPrevious}
                        startIcon={<ChevronLeftIcon className={classes.icon}/>}
                        onClick={() => props.getPrevious}>
                            { t("previous") }
                    </Button>
                </Grid>
                <Grid item>
                    <Button 
                        variant="outlined" 
                        color="primary" 
                        disabled={props.hasNext}
                        endIcon={<ChevronRightIcon className={classes.icon}/>}
                        onClick={() => props.getNext}>
                            { t("next") }
                    </Button>
                </Grid>
            </Grid>
        </Container>
    )
}

export default PaginationController;