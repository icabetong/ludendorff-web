import React, { ReactNode } from "react";
import { Box } from "@mui/material";

type EditorContentProps = {
  children: JSX.Element | ReactNode
}
export const EditorContent = (props: EditorContentProps) => {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 2 }}>
      {props.children}
    </Box>
  )
}