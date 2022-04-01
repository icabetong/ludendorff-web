import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import LinearProgress from "@mui/material/LinearProgress";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import makeStyles from '@mui/styles/makeStyles';

import { usePermissions } from "../auth/AuthProvider";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { Type } from "./Type";
import TypeList from "./TypeList";
import { PaginationController, PaginationControllerProps } from "../../components/PaginationController";

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

type TypePickerProps = PaginationControllerProps & {
  isOpen: boolean,
  types: Type[],
  isLoading: boolean,
  onDismiss: () => void,
  onSelectItem: (type: Type) => void
}

const TypePicker = (props: TypePickerProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const classes = useStyles();
  const { canRead } = usePermissions();

  return (
    <Dialog
      fullScreen={ isMobile }
      fullWidth={ true }
      maxWidth="xs"
      open={ props.isOpen }
      onClose={ props.onDismiss }>
      <DialogTitle>{ t("dialog.select_type") }</DialogTitle>
      <DialogContent
        dividers={ true }
        className={ classes.root }>
        { canRead
          ? !props.isLoading
            ? <>
                <TypeList
                  types={ props.types }
                  onItemSelect={ props.onSelectItem }/>
                <PaginationController
                  canBack={props.canBack}
                  canForward={props.canForward}
                  onBackward={props.onBackward}
                  onForward={props.onForward}/>
              </>
            : <LinearProgress/>
          : <ErrorNoPermissionState/>
        }
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          onClick={ props.onDismiss }>{ t("button.close") }</Button>
      </DialogActions>
    </Dialog>
  )
}

export default TypePicker;