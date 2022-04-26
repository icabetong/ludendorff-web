import { createContext, ReactNode, useContext, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

type DialogOptions = {
  title?: string,
  description?: string,
  confirmButtonText?: string,
  dismissButtonText?: string,
}
type DialogProps = DialogOptions & {
  isOpen: boolean,
  onConfirm: () => void,
  onDismiss: () => void,
}
const ConfirmationDialog = (props: DialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={props.isOpen} maxWidth="xs">
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{props.description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        { props.dismissButtonText &&
          <Button onClick={props.onDismiss}>
            {t("button.cancel")}
          </Button>
        }
        { props.confirmButtonText &&
          <Button onClick={props.onConfirm}>
            {t("button.continue")}
          </Button>
        }
      </DialogActions>
    </Dialog>
  )
}

const DialogServiceContext = createContext<(options: DialogOptions) => Promise<boolean>>(Promise.reject);
export const useDialog = () => useContext(DialogServiceContext);

type DialogProviderProps = {
  children: ReactNode
}
export const DialogProvider = (props: DialogProviderProps) => {
  const [confirmationState, setConfirmationState] = useState<DialogOptions | null>(null);

  const awaitingPromiseRef = useRef<{
    reject: () => void,
    resolve: (status: boolean) => void,
  }>();

  const openConfirmation = (options: DialogOptions) => {
    setConfirmationState(options);
    return new Promise<boolean>((resolve, reject) => {
      awaitingPromiseRef.current = { resolve, reject };
    });
  };

  const onHandleEvent = (status: boolean) => {
    if (awaitingPromiseRef.current) {
      awaitingPromiseRef.current.resolve(status);
    }
    setConfirmationState(null);
  };

  return (
    <>
      <DialogServiceContext.Provider
        value={openConfirmation}
        children={props.children}/>
      <ConfirmationDialog
        isOpen={Boolean(confirmationState)}
        onConfirm={() => onHandleEvent(true)}
        onDismiss={() => onHandleEvent(false)}
        {...confirmationState}/>
    </>
  )
}