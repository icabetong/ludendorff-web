import { SearchBoxProvided, connectSearchBox } from "react-instantsearch-core";
import { useTranslation } from "react-i18next";
import React, { ChangeEvent } from "react";
import { Box, InputBase } from "@mui/material";
import { SearchRounded } from "@mui/icons-material";

type SearchBoxInputBaseProps = SearchBoxProvided & {
  dontWatchFocus?: boolean,
  onFocusChanged?: (hasFocus: boolean) => void,
}
const SearchBoxInputBase = (props: SearchBoxInputBaseProps) => {
  const { t } = useTranslation();
  const onFocusGained = () => props.onFocusChanged?.(true)
  const onFocusLost = () => {
    if (!props.dontWatchFocus) {
      if (props.currentRefinement.match(/^ *$/) != null)
        return props.onFocusChanged?.(false)
      else return props.onFocusChanged?.(true)
    }
  }

  const onQueryChanged = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    props.refine(event.target.value)
    if (!props.dontWatchFocus) {
      if (event.target.value === '') {
        props.onFocusChanged?.(false)
      } else props.onFocusChanged?.(true)
    }
  }

  return (
    <Box
      sx={(theme) => (
        {
          display: 'flex',
          flexDirection: 'row',
          position: 'relative',
          padding: theme.spacing('4px', 1),
          borderRadius: 2,
          backgroundColor: theme.palette.divider,
          marginLeft: 0,
          marginRight: theme.spacing(2),
          width: '100%',
          [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(1),
            width: 'auto',
          }
        }
      )}>
      <Box
        sx={{
          padding: (theme) => theme.spacing(0, 1),
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <SearchRounded/>
      </Box>
      <InputBase
        id="search"
        placeholder={t("field.search")}
        value={props.currentRefinement}
        onFocus={onFocusGained}
        onBlur={onFocusLost}
        onChange={onQueryChanged}
        sx={(theme) => ({
          flexGrow: 1,
          color: 'inherit',
          transition: theme.transitions.create('width'),
          [theme.breakpoints.up('sm')]: {
            width: '18ch',
            '&:focus': {
              width: '20ch'
            }
          }
        })}/>
    </Box>

  );
}
export default connectSearchBox<SearchBoxInputBaseProps>(SearchBoxInputBase)