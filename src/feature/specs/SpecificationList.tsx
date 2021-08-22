import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import { Specification } from "./Specification";

type SpecificationListProps = {
    specifications?: Specification,
    onItemSelected: (specs: [string, string]) => void
}

const SpecificationList = (props: SpecificationListProps) => {
    return (
        <React.Fragment>
            { props.specifications &&
                Object.keys(props.specifications).map((key) => {
                    return (
                        <SpecificationItem
                            key={key}
                            specificationKey={key}
                            specificationValue={props.specifications![key]}
                            onItemSelected={props.onItemSelected}/>
                    );
                })
            }
        </React.Fragment>
    )
}

type SpecificationItemProps = {
    specificationKey: string,
    specificationValue: string,
    onItemSelected: (spec: [string, string]) => void
}

const SpecificationItem = (props: SpecificationItemProps) => {
    return (
        <ListItem
            button
            key={props.specificationKey}
            onClick={() =>
                props.onItemSelected([props.specificationKey, props.specificationValue])
            }>
            <ListItemText
                primary={props.specificationValue}
                secondary={props.specificationKey}/>
        </ListItem>
    )
}


export default SpecificationList;