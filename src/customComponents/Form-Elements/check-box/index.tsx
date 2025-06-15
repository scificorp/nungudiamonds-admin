import { Checkbox, FormControlLabel } from "@mui/material"

const TccCheckBox = ({ label, defaultChecked, color, checked, onChange, sx, size, id, indeterminate }: any) => {
    return (
        <div className="form-group">
            <FormControlLabel
                label={label}
                sx={sx}
                control={<Checkbox
                    defaultChecked={defaultChecked}
                    color={color}
                    checked={checked}
                    onChange={onChange}
                    size={size}
                    id={id}
                    indeterminate={indeterminate}
                />}
            />
        </div>
    )
}

export default TccCheckBox