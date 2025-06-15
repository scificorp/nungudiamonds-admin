
import { TextField } from "@mui/material";
import React, { useState } from "react";

const TccInput = ({ value, label, placeholder, type, onChange, fullWidth, rows, multiline, sx, disabled, InputProps }: any) => {

    return (
        <div className="form-group">
            <TextField
                InputProps={{ readOnly: InputProps }}
                disabled={disabled}
                label={label}
                value={value}
                placeholder={placeholder}
                type={type}
                fullWidth={fullWidth}
                size='small'
                onChange={onChange}
                rows={rows}
                multiline={multiline}
                sx={sx}
            />
        </div>
    );
};

export default TccInput;