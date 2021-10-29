import { useTranslation } from "react-i18next";
import { 
    FormControl, 
    InputAdornment, 
    InputLabel, 
    OutlinedInput,
    makeStyles
} from "@material-ui/core";
import { SearchIcon } from "@heroicons/react/outline";
import algoliasearch from "algoliasearch/lite";
import { connectSearchBox, connectStateResults, connectHighlight } from "react-instantsearch-dom";
import { HighlightProps, SearchBoxProvided, StateResultsProvided } from "react-instantsearch-core";
import HeroIconButton from "./HeroIconButton";
import EmptyStateComponent from "../feature/state/EmptyStates";
import React from "react";

const useStyles = makeStyles((theme) => ({
    textField: { width: '100%' },
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
                    <span className={classes.highlightResult} key={index}>{part.value}</span>
                ): (
                    <span key={index}>{part.value}</span>
                ))
            }
        </span>
    )
}
export const Highlight = connectHighlight(CustomHighlight)

const CustomSearchBox = (props: SearchBoxProvided) => {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <FormControl className={classes.textField} variant="outlined">
            <InputLabel htmlFor="search">{t("field.search")}</InputLabel>
            <OutlinedInput
                id="search"
                value={props.currentRefinement}
                label={t("field.search")}
                endAdornment={
                    <InputAdornment position="end">
                        <HeroIconButton
                            aria-label={t("button.search")}
                            icon={SearchIcon}
                            edge="end"/>
                    </InputAdornment>
                }
                onChange={e => props.refine(e.target.value)}/>
        </FormControl>
    )
}

type EmptySearchStateProps = {
    query: string | undefined
}
const EmptySearchState = (props: EmptySearchStateProps) => {
    const { t } = useTranslation();

    return (
        <EmptyStateComponent
            icon={SearchIcon}
            title={t("empty_search")}
            subtitle={t("empty_search_summary", { query: props.query })}/>
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
           : <EmptySearchState query={searchState.query}/>
        }
        </>
    )
}
export const Results = connectStateResults(ResultsComponent)

export const SearchBox = connectSearchBox(CustomSearchBox);
export const Provider = algoliasearch("H1BMXJXRBE", "ecfcef9a59b7ec023817ef3041de6416");