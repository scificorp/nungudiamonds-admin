import { FormControlLabel, Radio } from "@mui/material"

const TccRadioButton = ({ value, label, color, onChange, checked }: any) => {
    return (
        <div>
            <FormControlLabel
                value={value}
                label={label}
                control={<Radio
                    checked={checked}
                    color={color}
                    onChange={onChange}
                />}
            />
        </div>
    )
}

export default TccRadioButton