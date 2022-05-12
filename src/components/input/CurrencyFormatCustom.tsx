import React, { ForwardedRef, PropsWithChildren } from "react";
import NumberFormat from "react-number-format";

type CurrencyFormatCustomProps = {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

export const CurrencyFormatCustom = React.forwardRef<NumberFormat<any>, CurrencyFormatCustomProps>(
  function CurrencyFormatCustom(props: PropsWithChildren<CurrencyFormatCustomProps>, ref: ForwardedRef<NumberFormat<any>>) {
    const { onChange, ...other } = props;

    return (
      <NumberFormat
        {...other}
        getInputRef={ref}
        onValueChange={(values) => {
          onChange({
            target: {
              name: props.name,
              value: values.value,
            },
          });
        }}
        thousandSeparator
        isNumericString
      />
    );
  }
);