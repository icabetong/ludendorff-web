import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import { Assignment } from "./Assignment";

type AssignmentListProps = {
  assignments: Assignment[],
  onItemSelect: (assignment: Assignment) => void
}

const AssignmentList = (props: AssignmentListProps) => {
  return (
    <List>{
      props.assignments.map((assignment: Assignment) => {
        return (
          <AssignmentItem
            key={assignment.assignmentId}
            assignment={assignment}
            onItemSelect={props.onItemSelect} />
        )
      })
    }</List>
  )
}

type AssignmentItemProps = {
  assignment: Assignment,
  onItemSelect: (assignment: Assignment) => void
}

const AssignmentItem = (props: AssignmentItemProps) => {
  return (
    <ListItem
      button
      key={props.assignment.assignmentId}
      onClick={() => props.onItemSelect(props.assignment)}>
      <ListItemText
        primary={props.assignment?.asset?.assetName}
        secondary={props.assignment?.user?.name} />
    </ListItem>
  )
}

export default AssignmentList;