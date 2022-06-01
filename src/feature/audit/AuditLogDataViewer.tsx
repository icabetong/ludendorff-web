import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Grid,
  TextField,
  Typography,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { Timestamp } from "firebase/firestore";
import { DataType, OperationData } from "./Audit";
import { Asset } from "../asset/Asset";
import { InventoryReport } from "../inventory/InventoryReport";
import { IssuedReport } from "../issue/IssuedReport";
import { StockCard } from "../stockcard/StockCard";
import { User } from "../user/User";
import { formatDate } from "../../shared/utils";

type AuditLogDataViewerProps = {
  dataType: DataType,
  data?: OperationData<any>
}
export const AuditLogDataViewer = (props: AuditLogDataViewerProps) => {
  if (!props.data) return <></>;

  switch(props.dataType) {
    case "asset":
      const asset = props.data as OperationData<Asset>;
      return <AuditLogDataViewerAsset data={asset}/>
    case "inventory":
      const inventory = props.data as OperationData<InventoryReport>;
      return <AuditLogDataViewerInventory data={inventory}/>
    case "issued":
      const issued = props.data as OperationData<IssuedReport>;
      return <AuditLogDataViewerIssued data={issued}/>
    case "stockCard":
      const stockCard = props.data as OperationData<StockCard>;
      return <AuditLogDataViewerStockCard data={stockCard}/>
    case "user":
      const user = props.data as OperationData<User>;
      return <AuditLogDataViewerUser data={user}/>
  }
}

type AuditLogDataViewerAssetProps = {
  data: OperationData<Asset>
}
const AuditLogDataViewerAsset = (props: AuditLogDataViewerAssetProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));
  const { before, after } = props.data;

  return (
    <Grid
      container
      direction={smBreakpoint ? "column" : "row"}
      alignItems="stretch"
      justifyContent="center"
      spacing={smBreakpoint ? 0 : 4}>
      <Grid
        item
        xs={6}
        alignItems="center"
        justifyContent="center"
        sx={{ maxWidth: '100%', pt: 0, pl: 0 }}>
      { before ?
        <>
          <Typography>{t("field.before")}</Typography>
            <TextField
              label={t("field.stock_number")}
              value={before.stockNumber}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label={t("field.description")}
              value={before.description}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label={t("field.category")}
              value={before.category?.categoryName}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label={t("field.subcategory")}
              value={before.subcategory}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label={t("field.unit_of_measure")}
              value={before.unitOfMeasure}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label={t("field.unit_value")}
              value={before.unitValue}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label={t("field.remarks")}
              value={before.remarks}
              InputProps={{ readOnly: true }}
            />
        </>
        : <Typography>{t("empty.no_before_data")}</Typography>
      }
      </Grid>
      <Grid
        item
        xs={6}
        alignItems="center"
        justifyContent="center"
        sx={{ maxWidth: '100%', pt: 0, pl: 0 }}>
        { after ?
          <>
            <Typography>{t("field.before")}</Typography>
            <TextField
              label={t("field.stock_number")}
              value={after.stockNumber}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label={t("field.description")}
              value={after.description}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label={t("field.category")}
              value={after.category?.categoryName}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label={t("field.subcategory")}
              value={after.subcategory}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label={t("field.unit_of_measure")}
              value={after.unitOfMeasure}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label={t("field.unit_value")}
              value={after.unitValue}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label={t("field.remarks")}
              value={after.remarks}
              InputProps={{ readOnly: true }}
            />
          </>
          : <Typography>{t("empty.no_before_data")}</Typography>
        }
      </Grid>
    </Grid>
  )
}

