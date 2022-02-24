import { useTranslation } from "react-i18next";
import {
  Container,
  Button,
  Grid
} from "@material-ui/core";
import { ChevronLeftRounded, ChevronRightRounded } from "@material-ui/icons";

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
            startIcon={<ChevronLeftRounded/>}
            onClick={props.getPrevious}>
            {t("button.previous")}
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            color="primary"
            disabled={props.hasNext}
            endIcon={<ChevronRightRounded/>}
            onClick={props.getNext}>
            {t("button.next")}
          </Button>
        </Grid>
      </Grid>
    </Container>
  )
}

export default PaginationController;