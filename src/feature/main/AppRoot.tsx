import React, { useState } from "react";
import { useLocation, Navigate } from "react-router";
import { useTheme, useMediaQuery } from "@mui/material";
import { Destination } from "../navigation/NavigationContainer";
import { useAuthState } from "../auth/AuthProvider";
import { MainLoadingState } from "../state/LoadingStates";
import { SnackbarProvider } from "notistack";
import FinishAccountDialog from "../auth/FinishAccountDialog";
import { DialogProvider } from "../../components/dialog/DialogProvider";
import DestinationContainer from "./DestinationContainer";

const AppRoot = () => {
  const location = useLocation();
  const theme = useTheme();
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));
  const { status, user } = useAuthState();
  const [destination, setDestination] = useState<Destination>(() => {
    const prev = localStorage.getItem('tab');
    if (prev)
      return prev as Destination;

    return "assets";
  });

  const onNavigate = (destination: Destination) => setDestination(destination);

  if (status === 'fetched') {
    if (user) {
      return (
        <DialogProvider>
          <SnackbarProvider
            maxSnack={3}
            autoHideDuration={3000}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: smBreakpoint ? 'center' : 'right'
            }}>
            <>
              <DestinationContainer destination={destination} onNavigate={onNavigate}/>
              <FinishAccountDialog isOpen={!user.setupCompleted}/>
            </>
          </SnackbarProvider>
        </DialogProvider>
      )
    } else return <Navigate to="/login" state={{ from: location }} replace/>
  } else if (status === 'pending') {
    return <MainLoadingState/>
  } else return <Navigate to="/error" state={{ from: location }} replace/>
}

export default AppRoot;
