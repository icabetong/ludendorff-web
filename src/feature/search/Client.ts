import algoliasearch from "algoliasearch";

export default algoliasearch(process.env.REACT_APP_ALGOLIA_ID!,
  process.env.REACT_APP_ALGOLIA_API_KEY!);