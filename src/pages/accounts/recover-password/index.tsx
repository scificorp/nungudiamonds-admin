// ** React Imports
import { useState, ChangeEvent, ReactNode } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Components
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import OutlinedInput from '@mui/material/OutlinedInput'
import { styled, useTheme } from '@mui/material/styles'
import MuiCard, { CardProps } from '@mui/material/Card'
import InputAdornment from '@mui/material/InputAdornment'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import AuthIllustrationV1Wrapper from 'src/views/pages/auth/AuthIllustrationV1Wrapper'
import { RESET_PASSWORD } from 'src/services/AdminServices'
import { toast } from 'react-hot-toast'
import { appErrors } from 'src/AppConstants'
import { SYSTEM_LOGO_MAIN } from 'src/AppConfig'
import Router from 'next/router'

interface State {
    oldPassword: string
    showOldPassword: boolean
    newPassword: string
    showNewPassword: boolean
    confirmNewPassword: string
    showConfirmNewPassword: boolean
}

// ** Styled Components
const Card = styled(MuiCard)<CardProps>(({ theme }) => ({
    [theme.breakpoints.up('sm')]: { width: '25rem' }
}))



const LinkStyled = styled(Link)(({ theme }) => ({
    display: 'flex',
    fontSize: '1rem',
    alignItems: 'center',
    textDecoration: 'none',
    justifyContent: 'center',
    color: theme.palette.primary.main
}))

const ResetPassword = () => {
    // ** States
    const [values, setValues] = useState<State>({
        oldPassword: '',
        showOldPassword: false,
        newPassword: '',
        showNewPassword: false,
        confirmNewPassword: '',
        showConfirmNewPassword: false
    })

    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');

    // ** Hook
    const theme = useTheme();

    // Handle New Password
    const handleNewPasswordChange = (prop: keyof State) => (event: ChangeEvent<HTMLInputElement>) => {
        setValues({ ...values, [prop]: event.target.value })
    }
    const handleClickShowNewPassword = () => {
        setValues({ ...values, showNewPassword: !values.showNewPassword })
    }

    ///////////////// API /////////////////

    const resetPasswordApi = async () => {

        const payload = {
            "new_password": values.newPassword,
            "token": token
        };

        try {
            const data = await RESET_PASSWORD(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                Router.push('/login')
            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }

    return (
        <Box className='content-center'>
            <AuthIllustrationV1Wrapper>
                <Card>
                    <CardContent sx={{ p: theme => `${theme.spacing(10.5, 8, 8)} !important` }}>
                        <Box sx={{ mb: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={SYSTEM_LOGO_MAIN} height={90} alt='logo image' />
                        </Box>
                        <Box sx={{ mb: 6 }}>
                            <Typography variant='h6' sx={{ mb: 1.5 }}>
                                Reset Password
                            </Typography>
                        </Box>
                        <form noValidate autoComplete='off' onSubmit={e => e.preventDefault()}>
                            <FormControl sx={{ display: 'flex', mb: 4 }} size="small">
                                <InputLabel htmlFor='auth-reset-password-new-password'>New Password</InputLabel>
                                <OutlinedInput
                                    label='New Password'
                                    value={values.newPassword}
                                    id='auth-reset-password-new-password'
                                    onChange={handleNewPasswordChange('newPassword')}
                                    type={values.showNewPassword ? 'text' : 'password'}
                                    endAdornment={
                                        <InputAdornment position='end'>
                                            <IconButton
                                                edge='end'
                                                onClick={handleClickShowNewPassword}
                                                onMouseDown={e => e.preventDefault()}
                                                aria-label='toggle password visibility'
                                            >
                                                <Icon icon={values.showNewPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                />
                            </FormControl>
                            <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 4 }} onClick={() => resetPasswordApi()}>
                                Set New Password
                            </Button>
                            <Typography sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', '& svg': { mr: 1 } }}>
                                <LinkStyled href='/login'>
                                    <Icon fontSize='1.25rem' icon='tabler:chevron-left' />
                                    <span>Back to login</span>
                                </LinkStyled>
                            </Typography>
                        </form>
                    </CardContent>
                </Card>
            </AuthIllustrationV1Wrapper>
        </Box>
    )
}

ResetPassword.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

ResetPassword.guestGuard = true

export default ResetPassword
