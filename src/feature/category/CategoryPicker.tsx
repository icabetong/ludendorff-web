import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import LinearProgress from "@mui/material/LinearProgress";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import { usePermissions } from "../auth/AuthProvider";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { Category } from "./Category";
import CategoryList from "./CategoryList";
import { PaginationController, PaginationControllerProps } from "../../components/PaginationController";
import useQueryLimit from "../shared/hooks/useQueryLimit";


type CategoryPickerProps = PaginationControllerProps & {
  isOpen: boolean,
  types: Category[],
  isLoading: boolean,
  onDismiss: () => void,
  onSelectItem: (type: Category) => void
}
const CategoryPicker = (props: CategoryPickerProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { canRead } = usePermissions();
  const { limit } = useQueryLimit('typeQueryLimit');

  return (
    <Dialog
      fullScreen={isMobile}
      fullWidth={true}
      maxWidth="xs"
      open={props.isOpen}
      onClose={props.onDismiss}>
      <DialogTitle>{t("dialog.select_category")}</DialogTitle>
      <DialogContent
        dividers={true}
        sx={{
          minHeight: '60vh',
          paddingX: 0,
          '& .MuiList-padding': { padding: 0 }
        }}>
        {canRead
          ? !props.isLoading
            ? <>
              <CategoryList
                types={props.types}
                onItemSelect={props.onSelectItem}/>
              {props.canForward && props.types.length > 0 && props.types.length === limit
                && <PaginationController
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
          onClick={props.onDismiss}>{t("button.close")}</Button>
      </DialogActions>
    </Dialog>
  )
}

export default CategoryPicker;