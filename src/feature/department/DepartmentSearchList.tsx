import { Department } from "./Department";
import { List, ListItemButton, ListItemText } from "@mui/material";
import { Highlight } from "../../components/Search";
import { departmentManagerName, departmentName } from "../../shared/const";
import { HitsProvided } from "react-instantsearch-core";
import { connectHits } from "react-instantsearch-dom";

type DepartmentSearchListProps = HitsProvided<Department> & {
  onItemSelect: (department: Department) => void,
}
const DepartmentSearchListCore = (props: DepartmentSearchListProps) => {
  return (
    <List>
      { props.hits.map((department: Department) => {
        return (
          <DepartmentSearchListItem
            department={department}
            onItemSelect={props.onItemSelect}/>
        );
      })
      }
    </List>
  )
}

type DepartmentSearchListItemProps = {
  department: Department,
  onItemSelect: (department: Department) => void,
}
const DepartmentSearchListItem = (props: DepartmentSearchListItemProps) => {
  return (
    <ListItemButton onClick={() => props.onItemSelect(props.department)}>
      <ListItemText
        primary={<Highlight attribute={departmentName} hit={props.department}/>}
        secondary={<Highlight attribute={departmentManagerName} hit={props.department}/>}/>
    </ListItemButton>
  )
}
const DepartmentSearchList = connectHits<DepartmentSearchListProps, Department>(DepartmentSearchListCore);
export default DepartmentSearchList;