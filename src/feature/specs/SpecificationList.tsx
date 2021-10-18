import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

type SpecificationListProps = {
    specifications?: Map<string, string>,
    onItemSelected: (specs: [string, string]) => void
}

const SpecificationList = (props: SpecificationListProps) => {
    return (
        <React.Fragment>
            { props.specifications &&
                Array.from(props.specifications).map(([key, value]) => {
                    return (
                        <SpecificationItem
                            key={key}
                            specificationKey={key}
                            specificationValue={value}
                            onItemSelected={props.onItemSelected}/>
                    )
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