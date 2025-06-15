import { FormControlLabel, Switch } from "@mui/material"

const TccSwitch = ({ label, defaultChecked, color, size, checked, onChange }: any) => {
    return (
        <FormControlLabel
            label={label}
            control={<Switch
                defaultChecked={defaultChecked}
                color={color}
                size={size}
                checked={checked}
                onChange={onChange}
            />}
        />
    )
}

export default TccSwitch