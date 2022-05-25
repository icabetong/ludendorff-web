import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { InstantSearch } from "react-instantsearch-core";
import { Category } from "./Category";
import CategoryList from "./CategoryList";
import { usePermissions } from "../auth/AuthProvider";
import Client from "../search/Client";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { DialogSearchTitle } from "../../components/dialog/DialogSearchTitle";
import { useState } from "react";
import CategorySearchList from "./CategorySearchList";
import { CategoryEmptyState } from "./CategoryEmptyState";

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
  const [searchMode, setSearchMode] = useState(false);

  return (
    <InstantSearch searchClient={Client} indexName="categories">
      <Dialog
        fullScreen={isMobile}
        fullWidth={true}
        maxWidth="xs"
        open={props.isOpen}
        PaperProps={{ sx: { minHeight: '60vh' }}}
        onClose={props.onDismiss}>
        <DialogSearchTitle
          hasSearchFocus={searchMode}
          onSearchFocusChanged={setSearchMode}>
          {t("dialog.select_category")}
        </DialogSearchTitle>
        <DialogContent
          dividers={true}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%',
            paddingX: 0,
            '& .MuiList-padding': { padding: 0 }
          }}>
          {canRead
            ? searchMode
              ? <CategorySearchList onItemSelect={props.onSelectItem}/>
              : props.categories.length > 0
                ? <CategoryList categories={props.categories} onItemSelect={props.onSelectItem}/>
                : <CategoryEmptyState/>
            : <ErrorNoPermissionState/>
          }
        </DialogContent>
      </Dialog>
    </InstantSearch>
  )
}

export default CategoryPicker;