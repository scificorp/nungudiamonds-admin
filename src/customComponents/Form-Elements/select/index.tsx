import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"
import { title } from "process"
import { useState } from "react"


const TccSelect = ({ label, defaultValue, inputLabel, Options, onChange, value, fullWidth, sx, title, autowidth, InputProps }: any) => {

    return (
        <>
            <FormControl fullWidth={fullWidth} size='small' sx={sx}>
                <InputLabel id='demo-simple-select-outlined-label'>{inputLabel}</InputLabel>
                <Select
                    fullWidth={fullWidth}
                    label={label}
                    defaultValue={defaultValue}
                    id='demo-simple-select-outlined'
                    labelId='demo-simple-select-outlined-label'
                    value={value}
                    onChange={onChange}
                    inputProps={{ readOnly: InputProps }}

                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>

                    {Options.map((option: any) => (

                        <MenuItem key={option.id} value={option.id}>{option[title]}</MenuItem>

                    ))}
                </Select>
            </FormControl>
        </>
    )
}

export default TccSelect