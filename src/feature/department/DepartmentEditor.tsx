import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  ListItem,
  TextField,
  Typography
} from "@mui/material";
import { useSnackbar } from "notistack";
import { collection, query, orderBy } from "firebase/firestore";
import { Department, DepartmentRepository } from "./Department";
import { User, UserCore, minimize } from "../user/User";
import UserPicker from "../user/UserPicker";
import {
  userCollection,
  lastName
} from "../../shared/const";
import { isDev, newId } from "../../shared/utils";
import { firestore } from "../..";
import { usePagination } from "use-pagination-firestore";

type DepartmentEditorProps = {
  isOpen: boolean,
  isCreate: boolean,
  department?: Department
  onDismiss: () => void,
}

type FormValues = {
  name: string
}

const DepartmentEditor = (props: DepartmentEditorProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [isWritePending, setWritePending] = useState<boolean>(false);
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [manager, setManager] = useState<UserCore | undefined>(props.department?.manager);

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<User>(
    query(collection(firestore, userCollection), orderBy(lastName, "asc")), {
      limit: 15
    }
  )

  const onPickerView = () => setPickerOpen(true);
  const onPickerDismiss = () => setPickerOpen(false);

  const onSubmit = (data: FormValues) => {
    setWritePending(true);
    const department: Department = {
      departmentId: props.department?.departmentId !== undefined ? props.department?.departmentId : newId(),
      manager: manager,
      count: props.department?.count !== undefined ? props.department?.count : 0,
      ...data
    }

    if (props.isCreate) {
      DepartmentRepository.create(department)
        .then(() => enqueueSnackbar(t("feedback.department_created")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.department_create_error"));
          if (isDev) console.log(error)
        })
        .finally(() => {
          setWritePending(false);
          props.onDismiss();
        })
    } else {
      DepartmentRepository.update(department)
        .then(() => enqueueSnackbar(t("feedback.department_updated")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.department_update_error"));
          if (isDev) console.log(error);
        })
        .finally(() => {
          setWritePending(false);
          props.onDismiss();
        })
    }
  }

  const onUserSelected = (user: User) => {
    setManager(minimize(user))
  }

  return (
    <>
      <Dialog
        fullWidth={ true }
        maxWidth="xs"
        open={ props.isOpen }
        onClose={ props.onDismiss }>
        <form onSubmit={ handleSubmit(onSubmit) }>
          <DialogTitle>{ t("dialog.details_department") }</DialogTitle>
          <DialogContent>
            <Container disableGutters>
              <TextField
                disabled={ isWritePending }
                autoFocus
                id="name"
                type="text"
                label={ t("field.department_name") }
                defaultValue={ props.department !== undefined ? props.department?.name : "" }
                error={ errors.name !== undefined }
                helperText={ errors.name?.message !== undefined ? t("feedback.empty_department_name") : undefined }
                { ...register("name", { required: "feedback.empty_department_name" }) } />
              <FormControl
                component="fieldset"
                fullWidth>
                <FormLabel component="legend">
                  <Typography variant="body2">{ t("field.manager") }</Typography>
                </FormLabel>
                <ListItem
                  button
                  onClick={ onPickerView }
                  disabled={ isWritePending }>
                  <Typography variant="body2">
                    { manager !== undefined ? manager?.name : t("not_set") }
                  </Typography>
                </ListItem>
              </FormControl>
            </Container>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={ props.onDismiss }
              disabled={ isWritePending }>
              { t("button.cancel") }
            </Button>
            <Button
              color="primary"
              type="submit"
              disabled={ isWritePending }>
              { t("button.save") }
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <UserPicker
        isOpen={ isPickerOpen }
        users={ items }
        isLoading={ isLoading }
        onDismiss={ onPickerDismiss }
        onSelectItem={ onUserSelected }
        canBack={isStart}
        canForward={isEnd}
        onBackward={getPrev}
        onForward={getNext}/>
    </>
  )
}

export default DepartmentEditor;