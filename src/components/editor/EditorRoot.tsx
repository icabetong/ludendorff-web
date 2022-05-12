import React, { ReactNode } from "react";
import { Box } from "@mui/material";

type EditorRootProps = {
  children: JSX.Element | ReactNode
  onSubmit?: () => void,
}

export const EditorRoot = (props: EditorRootProps) => {
  return (
    <Box
      component="form"
      onSubmit={props.onSubmit}
      sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {props.children}
    </Box>
  )
}
