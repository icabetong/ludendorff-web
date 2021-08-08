import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";

type ListItemContentPropTypes = {
    title: string | undefined,
    summary?: string | undefined
}

export const ListItemContent = (props: ListItemContentPropTypes) => {
    return (
        <ListItemText
            primary={<Typography variant="body1">{props.title && props.title}</Typography>}
            secondary={
                props.summary &&
                <Typography variant="subtitle2">{props.summary}</Typography>
            }/>
    )
}