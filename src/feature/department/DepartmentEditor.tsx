import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField
} from "@mui/material";
import { useSnackbar } from "notistack";
import { collection, orderBy, query } from "firebase/firestore";
import { Department, DepartmentRepository } from "./Department";
import { minimize, User, UserCore } from "../user/User";
import UserPicker from "../user/UserPicker";
import { lastName, userCollection } from "../../shared/const";
import { isDev, newId } from "../../shared/utils";
import { firestore } from "../..";
import { usePagination } from "use-pagination-firestore";
import { ExpandMoreRounded } from "@mui/icons-material";

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
  const { handleSubmit, formState: { errors }, setValue, control } = useForm<FormValues>();
  const [isWritePending, setWritePending] = useState<boolean>(false);
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [manager, setManager] = useState<UserCore | undefined>(undefined);

  useEffect(() => {
    setManager(props.department?.manager);
  }, [props.department])

  useEffect(() => {
    if (props.isOpen) {
      setValue("name", props.department?.name ? props.department.name : "")
    }
  }, [props.isOpen, props.department, setValue])

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<User>(
    query(collection(firestore, userCollection), orderBy(lastName, "asc")), {
      limit: 15
    }
  );

  const onDismiss = () => {
    setWritePending(false);
    props.onDismiss();
  }

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
        .finally(onDismiss)
    } else {
      DepartmentRepository.update(department)
        .then(() => enqueueSnackbar(t("feedback.department_updated")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.department_update_error"));
          if (isDev) console.log(error);
        })
        .finally(onDismiss)
    }
  }

  const onUserSelected = (user: User) => {
    setManager(minimize(user))
  }

  return (
    <>
      <Dialog
        fullWidth={true}
        maxWidth="xs"
        open={props.isOpen}
        onClose={onDismiss}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{t("dialog.details_department")}</DialogTitle>
          <DialogContent>
            <Container disableGutters>
              <Controller
                control={control}
                name="name"
                render={({ field: { ref, ...inputProps }}) => (
                  <TextField
                    {...inputProps}
                    autoFocus
                    type="text"
                    inputRef={ref}
                    label={t("field.department_name")}
                    error={errors.name !== undefined}
                    helperText={errors.name?.message !== undefined ? t(errors.name?.message) : undefined}/>
                  )}
                rules={{ required: { value: true, message: "feedback.empty_department_name" }}}/>
              <TextField
                value={manager !== undefined ? manager?.name : t("field.not_set")}
                label={t("field.manager")}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={onPickerView} edge="end">
                        <ExpandMoreRounded/>
                      </IconButton>
                    </InputAdornment>
                  )
                }}/>
            </Container>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={onDismiss}
              disabled={isWritePending}>
              {t("button.cancel")}
            </Button>
            <Button
              color="primary"
              type="submit"
              disabled={isWritePending}>
              {t("button.save")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <UserPicker
        isOpen={isPickerOpen}
        users={items}
        isLoading={isLoading}
        onDismiss={onPickerDismiss}
        onSelectItem={onUserSelected}
        canBack={isStart}
        canForward={isEnd}
        onBackward={getPrev}
        onForward={getNext}/>
    </>
  )
}

export default DepartmentEditor;