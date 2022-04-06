import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import makeStyles from '@mui/styles/makeStyles';

import { usePermissions } from "../auth/AuthProvider";
import { Department } from "./Department";
import DepartmentList from "./DepartmentList";

import { ErrorNoPermissionState } from "../state/ErrorStates";
import { PaginationController, PaginationControllerProps } from "../../components/PaginationController";
import useQueryLimit from "../shared/useQueryLimit";

const useStyles = makeStyles(() => ({
  container: {
    minHeight: '60vh',
    paddingTop: 0,
    paddingBottom: 0,
    '& .MuiList-padding': {
      padding: 0
    }
  }
}));

type DepartmentPickerProps = PaginationControllerProps & {
  isOpen: boolean,
  departments: Department[],
  isLoading: boolean,
  onDismiss: () => void
  onSelectItem: (department: Department) => void
}

const DepartmentPicker = (props: DepartmentPickerProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const classes = useStyles();
  const { canRead } = usePermissions();
  const { limit } = useQueryLimit('departmentQueryLimit');

  return (
    <Dialog
      fullScreen={isMobile}
      fullWidth={true}
      maxWidth="xs"
      open={props.isOpen}
      onClose={() => props.onDismiss()}>
      <DialogTitle>{t("dialog.select_department")}</DialogTitle>
      <DialogContent
        dividers={true}
        className={classes.container}>
        {canRead
          ? !props.isLoading
            ? <>
              <DepartmentList
                departments={props.departments}
                onItemSelect={props.onSelectItem}/>
              { props.canForward && props.departments.length > 0 && props.departments.length === limit &&
                <PaginationController
                  canBack={props.canBack}
                  canForward={props.canForward}
                  onBackward={props.onBackward}
                  onForward={props.onForward}/>
              }
            </>
            : <LinearProgress/>
          : <ErrorNoPermissionState/>
        }
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          onClick={() => props.onDismiss()}>{t("button.close")}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default DepartmentPicker;