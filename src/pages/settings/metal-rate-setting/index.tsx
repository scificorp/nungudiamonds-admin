import { Button, Card, CardContent, CardHeader, Divider, Grid, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { appErrors } from "src/AppConstants"
import TccInput from "src/customComponents/Form-Elements/inputField"
import { EDIT_GOLD_RATE, EDIT_PLATINUM_RATE, EDIT_SILVER_RATE, METAL_MASTER_DROPDOWN } from "src/services/AdminServices"

const MetalRateSetting = () => {

    const [goldRate, setGoldRate] = useState()
    const [silverRate, setSilverRate] = useState()
    const [platinumRate, setPlatinumRate] = useState()


    const metalMasterListData = async () => {

        try {
            const data = await METAL_MASTER_DROPDOWN();
            if (data.code === 200 || data.code === "200") {
                const goldRates = data.data.find((ele: any) => ele.id == 1)
                const silverRates = data.data.find((ele: any) => ele.id == 2)
                const platinumRates = data.data.find((ele: any) => ele.id == 3)

                setGoldRate(goldRates.metal_rate)
                setSilverRate(silverRates.metal_rate)
                setPlatinumRate(platinumRates.metal_rate)
            } else {

                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
        }
    }

    const goldRateUpdate = async () => {
        const payload = {
            "rate": goldRate
        }
        try {
            const data = await EDIT_GOLD_RATE(payload);
            if (data.code === 200 || data.code === "200") {

                return toast.success(data.message)
            } else {

                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
        }
    }

    const silverRateUpdate = async () => {
        const payload = {
            "rate": silverRate
        }
        try {
            const data = await EDIT_SILVER_RATE(payload);
            if (data.code === 200 || data.code === "200") {

                return toast.success(data.message)
            } else {

                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
        }
    }

    const platinumRateUpdate = async () => {
        const payload = {
            "rate": platinumRate
        }
        try {
            const data = await EDIT_PLATINUM_RATE(payload);
            if (data.code === 200 || data.code === "200") {

                return toast.success(data.message)
            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
        }
    }


    useEffect(() => {
        metalMasterListData()
    }, [])

    // console.log(goldRate)

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <CardHeader title='Metal Rate Setting'></CardHeader>
                    <Divider />
                    <CardContent>
                        <Grid item xs={12} md={6} lg={5} sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>Gold Rate: </Typography>
                            <TccInput
                                fullWidth
                                type="number"
                                label='Gold Rate'
                                value={goldRate || ''}
                                placeholder=''
                                onChange={(e: any) => setGoldRate(e.target.value)}
                            />
                            <Button variant='contained' onClick={goldRateUpdate}>
                                UPDATE
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={6} lg={5} sx={{ display: "flex", justifyContent: "space-between", mt: 10 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>Silver Rate: </Typography>
                            <TccInput
                                fullWidth
                                type='number'
                                label='Silver Rate'
                                value={silverRate || ''}
                                placeholder=''
                                onChange={(e: any) => setSilverRate(e.target.value)}
                            />
                            <Button variant='contained' onClick={silverRateUpdate}>
                                UPDATE
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={6} lg={5} sx={{ display: "flex", justifyContent: "space-between", mt: 10 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>Platinum Rate: </Typography>
                            <TccInput
                                fullWidth
                                type='number'
                                label='Platinum Rate'
                                value={platinumRate || ''}
                                placeholder=''
                                onChange={(e: any) => setPlatinumRate(e.target.value)}
                            />
                            <Button variant='contained' onClick={platinumRateUpdate}>
                                UPDATE
                            </Button>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}

export default MetalRateSetting