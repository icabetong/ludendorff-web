import {
    Card,
    Grid
} from "@material-ui/core";
import { Request } from "./Request";
import PaginationController from "../../components/PaginationController";

type RequestGridProps = {
    requests: Request[]
}

const RequestGrid = (props: RequestGridProps) => {
    return (
        <Grid container spacing={2}>
            { props.requests.map(request => (
                <RequestCard
                    request={request}/>
            ))}
        </Grid>
    );
}
export default RequestGrid;

type RequestCardProps = {
    request: Request
}

const RequestCard = (props: RequestCardProps) => {
    return (
        <Card>
            {props.request.asset?.assetName}
        </Card>
    )
}