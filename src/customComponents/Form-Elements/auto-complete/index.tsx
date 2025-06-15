import { Autocomplete, TextField } from "@mui/material"

const TCCAutoComplete = ({ options, getOptionLabel, onChange, value, fullWidth, label }: any) => {
    return (
        <div className="form-group">
            <Autocomplete
                fullWidth={fullWidth}
                sx={{ width: 250 }}
                options={options}
                id='autocomplete-outlined'
                getOptionLabel={getOptionLabel}
                onChange={onChange}
                value={value}
                renderInput={params => <TextField {...params} label={label} />}
                size="small"
            />
        </div>
    )
}

export default TCCAutoComplete