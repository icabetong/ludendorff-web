import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import LinearProgress from "@material-ui/core/LinearProgress";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme, makeStyles } from "@material-ui/core/styles";

import { usePermissions } from "../auth/AuthProvider";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { Type } from "./Type";
import TypeList from "./TypeList";

const useStyles = makeStyles(() => ({
  root: {
    minHeight: '60vh',
    paddingTop: 0,
    paddingBottom: 0,
    '& .MuiList-padding': {
      padding: 0
    }
  }
}));

type TypePickerProps = {
  isOpen: boolean,
  types: Type[],
  isLoading: boolean,
  onDismiss: () => void,
  onSelectItem: (type: Type) => void
}

const TypePicker = (props: TypePickerProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
  const classes = useStyles();
  const { canRead } = usePermissions();

  return (
    <Dialog
      fullScreen={isMobile}
      fullWidth={true}
      maxWidth="xs"
      open={props.isOpen}
      onClose={props.onDismiss}>
      <DialogTitle>{t("dialog.details_type")}</DialogTitle>
      <DialogContent dividers={true} className={classes.root}>
        {canRead
          ? !props.isLoading
            ? <TypeList
                types={props.types}
                onItemSelect={props.onSelectItem} />
            : <LinearProgress />
          : <ErrorNoPermissionState />
        }
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={props.onDismiss}>{t("button.close")}</Button>
      </DialogActions>
    </Dialog>
  )
}

export default TypePicker;