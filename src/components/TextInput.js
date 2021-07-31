import TextField from '@material-ui/core/TextField';

export const TextInput = (props) => {
    return(
        <TextField
            variant="outlined"
            size="small"
            style={props.style}
            id={props.id}
            type={props.type}
            value={props.value}
            label={props.label}
            disabled={props.disabled}
            onChange={props.onChange}/>
    )
}