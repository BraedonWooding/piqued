import {
  Checkbox,
  FormControlLabel,
  FormHelperText,
  makeStyles,
  OutlinedInputProps,
  TextField,
} from "@material-ui/core";
import { FieldHookConfig, useField } from "formik";
import React, { FC, ReactNode } from "react";

type MyCheckboxProps = { label: ReactNode } & FieldHookConfig<string>;

type MyTextFieldProps = {
  placeholder?: string;
  label?: string;
  type?: string;
  autoFocus?: boolean;
  multiline?: boolean;
  InputProps?: Partial<OutlinedInputProps>;
} & FieldHookConfig<string>;

export const MyCheckbox: FC<MyCheckboxProps> = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  const errorText = meta.error && meta.touched ? meta.error : "";
  return (
    <>
      <FormControlLabel {...field} control={<Checkbox />} label={label} />
      <FormHelperText error={!!errorText}>{!!errorText ? errorText : ""}</FormHelperText>
    </>
  );
};

export const MyTextField: FC<MyTextFieldProps> = ({
  placeholder,
  label,
  type,
  autoFocus,
  multiline,
  InputProps,
  ...props
}) => {
  const [field, meta] = useField(props);
  const errorText = meta.error && meta.touched ? meta.error : "";
  return (
    <TextField
      variant="outlined"
      margin="normal"
      required
      fullWidth
      id={label}
      placeholder={placeholder}
      label={label}
      type={type}
      autoFocus={autoFocus}
      multiline={multiline}
      helperText={errorText}
      error={!!errorText}
      InputProps={InputProps}
      {...field}
    />
  );
};

export const useStyles = makeStyles((theme) => ({
  card: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(4),
    display: "flex",
    maxWidth: 600,
    minWidth: 400,
    flexDirection: "column",
    alignItems: "center",
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
    [theme.breakpoints.down("md")]: {
      width: "100%",
    },
  },
}));
