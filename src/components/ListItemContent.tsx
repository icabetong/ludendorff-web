import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";

type ListItemContentPropTypes = {
    title: string | undefined,
    summary?: string | undefined
}

const ListItemContent = (props: ListItemContentPropTypes) => {
    return (
        <ListItemText
            primary={<Typography variant="body2">{props.title && props.title}</Typography>}
            secondary={
                props.summary &&
                <Typography variant="subtitle1">{props.summary}</Typography>
            }/>
    )
}

export default ListItemContent;