import { useTranslation } from "react-i18next";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

type PaginationControllerPropsType = {
    hasPrevious: boolean,
    hasNext: boolean,
    getPrevious: () => void,
    getNext: () => void
}

const PaginationController = (props: PaginationControllerPropsType) => {
    const { t } = useTranslation();

    return (
        <Container>
            <Grid container spacing={2} alignItems="center" justifyContent="center" direction="row">
                <Grid item>
                    <Button 
                        variant="outlined" 
                        color="primary" 
                        disabled={props.hasPrevious}
                        onClick={() => props.getPrevious}>
                            { t("previous") }
                    </Button>
                </Grid>
                <Grid item>
                    <Button 
                        variant="outlined" 
                        color="primary" 
                        disabled={props.hasNext}
                        onClick={() => props.getNext}>
                            { t("next") }
                    </Button>
                </Grid>
            </Grid>
        </Container>
    )
}

export default PaginationController;