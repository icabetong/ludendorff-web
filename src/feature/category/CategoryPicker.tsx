import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import { usePermissions } from "../auth/AuthProvider";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { Category } from "./Category";
import CategoryList from "./CategoryList";

type CategoryPickerProps = {
  isOpen: boolean,
  categories: Category[],
  onDismiss: () => void,
  onSelectItem: (type: Category) => void
}
const CategoryPicker = (props: CategoryPickerProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { canRead } = usePermissions();

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
          ? <CategoryList categories={props.categories} onItemSelect={props.onSelectItem}/>
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