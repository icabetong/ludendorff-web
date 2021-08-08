import { Container, Paper, List, ListItem, ListItemIcon, ListItemText, Divider } from "@material-ui/core";
import { HomeIcon } from "@heroicons/react/outline";

import "./Navigation.scss";

export enum Destination {
    HOME = "Home", 
    SCAN = "Scan", 
    ASSETS = "Assets", 
    USERS = "Users", 
    ASSIGNMENTS = "Assignments"
}

type NavigationComponentPropsType =  {
    onNavigate: Function
}

export const NavigationComponent = (props: NavigationComponentPropsType) => {
    const destinations = [Destination.HOME, Destination.SCAN, Destination.ASSETS, Destination.USERS, Destination.ASSIGNMENTS];

    return (
        <Container className="match-parent" disableGutters={true}>
            <Paper className="match-parent">
                <List>{
                    destinations.map((destination) => {
                        return (
                            <ListItem button key={destination} onClick={() => props.onNavigate(destination)}>
                                <ListItemText primary={destination}/>
                            </ListItem>
                        )
                    })
                }</List>
                <Divider/>
            </Paper>
        </Container>
    )
}