type AuditLogDataViewerInventoryProps = {
  data: OperationData<InventoryReport>
}
const AuditLogDataViewerInventory = (props: AuditLogDataViewerInventoryProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));
  const { before, after } = props.data;
  const [beforeDate, setBeforeDate] = useState<Date | undefined>(undefined);
  const [afterDate, setAfterDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (before) {
      let beforeTimestamp = before.accountabilityDate;
      if (beforeTimestamp instanceof Timestamp) {
        setBeforeDate(beforeTimestamp?.toDate());
      } else {
        if (beforeTimestamp)
          setBeforeDate(new Date(beforeTimestamp));
      }
    }
    if (after) {
      let afterTimestamp = after.accountabilityDate;
      if (afterTimestamp instanceof Timestamp) {
        setAfterDate(afterTimestamp?.toDate());
      } else {
        if (afterTimestamp)
          setAfterDate(new Date(afterTimestamp));
      }
    }
  }, [before, after]);

  return (
    <Grid
      container
      direction={smBreakpoint ? "column" : "row"}
      alignItems="stretch"
      justifyContent="center"
      spacing={smBreakpoint ? 0 : 4}>
      <Grid
        item
        xs={6}
        sx={{ maxWidth: '100%', pt: 0, pl: 0 }}>
        { before ?
          <>
            <Typography>{t("field.before")}</Typography>
            <TextField
              label={t("field.fund_cluster")}
              value={before.fundCluster}
              InputProps={{ readOnly: true }}/>
            <TextField
              label={t("field.year_month")}
              value={before.yearMonth}
              InputProps={{ readOnly: true }}/>
            <TextField
              label={t("field.accountability_date")}
              value={formatDate(beforeDate)}
              InputProps={{ readOnly: true }}/>
          </>
          : <Typography>{t("empty.no_before_data")}</Typography>
        }
      </Grid>
      <Grid
        item
        xs={6}
        sx={{ maxWidth: '100%', pt: 0, pl: 0 }}>
        { after ?
          <>
            <Typography>{t("field.after")}</Typography>
            <TextField
              label={t("field.fund_cluster")}
              value={after.fundCluster}
              InputProps={{ readOnly: true }}/>
            <TextField
              label={t("field.year_month")}
              value={after.yearMonth}
              InputProps={{ readOnly: true }}/>
            <TextField
              label={t("field.accountability_date")}
              value={formatDate(afterDate)}
              InputProps={{ readOnly: true }}/>
          </>
          : <Typography>{t("empty.no_after_data")}</Typography>
        }
      </Grid>
    </Grid>
  )
}

type AuditLogDataViewerIssuedProps = {
  data: OperationData<IssuedReport>
}
const AuditLogDataViewerIssued = (props: AuditLogDataViewerIssuedProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));
  const { before, after } = props.data;
  const [beforeDate, setBeforeDate] = useState<Date | undefined>(undefined);
  const [afterDate, setAfterDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (before) {
      let beforeTimestamp = before.date;
      if (beforeTimestamp instanceof Timestamp) {
        setBeforeDate(beforeTimestamp?.toDate());
      } else {
        if (beforeTimestamp)
          setBeforeDate(new Date(beforeTimestamp));
      }
    }
    if (after) {
      let afterTimestamp = after.date;
      if (afterTimestamp instanceof Timestamp) {
        setAfterDate(afterTimestamp?.toDate());
      } else {
        if (afterTimestamp)
          setAfterDate(new Date(afterTimestamp));
      }
    }
  }, [before, after]);

  return (
    <Grid
      container
      direction={smBreakpoint ? "column" : "row"}
      alignItems="stretch"
      justifyContent="center"
      spacing={smBreakpoint ? 0 : 4}>
      <Grid
        item
        xs={6}
        sx={{ maxWidth: '100%', pt: 0, pl: 0 }}>
        { before ?
          <>
            <Typography>{t("field.before")}</Typography>
            <TextField
              label={t("field.fund_cluster")}
              value={before.fundCluster}
              InputProps={{ readOnly: true }}/>
            <TextField
              label={t("field.serial_number")}
              value={before.serialNumber}
              InputProps={{ readOnly: true }}/>
            <TextField
              label={t("field.date")}
              value={formatDate(beforeDate)}
              InputProps={{ readOnly: true }}/>
          </>
          : <Typography>{t("empty.no_before_data")}</Typography>
        }
      </Grid>
      <Grid
        item
        xs={6}
        sx={{ maxWidth: '100%', pt: 0, pl: 0 }}>
        { after ?
          <>
            <Typography>{t("field.after")}</Typography>
            <TextField
              label={t("field.fund_cluster")}
              value={after.fundCluster}
              InputProps={{ readOnly: true }}/>
            <TextField
              label={t("field.serial_number")}
              value={after.serialNumber}
              InputProps={{ readOnly: true }}/>
            <TextField
              label={t("field.date")}
              value={formatDate(afterDate)}
              InputProps={{ readOnly: true }}/>
          </>
          : <Typography>{t("empty.no_after_data")}</Typography>
        }
      </Grid>
    </Grid>
  )
}

