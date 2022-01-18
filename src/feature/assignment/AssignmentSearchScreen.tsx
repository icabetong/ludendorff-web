import {
  Container,
  Dialog,
  DialogContent,
  ListItem,
  ListItemText,
  makeStyles
} from "@material-ui/core";
import { InstantSearch, connectHits } from "react-instantsearch-dom";
import { HitsProvided } from "react-instantsearch-core";
import { SearchBox, Highlight, Results, Provider } from "../../components/Search";
import { Assignment } from "./Assignment";
import {
  assignmentAssetName,
  assignmentAssetCategoryName
} from "../../shared/const";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(2),
    minHeight: '80vh'
  }
}))

type AssignmentSearchScreenProps = {
  isOpen: boolean,
  onEditorInvoke: (assignment: Assignment) => void
  onDismiss: () => void
}
const AssignmentSearchScreen = (props: AssignmentSearchScreenProps) => {
  const classes = useStyles();

  return (
    <Dialog
      open={props.isOpen}
      onClose={props.onDismiss}
      fullWidth={true}
      maxWidth="md">
      <DialogContent dividers={true}>
        <Container className={classes.container}>
          <InstantSearch searchClient={Provider} indexName="assignments">
            <SearchBox />
            <Results>
              <AssignmentHits onItemSelect={props.onEditorInvoke} />
            </Results>
          </InstantSearch>
        </Container>
      </DialogContent>
    </Dialog>
  )
}

type AssignmentListProps = HitsProvided<Assignment> & {
  onItemSelect: (assignment: Assignment) => void
}
const AssignmentList = (props: AssignmentListProps) => {
  return (
    <>
      {props.hits.map((a: Assignment) => (
        <AssignmentListItem assignment={a} onItemSelect={props.onItemSelect} />
      ))
      }
    </>
  )
}
const AssignmentHits = connectHits<AssignmentListProps, Assignment>(AssignmentList);

type AssignmentListItemProps = {
  assignment: Assignment,
  onItemSelect: (assignment: Assignment) => void,
}
const AssignmentListItem = (props: AssignmentListItemProps) => {
  return (
    <ListItem
      button
      key={props.assignment.assignmentId}
      onClick={() => props.onItemSelect(props.assignment)}>
      <ListItemText
        primary={<Highlight attribute={assignmentAssetName} hit={props.assignment} />}
        secondary={<Highlight attribute={assignmentAssetCategoryName} hit={props.assignment} />} />
    </ListItem>
  )
}

export default AssignmentSearchScreen;