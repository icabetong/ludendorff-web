import { useState } from "react";
import { IconButton, TextField, TextFieldProps } from "@mui/material";
import { VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";

export const PasswordInput = (props: TextFieldProps) => {
  const [show, setShow] = useState(false);
  const onToggle = () => setShow((prevState)  => !prevState);
  const { InputProps, ...other } = props;

  return (
    <TextField
      {...other}
      type={show ? "text" : "password"}
      InputProps={{
        ...InputProps,
        endAdornment: (
          <IconButton edge="end" onClick={onToggle}>
            {show ? <VisibilityOffOutlined/> : <VisibilityOutlined/>}
          </IconButton>
        )
      }}/>
  )
}