type AuditLogDataViewerStockCardProps = {
  data: OperationData<StockCard>
}
const AuditLogDataViewerStockCard = (props: AuditLogDataViewerStockCardProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));
  const { before, after } = props.data;

  return (
    <Grid
      container
      direction={smBreakpoint ? "column" : "row"}
      alignItems="stretch"
      justifyContent="center"
      spacing={smBreakpoint ? 0 : 4}>
      <Grid
        item
        xs={6}
        sx={{ maxWidth: '100%', pt: 0, pl: 0 }}>
        { before ?
          <>
            <Typography>{t("field.before")}</Typography>
            <TextField
              label={t("field.stock_number")}
              value={before.stockNumber}
              InputProps={{ readOnly: true }}/>
            <TextField
              label={t("field.description")}
              value={before.description}
              InputProps={{ readOnly: true }}/>
          </>
          : <Typography>{t("empty.no_before_data")}</Typography>
        }
      </Grid>
      <Grid
        item
        xs={6}
        sx={{ maxWidth: '100%', pt: 0, pl: 0 }}>
        { after ?
          <>
            <Typography>{t("field.after")}</Typography>
            <TextField
              label={t("field.stock_number")}
              value={after.stockNumber}
              InputProps={{ readOnly: true }}/>
            <TextField
              label={t("field.description")}
              value={after.description}
              InputProps={{ readOnly: true }}/>
          </>
          : <Typography>{t("empty.no_after_data")}</Typography>
        }
      </Grid>
    </Grid>
  )

}

type AuditLogDataViewerUserProps = {
  data: OperationData<User>
}
const AuditLogDataViewerUser = (props: AuditLogDataViewerUserProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));
  const { before, after } = props.data;

  return (
    <Grid
      container
      direction={smBreakpoint ? "column" : "row"}
      alignItems="stretch"
      justifyContent="center"
      spacing={smBreakpoint ? 0 : 4}>
      <Grid
        item
        xs={6}
        sx={{ maxWidth: '100%', pt: 0, pl: 0 }}>
        { before ?
          <>
            <Typography>{t("field.before")}</Typography>
            <TextField
              label={t("field.last_name")}
              value={before.lastName}
              InputProps={{ readOnly: true }}/>
            <TextField
              label={t("field.first_name")}
              value={before.firstName}
              InputProps={{ readOnly: true }}/>
            <TextField
              label={t("field.email")}
              value={before.email}
              InputProps={{ readOnly: true }}/>
            <TextField
              label={t("field.position")}
              value={before.position}
              InputProps={{ readOnly: true }}/>
          </>
          : <Typography>{t("empty.no_before_data")}</Typography>
        }
      </Grid>
      <Grid
        item
        xs={6}
        sx={{ maxWidth: '100%', pt: 0, pl: 0 }}>
        { after ?
          <>
            <Typography>{t("field.after")}</Typography>
            <TextField
              label={t("field.last_name")}
              value={after.lastName}
              InputProps={{ readOnly: true }}/>
            <TextField
              label={t("field.first_name")}
              value={after.firstName}
              InputProps={{ readOnly: true }}/>
            <TextField
              label={t("field.email")}
              value={after.email}
              InputProps={{ readOnly: true }}/>
            <TextField
              label={t("field.position")}
              value={after.position}
              InputProps={{ readOnly: true }}/>
          </>
          : <Typography>{t("empty.no_after_data")}</Typography>
        }
      </Grid>
    </Grid>
  )
}