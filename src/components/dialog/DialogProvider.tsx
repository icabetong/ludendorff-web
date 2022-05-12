import { createContext, ReactNode, useContext, useState, useRef } from "react";
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
const ProvidedDialog = (props: DialogProps) => {
  return (
    <Dialog open={props.isOpen} maxWidth="xs">
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{props.description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        { props.dismissButtonText &&
          <Button onClick={props.onDismiss}>
            {props.dismissButtonText}
          </Button>
        }
        { props.confirmButtonText &&
          <Button variant="contained" onClick={props.onConfirm}>
            {props.confirmButtonText}
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
  const [dialogState, setDialogState] = useState<DialogOptions | null>(null);

  const awaitingPromiseRef = useRef<{
    reject: () => void,
    resolve: (status: boolean) => void,
  }>();

  const openConfirmation = (options: DialogOptions) => {
    setDialogState(options);
    return new Promise<boolean>((resolve, reject) => {
      awaitingPromiseRef.current = { resolve, reject };
    });
  };

  const onHandleEvent = (status: boolean) => {
    awaitingPromiseRef.current?.resolve(status);
    setDialogState(null);
  };

  return (
    <DialogServiceContext.Provider
      value={openConfirmation}>
      {props.children}
      { dialogState !== null &&
        // TODO: Fix that annoying ghost dialog
        <ProvidedDialog
          isOpen={true}
          onConfirm={() => onHandleEvent(true)}
          onDismiss={() => onHandleEvent(false)}
          {...dialogState}/>
      }
    </DialogServiceContext.Provider>
  )
}