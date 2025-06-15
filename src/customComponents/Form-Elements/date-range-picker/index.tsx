import { useState, forwardRef, useEffect } from "react";
import DatePicker, { ReactDatePickerProps } from 'react-datepicker'
import addDays from 'date-fns/addDays'
import format from 'date-fns/format'
import { Box, TextField } from "@mui/material";
import DatePickerWrapper from "../styles/data-picker";
import { isToday } from "date-fns";
import { date } from "yup";
import moment from "moment";

interface PickerProps {
    label?: string
    end: Date | number
    start: Date | number
}
type DateType = Date | null | undefined

const TccDateRangePicker = (prop: any) => {
    const [startDate, setStartDate] = useState<DateType>(new Date())
    const [endDate, setEndDate] = useState<DateType>(addDays(new Date(), 1))

    const handleOnChange = (dates: any) => {
        const [start, end] = dates
        setStartDate(start)
        setEndDate(end)
        prop.startDate(start)
        prop.endDate(end)

    }

    useEffect(() => {
        if (prop.onDatedata.showStartDate != null && prop.onDatedata.showEndDate != null) {
            setStartDate(new Date(prop.onDatedata.showStartDate))
            setEndDate(new Date(prop.onDatedata.showEndDate))
        }
    }, [prop.onDatedata])

    const handleDeafultvalue = () => {
        setStartDate(new Date())
        setEndDate(addDays(new Date(), 1))
    }

    useEffect(() => {
        if (prop.ondeafultvalue == "Add") {
            handleDeafultvalue()
        }
    }, [prop.ondeafultvalue])

    const CustomInput = forwardRef((props: PickerProps, ref) => {
        const startDate = format(props.start, 'dd/MM/yyyy')
        const endDate = props.end !== null ? ` - ${format(props.end, 'dd/MM/yyyy')}` : null

        const value = `${startDate}${endDate !== null ? endDate : ''}`

        return <TextField
            sx={{ mb: 4 }}
            size='small'
            fullWidth
            inputRef={ref}
            label={props.label || ''} {...props}
            value={value}
        />
    })

    return (
        <DatePickerWrapper>

            <div>
                <DatePicker
                    id='specific-date'
                    selectsRange
                    endDate={endDate}
                    selected={startDate}
                    startDate={startDate}
                    minDate={new Date()}
                    onChange={handleOnChange}
                    shouldCloseOnSelect={false}
                    customInput={
                        <CustomInput label='ActiveDate to ExpiryDate' start={startDate as Date | number} end={endDate as Date | number} />
                    }
                />
            </div>

        </DatePickerWrapper>
    )
}

export default TccDateRangePicker