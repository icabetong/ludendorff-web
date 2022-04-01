import React, { FunctionComponent, ComponentClass, ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { connectSearchBox } from "react-instantsearch-dom";
import { SearchBoxProvided } from "react-instantsearch-core";

type SearchBoxType = SearchBoxProvided & {
  onFocusChanged?: (hasFocus: boolean) => void,
}

const SearchBoxCore = (props: SearchBoxType) => {
  const { t } = useTranslation();

  const onFocusGained = () => {
    props.onFocusChanged?.(true)
  }

  const onFocusLost = () => {
    if (props.currentRefinement.match(/^ *$/) != null) {
      return props.onFocusChanged?.(false)
    } else
      return props.onFocusChanged?.(true)
  }

  const onQueryChanged = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    props.refine(event.target.value)
    if (event.target.value === "") {
      props.onFocusChanged?.(false)
    }
  }

  return (
    <TextField
      id="search"
      size="small"
      value={ props.currentRefinement }
      label={ t("field.search") }
      onFocus={ onFocusGained }
      onBlur={ onFocusLost }
      onChange={ onQueryChanged }/>
  )
}
const SearchBox = connectSearchBox<SearchBoxType>(SearchBoxCore)

type PageHeaderPropsType = {
  title: String,
  buttonText?: String,
  buttonIcon?: string | FunctionComponent<any> | ComponentClass<any, any>,
  buttonOnClick?: React.MouseEventHandler,
  onSearchFocusChanged?: (hasFocus: boolean) => void,
}

const PageHeader = (props: PageHeaderPropsType) => {
  const { title, buttonText: label, buttonIcon: icon, buttonOnClick: event } = props;

  return (
    <Box mx={ 3 } pt={ 4 } sx={ { w: "100%", display: 'flex', flexDirection: 'row', alignItems: 'center' } }>
      <Box flexGrow={ 3 }>
        <Typography variant="h4">{ title }</Typography>
      </Box>
      { props.onSearchFocusChanged &&
          <Box sx={ { mx: 2 } }>
              <SearchBox onFocusChanged={ props.onSearchFocusChanged }/>
          </Box>
      }
      { label && event &&
          <Box>
              <Button
                  variant="contained"
                  color="primary"
                  startIcon={ icon && React.createElement(icon) }
                  onClick={ event }>
                { label }
              </Button>
          </Box>
      }
    </Box>
  )
}

export default PageHeader;