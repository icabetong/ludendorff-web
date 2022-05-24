import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import LinearProgress from "@mui/material/LinearProgress";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { PeopleOutlineRounded } from "@mui/icons-material";

import { User } from "./User";
import UserList from "./UserList";

import { ErrorNoPermissionState } from "../state/ErrorStates";
import EmptyStateComponent from "../state/EmptyStates";
import { usePermissions } from "../auth/AuthProvider";
import { PaginationController, PaginationControllerProps } from "../../components/data/PaginationController";

type UserPickerProps = PaginationControllerProps & {
  isOpen: boolean,
  users: User[],
  isLoading: boolean,
  onDismiss: () => void,
  onSelectItem: (user: User) => void,
}

const UserPicker = (props: UserPickerProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));
  const { canRead } = usePermissions();

  const onSelect = (user: User) => {
    props.onSelectItem(user);
    props.onDismiss();
  }

  return (
    <Dialog
      fullScreen={smBreakpoint}
      fullWidth={true}
      maxWidth="xs"
      open={props.isOpen}
      onClose={props.onDismiss}>
      <DialogTitle>{t("dialog.select_user")}</DialogTitle>
      <DialogContent
        dividers={true}
        sx={{
          minHeight: '60vh',
          paddingX: 0,
          '& .MuiList-padding': { padding: 0 }
        }}>
        {canRead ?
          !props.isLoading
            ? props.users.length > 0
              ? <>
                <UserList
                  users={props.users}
                  onItemSelect={onSelect}/>
                { props.canForward && props.users?.length > 0 && props.users.length === 25 &&
                  <PaginationController
                    canBack={props.canBack}
                    canForward={props.canForward}
                    onBackward={props.onBackward}
                    onForward={props.onForward}/>
                }
              </>
              : <EmptyStateComponent
                icon={PeopleOutlineRounded}
                title={t("empty.user")}
                subtitle={t("empty.user_summary")}/>
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
  );
}

export default UserPicker;