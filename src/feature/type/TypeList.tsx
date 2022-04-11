import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Tooltip } from "@mui/material";
import { DeleteOutlineRounded, LocalOfferOutlined, } from "@mui/icons-material";
import { useSnackbar } from "notistack";

import EmptyStateComponent from "../state/EmptyStates";

import { Type, TypesRepository } from "./Type";
import { usePermissions } from "../auth/AuthProvider";
import ConfirmationDialog from "../shared/ConfirmationDialog";

type TypeListProps = {
  types: Type[],
  onItemSelect: (category: Type) => void
}

const TypeList = (props: TypeListProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [type, setType] = useState<Type | undefined>(undefined);

  const onRemoveInvoke = (category: Type) => setType(category);
  const onRemoveDismiss = () => setType(undefined);

  const onCategoryRemove = () => {
    if (type !== undefined) {
      TypesRepository.remove(type)
        .then(() => enqueueSnackbar(t("feedback.type_removed")))
        .catch(() => enqueueSnackbar(t("feedback.type_remove_error")))
        .finally(onRemoveDismiss)
    }
  }

  return (
    <>
      {props.types.length > 0
        ? <List sx={{ minHeight: '100%' }}>
          {
            props.types.map((category: Type) => {
              return (
                <TypeItem
                  key={category.typeId}
                  type={category}
                  onItemSelect={props.onItemSelect}
                  onItemRemove={onRemoveInvoke}/>
              );
            })
          }
        </List>
        : <EmptyStateComponent
          icon={LocalOfferOutlined}
          title={t("empty.type")}
          subtitle={t("empty.type_summary")}/>
      }
      <ConfirmationDialog
        isOpen={type !== undefined}
        title="dialog.type_remove"
        summary="dialog.type_remove_summary"
        onDismiss={onRemoveDismiss}
        onConfirm={onCategoryRemove}/>
    </>
  );
}

type TypeItemProps = {
  type: Type,
  onItemSelect: (type: Type) => void,
  onItemRemove: (type: Type) => void,
}

const TypeItem = (props: TypeItemProps) => {
  const { t } = useTranslation();
  const { canDelete } = usePermissions();

  const deleteButton = (
    <IconButton
      edge="end"
      disabled={props.type.count > 0}
      aria-label={t("delete")}
      onClick={() => props.onItemRemove(props.type)}
      size="large">
      <DeleteOutlineRounded/>
    </IconButton>
  );

  return (
    <ListItem
      button
      key={props.type.typeId}
      onClick={() => props.onItemSelect(props.type)}>
      <ListItemText
        primary={props.type.typeName}
        secondary={t("template.count", { count: props.type.count })}/>
      {canDelete &&
        <ListItemSecondaryAction>
          {props.type.count > 0
            ? <Tooltip title={<>{t("info.type_count_not_zero")}</>}>
              <span>{deleteButton}</span>
            </Tooltip>
            : <>{deleteButton}</>
          }
        </ListItemSecondaryAction>
      }
    </ListItem>
  )
}

export default TypeList;