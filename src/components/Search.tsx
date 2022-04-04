import { useTranslation } from "react-i18next";
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput, TextField,
  Theme
} from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { SearchOutlined } from "@mui/icons-material";
import algoliasearch from "algoliasearch/lite";
import { connectSearchBox, connectStateResults, connectHighlight } from "react-instantsearch-dom";
import { HighlightProps, SearchBoxProvided, StateResultsProvided } from "react-instantsearch-core";
import EmptyStateComponent from "../feature/state/EmptyStates";
import React, { ChangeEvent } from "react";

const useStyles = makeStyles((theme: Theme) => ({
  highlightResult: {
    color: theme.palette.primary.main
  }
}))

const CustomHighlight = ({ highlight, attribute, hit }: HighlightProps) => {
  const classes = useStyles();
  const parsedHit = highlight({
    highlightProperty: '_highlightResult',
    attribute,
    hit
  })

  return (
    <span>
      { parsedHit.map((part, index) =>
        part.isHighlighted ? (
          <span className={ classes.highlightResult } key={ index }>{ part.value }</span>
        ) : (
          <span key={ index }>{ part.value }</span>
        ))
      }
    </span>
  )
}
export const Highlight = connectHighlight(CustomHighlight)

type SearchBoxProps = SearchBoxProvided & {
  onFocusChanged?: (hasFocus: boolean) => void,
}
const SearchBoxCore = (props: SearchBoxProps) => {
  const { t } = useTranslation();
  const onFocusGained = () => props.onFocusChanged?.(true)
  const onFocusLost = () => props.onFocusChanged?.(props.currentRefinement.match(/^ *$/) != null)

  const onQueryChanged = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    props.refine(event.target.value)
    if (event.target.value === '') {
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
  );
}

type EmptySearchStateProps = {
  query: string | undefined
}
const EmptySearchState = (props: EmptySearchStateProps) => {
  const { t } = useTranslation();

  return (
    <EmptyStateComponent
      icon={ SearchOutlined }
      title={ t("empty.search") }
      subtitle={ t("empty.search_summary", { query: props.query }) }/>
  );
}

interface ResultsProps extends StateResultsProvided {
  children?: React.ReactNode | React.ReactNode[]
}

const ResultsComponent: React.FC<ResultsProps> = ({ children, searchResults, searchState }) => {
  return (
    <>
      { searchResults && searchResults.nbHits !== 0
        ? children
        : <EmptySearchState query={ searchState.query }/>
      }
    </>
  )
}
export const Results = connectStateResults(ResultsComponent)

export const SearchBox = connectSearchBox<SearchBoxProps>(SearchBoxCore);
export const Provider = algoliasearch("H1BMXJXRBE", "ecfcef9a59b7ec023817ef3041de6416");