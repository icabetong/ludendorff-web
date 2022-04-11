import { useTheme } from "@mui/material/styles";
import { ReactComponent as Logo } from "../../shared/icon.svg";
import { Box, CircularProgress, LinearProgress } from "@mui/material";

export const MainLoadingStateComponent = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'}}>
      <Box
        component={Logo}
        stroke={theme.palette.primary.main}
        sx={{
          display: 'block',
          margin: '2em auto',
          width: '8em',
          height: '8em',
          color: theme.palette.primary.main
        }}/>
      <LinearProgress
        sx={{
          margin: '0 auto',
          width: '10em'
        }}/>
    </Box>
  )
}

export const ContentLoadingStateComponent = () => {
  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress/>
    </Box>
  )
}