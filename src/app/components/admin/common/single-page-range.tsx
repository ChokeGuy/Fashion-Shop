import * as React from "react";
import Calendar from "@mui/icons-material/Event";
import { Dayjs } from "dayjs";
import "dayjs/locale/en-gb";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import {
  SingleInputDateRangeField,
  SingleInputDateRangeFieldProps,
} from "@mui/x-date-pickers-pro/SingleInputDateRangeField";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { PickerValidDate } from "@mui/x-date-pickers/models";
import { DateRange, FieldType } from "@mui/x-date-pickers-pro/models";
import { Dispatch, SetStateAction } from "react";

type FieldComponent = (<TDate extends PickerValidDate>(
  props: SingleInputDateRangeFieldProps<TDate> &
    React.RefAttributes<HTMLInputElement>
) => React.JSX.Element) & { fieldType?: FieldType };

const WrappedSingleInputDateRangeField = React.forwardRef(
  (
    props: SingleInputDateRangeFieldProps<Dayjs>,
    ref: React.Ref<HTMLInputElement>
  ) => {
    return <SingleInputDateRangeField size="small" {...props} ref={ref} />;
  }
) as FieldComponent;

WrappedSingleInputDateRangeField.fieldType = "single-input";

export default function SingleInputDateRangePickerWithAdornment({
  value,
  setValue,
}: {
  value: DateRange<Dayjs>;
  setValue: Dispatch<SetStateAction<DateRange<Dayjs>>>;
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={"en-gb"}>
      <DemoContainer components={["SingleInputDateRangeField"]}>
        <DateRangePicker
          value={value}
          onChange={(newValue) => setValue(newValue)}
          slots={{ field: WrappedSingleInputDateRangeField }}
          slotProps={{
            textField: {
              InputProps: { endAdornment: <Calendar /> },
            },
          }}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
}
