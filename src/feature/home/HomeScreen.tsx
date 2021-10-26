import { useReducer } from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@material-ui/core";
import { PlusIcon } from "@heroicons/react/outline";

import ComponentHeader from "../../components/ComponentHeader";
import { useAuthState } from "../auth/AuthProvider";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { Request } from "../requests/Request";
import RequestEditor from "../requests/RequestEditor";
import { ActionType, reducer, initialState } from "../requests/RequestEditorReducer";
import RequestGrid from "../requests/RequestGrid";
import { requestCollection, requestedAssetName, petitionerId } from "../../shared/const";
import { usePagination } from "../../shared/pagination";
import { firestore } from "../../index";

type HomeScreenProps = {
    onDrawerToggle: () => void
}

const HomeScreen = (props: HomeScreenProps) => {
    const { t } = useTranslation();
    const { user } = useAuthState();

    const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Request>(
        firestore.collection(requestCollection)
            .where(petitionerId, "==", user?.userId)
            .orderBy(requestedAssetName, "asc"), { limit: 15 }
    );

    const [state, dispatch] = useReducer(reducer, initialState);

    const onEditorCreate = () => dispatch({ type: ActionType.CREATE })
    const onEditorDismiss = () => dispatch({ type: ActionType.DISMISS })
    const onEditorUpdate = (request: Request) => {
        dispatch({
            type: ActionType.UPDATE,
            payload: request
        })
    }

    return (
        <Box>
            <ComponentHeader 
                title={t("navigation.home")}
                buttonText={t("button.add")}
                buttonIcon={PlusIcon}
                buttonOnClick={onEditorCreate}
                onDrawerToggle={props.onDrawerToggle}/>
            { !isLoading
                ? <RequestGrid requests={items}/>
                : <ErrorNoPermissionState/>
            }
            { state.isOpen &&
                <RequestEditor
                    isOpen={state.isOpen}
                    isCreate={state.isCreate}
                    onDismiss={onEditorDismiss}/>
            }
        </Box>
    )
}

export default HomeScreen;