import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Tooltip,
  makeStyles
} from "@material-ui/core";
import {
  LocalOfferOutlined,
  DeleteOutlineRounded,
} from "@material-ui/icons";
import { useSnackbar } from "notistack";

import EmptyStateComponent from "../state/EmptyStates";

import { Type, TypesRepository } from "./Type";
import { usePermissions } from "../auth/AuthProvider";
import ConfirmationDialog from "../shared/ConfirmationDialog";

const useStyles = makeStyles(() => ({
  root: {
    minHeight: '60vh'
  },
}));

type TypeListProps = {
  types: Type[],
  onItemSelect: (category: Type) => void
}

const TypeList = (props: TypeListProps) => {
  const classes = useStyles();
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
        ? <List className={classes.root}>
            {
              props.types.map((category: Type) => {
                return (
                  <CategoryItem
                    key={category.typeId}
                    category={category}
                    onItemSelect={props.onItemSelect}
                    onItemRemove={onRemoveInvoke} />
                );
              })
            }
          </List>
        : <EmptyStateComponent
          icon={LocalOfferOutlined}
          title={t("empty_type")}
          subtitle={t("empty_type_summary")} />
      }
      {type &&
        <ConfirmationDialog
          isOpen={type !== undefined}
          title="dialog.category_remove"
          summary="dialog.category_remove_summary"
          onDismiss={onRemoveDismiss}
          onConfirm={onCategoryRemove} />
      }
    </>
  );
}

type CategoryItemProps = {
  category: Type,
  onItemSelect: (category: Type) => void,
  onItemRemove: (category: Type) => void,
}

const CategoryItem = (props: CategoryItemProps) => {
  const { t } = useTranslation();
  const { canDelete } = usePermissions();

  const deleteButton = (
    <IconButton
      edge="end"
      disabled={props.category.count > 0}
      aria-label={t("delete")}
      onClick={() => props.onItemRemove(props.category)}>
      <DeleteOutlineRounded/>
    </IconButton>
  );

  return (
    <ListItem
      button
      key={props.category.typeId}
      onClick={() => props.onItemSelect(props.category)}>
      <ListItemText
        primary={props.category.typeName}
        secondary={t("template.count", { count: props.category.count })} />
      {canDelete &&
        <ListItemSecondaryAction>
          {props.category.count > 0
            ? <Tooltip title={<>{t("info.category_count_not_zero")}</>}>
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