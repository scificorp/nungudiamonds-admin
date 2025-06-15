import { Icon } from "@iconify/react"
import TabContext from "@mui/lab/TabContext"
import { Avatar, Box, Button, Card, CardActions, CardContent, CircularProgress, Divider, Grid, IconButton, Typography } from "@mui/material"
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomChip from 'src/@core/components/mui/chip'
import { ThemeColor } from 'src/@core/layouts/types'
import { getInitials } from "src/@core/utils/get-initials"
import TabPanel from '@mui/lab/TabPanel'
import { SyntheticEvent, useState, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import MuiTabList, { TabListProps } from '@mui/lab/TabList'
import MuiTab, { TabProps } from '@mui/material/Tab'
import { useRouter } from "next/router"
import { CUSTOMER_GET_BY_ID } from "src/services/AdminServices"
import { toast } from "react-hot-toast"
import { appErrors } from "src/AppConstants"




interface ColorsType {
    [key: string]: ThemeColor
}

const Tab = styled(MuiTab)<TabProps>(({ theme }) => ({
    flexDirection: 'row',
    '& svg': {
        marginBottom: '0 !important',
        marginRight: theme.spacing(1.5)
    }
}))

const TabList = styled(MuiTabList)<TabListProps>(({ theme }) => ({
    borderBottom: '0 !important',
    '& .MuiTabs-indicator': {
        display: 'none'
    },
    '& .Mui-selected': {
        backgroundColor: theme.palette.primary.main,
        color: `${theme.palette.common.white} !important`
    },
    '& .MuiTab-root': {
        lineHeight: 1,
        borderRadius: theme.shape.borderRadius
    }
}))

const data = {
    id: 1,
    role: 'admin',
    status: 'active',
    username: 'gslixby0',
    avatarColor: 'primary',
    country: 'El Salvador',
    company: 'Yotz PVT LTD',
    billing: 'Manual - Cash',
    contact: '(479) 232-9151',
    currentPlan: 'enterprise',
    fullName: 'Daisy Patterson',
    email: 'gslixby0@abc.net.au',
    avatar: 'https://bit.ly/dan-abramov'
}
const roleColors: ColorsType = {
    admin: 'error',
    editor: 'info',
    author: 'warning',
    maintainer: 'success',
    subscriber: 'primary'
}


const statusColors: ColorsType = {
    active: 'success',
    pending: 'warning',
    inactive: 'secondary'
}

type Details = {
    full_name: string,
    email: string,
    mobile: any,
}
const CustomersDetails = () => {

    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [activeTab, setActiveTab] = useState<string>('account')
    const [customerDetailId, setCustomerDetailId] = useState(0)
    const [customerDetail, setCustomerDetail] = useState<Partial<Details>>({})

    const router = useRouter();
    const { id } = router.query;


    const handleChange = (event: SyntheticEvent, newValue: string) => {
        setActiveTab(newValue)
    };

    ///////////////////// CUSTOMER-DETAIL API ///////////////////////

    const customerDetailsData = async (customerId: number) => {
        try {
            const data = await CUSTOMER_GET_BY_ID(customerId);
            // console.log(data.data);
            if (data.code === 200 || data.code === "200") {
                setCustomerDetail(data.data)

            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }

    useEffect(() => {

        let customerId: string = id as string
        setCustomerDetailId(parseInt(customerId))
        customerDetailsData(parseInt(customerId));

    }, [router.isReady])

    return (
        <div>
            <Grid container spacing={6}>
                <Grid item xs={12} md={5} lg={4}>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent sx={{ pt: 13.5, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                {data.avatar ? (
                                    <CustomAvatar
                                        src={data.avatar}
                                        variant='rounded'
                                        alt={customerDetail.full_name}
                                        sx={{ width: 100, height: 100, mb: 4 }}
                                    />
                                ) : (
                                    <CustomAvatar
                                        skin='light'
                                        variant='rounded'
                                        color={data.avatarColor as ThemeColor}
                                        sx={{ width: 100, height: 100, mb: 4, fontSize: '3rem' }}
                                    >
                                        {getInitials(data.fullName)}
                                    </CustomAvatar>
                                )}
                                <Typography variant='h5' sx={{ mb: 3 }}>
                                    {customerDetail.full_name}
                                </Typography>

                            </CardContent>

                            <CardContent sx={{ pt: theme => `${theme.spacing(2)} !important` }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Box sx={{ mr: 8, display: 'flex', alignItems: 'center' }}>
                                        <CustomAvatar skin='light' variant='rounded' sx={{ mr: 2.5, width: 38, height: 38 }}>
                                            <Icon fontSize='1.75rem' icon='tabler:checkbox' />
                                        </CustomAvatar>
                                        <div>
                                            <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>1.23k</Typography>
                                            <Typography variant='body2'>Done</Typography>
                                        </div>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <CustomAvatar skin='light' variant='rounded' sx={{ mr: 2.5, width: 38, height: 38 }}>
                                            <Icon fontSize='1.75rem' icon='tabler:briefcase' />
                                        </CustomAvatar>
                                        <div>
                                            <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>568</Typography>
                                            <Typography variant='body2'>Total orders </Typography>
                                        </div>
                                    </Box>
                                </Box>
                            </CardContent>

                            <Divider sx={{ my: '0 !important', mx: 6 }} />

                            <CardContent sx={{ pb: 4 }}>
                                <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase' }}>
                                    Details
                                </Typography>
                                <Box sx={{ pt: 4 }}>
                                    <Box sx={{ display: 'flex', mb: 3 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>Username:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>@{data.username}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', mb: 3 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>Email:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>{customerDetail.email}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', mb: 3 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>Status:</Typography>
                                        <CustomChip
                                            rounded
                                            skin='light'
                                            size='small'
                                            label={data.status}
                                            color={statusColors[data.status]}
                                            sx={{
                                                textTransform: 'capitalize'
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', mb: 3 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>Contact:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>+91 {customerDetail.mobile}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', mb: 3 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>Total orders:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>10</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
                <Grid item xs={12} md={7} lg={8}>
                    <IconButton sx={{ float: "right" }} onClick={() => router.back()} color="primary">
                        <Icon icon='material-symbols:arrow-back-rounded' />
                    </IconButton>
                </Grid>
                {/* <Grid item xs={12} md={7} lg={8}>
                    <TabContext value={activeTab}>
                        <Box sx={{ display: 'flex' }}>
                            <TabList
                                variant='scrollable'
                                scrollButtons='auto'
                                onChange={handleChange}
                                aria-label='forced scroll tabs example'
                                sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}
                            >
                                <Tab value='account' label='Account' icon={<Icon fontSize='1.125rem' icon='tabler:user-check' />} />
                                <Tab value='security' label='Security' icon={<Icon fontSize='1.125rem' icon='tabler:lock' />} />
                                <Tab
                                    value='billing-plan'
                                    label='Billing & Plan'
                                    icon={<Icon fontSize='1.125rem' icon='tabler:currency-dollar' />}
                                />
                                <Tab value='notification' label='Notification' icon={<Icon fontSize='1.125rem' icon='tabler:bell' />} />
                                <Tab value='connection' label='Connection' icon={<Icon fontSize='1.125rem' icon='tabler:link' />} />
                            </TabList>
                            <IconButton onClick={() => router.back()} color="primary">
                                <Icon icon='material-symbols:arrow-back-rounded' />
                            </IconButton>
                        </Box>
                        <Box sx={{ mt: 6 }}>

                            <TabPanel sx={{ p: 0 }} value='account'>
                                <h1>Account</h1>
                            </TabPanel>
                            <TabPanel sx={{ p: 0 }} value='security'>
                                <h1>Security</h1>
                            </TabPanel>
                            <TabPanel sx={{ p: 0 }} value='billing-plan'>
                                <h1>billing</h1>
                            </TabPanel>
                            <TabPanel sx={{ p: 0 }} value='notification'>
                                <h1>notification</h1>
                            </TabPanel>
                            <TabPanel sx={{ p: 0 }} value='connection'>
                                <h1>Connection</h1>
                            </TabPanel>
                        </Box>
                    </TabContext>
                </Grid> */}
            </Grid>
        </div>
    )
}

export default CustomersDetails