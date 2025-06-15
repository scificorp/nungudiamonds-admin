// ** React Imports
import { useState, SyntheticEvent, Fragment, useEffect, ChangeEvent } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Context
import { useAuth } from 'src/hooks/useAuth'

// ** Type Imports
import { Settings } from 'src/@core/context/settingsContext'
import { localStorageUtils } from 'src/utils/localStorageUtils'
import { Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, Modal, TextField } from '@mui/material'
import { toast } from 'react-hot-toast'
import { CHANGE_PASSWORD } from 'src/services/AdminServices'
import { appErrors } from 'src/AppConstants'

interface Props {
  settings: Settings
}

interface newPasswordState {
  newPassword: string
  showNewPassword: boolean
}

interface confirmPasswordState {
  confirmPassword: string
  showConfirmPassword: boolean
}

// ** Styled Components
const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
}))

const MenuItemStyled = styled(MenuItem)<MenuItemProps>(({ theme }) => ({
  '&:hover .MuiBox-root, &:hover .MuiBox-root svg': {
    color: theme.palette.primary.main
  }
}))

const UserDropdown = (props: Props) => {
  // ** Props
  const { settings } = props

  // ** States
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)
  const [open, setOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPasswordValue, setNewPasswordValue] = useState<newPasswordState>({ newPassword: '', showNewPassword: false })
  const [confirmPasswordValue, setConfirmPasswordValue] = useState<confirmPasswordState>({ confirmPassword: '', showConfirmPassword: false })

  // ** Hooks
  const router = useRouter()
  const { logout } = useAuth()

  // ** Vars
  const { direction } = settings

  const handleDropdownOpen = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget)
  }

  const userData = localStorageUtils.getUserInfo()

  const handleDropdownClose = (url?: string) => {
    if (url) {
      router.push(url)
    }
    setAnchorEl(null)
  }

  const confirmPasswordhandleChange = (prop: keyof confirmPasswordState) => (event: ChangeEvent<HTMLInputElement>) => {
    setConfirmPasswordValue({ ...confirmPasswordValue, [prop]: event.target.value })
  }

  const handleClickShowConfirmPassword = () => {
    setConfirmPasswordValue({ ...confirmPasswordValue, showConfirmPassword: !confirmPasswordValue.showConfirmPassword })
  }

  const newPasswordhandleChange = (prop: keyof newPasswordState) => (event: ChangeEvent<HTMLInputElement>) => {
    setNewPasswordValue({ ...newPasswordValue, [prop]: event.target.value })
  }

  const handleClickShowNewPassword = () => {
    setNewPasswordValue({ ...newPasswordValue, showNewPassword: !newPasswordValue.showNewPassword })
  }

  const styles = {
    px: 4,
    py: 1.75,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'text.primary',
    textDecoration: 'none',
    '& svg': {
      mr: 2.5,
      color: 'text.primary'
    }
  }
  const handleModel = () => {
    setOpen(!open);
    setNewPasswordValue({ newPassword: '', showNewPassword: false })
    setConfirmPasswordValue({ confirmPassword: '', showConfirmPassword: false })
  }

  const handleLogout = () => {
    logout()
    handleDropdownClose()
  }

  ////////////////// API //////////////////

  const changePasswordApi = async () => {

    const payload = {
      "old_password": currentPassword,
      "new_password": newPasswordValue.newPassword,
      "confirm_password": confirmPasswordValue.confirmPassword
    };

    try {
      const data = await CHANGE_PASSWORD(payload);
      if (data.code === 200 || data.code === "200") {
        toast.success(data.message);
        handleModel()
        setNewPasswordValue({ newPassword: '', showNewPassword: false })
        setConfirmPasswordValue({ confirmPassword: '', showConfirmPassword: false })
      } else {
        return toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
    }

    return false;
  }



  return (
    <Fragment>
      <Badge
        overlap='circular'
        onClick={handleDropdownOpen}
        sx={{ ml: 2, cursor: 'pointer' }}
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        <Avatar
          alt='John Doe'
          onClick={handleDropdownOpen}
          sx={{ width: 40, height: 40 }}
          src='/images/avatars/1.png'
        />
      </Badge>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        sx={{ '& .MuiMenu-paper': { width: 300, mt: 4.5 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'ltr' ? 'right' : 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: direction === 'ltr' ? 'right' : 'left' }}
      >
        <Box sx={{ py: 1.75, px: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              overlap='circular'
              badgeContent={<BadgeContentSpan />}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
            >
              <Avatar alt={userData.username} src='/images/avatars/1.png' sx={{ width: '2.5rem', height: '2.5rem' }} />
            </Badge>
            <Box sx={{ display: 'flex', ml: 2.5, alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography sx={{ fontWeight: 200 }}>{userData.user_type ? userData.username : userData.email}</Typography>
              <Typography variant='body2'>Admin</Typography>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ my: theme => `${theme.spacing(2)} !important` }} />
        {/* <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <Icon icon='tabler:user-check' />
            My Profile
          </Box>
        </MenuItemStyled>
        <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <Icon icon='tabler:mail' />
            Inbox
          </Box>
        </MenuItemStyled>
        <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <Icon icon='tabler:message-2' />
            Chat
          </Box>
        </MenuItemStyled>
        <Divider sx={{ my: theme => `${theme.spacing(2)} !important` }} />
        <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <Icon icon='tabler:settings' />
            Settings
          </Box>
        </MenuItemStyled>
        <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <Icon icon='tabler:currency-dollar' />
            Pricing
          </Box>
        </MenuItemStyled> */}
        <MenuItemStyled sx={{ p: 0 }} onClick={() => handleModel()}>
          <Box sx={styles}>
            <Icon icon='mdi:password-outline' />
            Change Password
          </Box>
        </MenuItemStyled>
        {/* <Divider sx={{ my: theme => `${theme.spacing(2)} !important` }} /> */}
        <MenuItemStyled onClick={handleLogout} sx={{ py: 2, '& svg': { mr: 2, fontSize: '1.375rem' } }}>
          <Icon icon='tabler:logout' />
          Logout
        </MenuItemStyled>
      </Menu>
      <Fragment>
        <Dialog open={open} onClose={handleModel} aria-labelledby='form-dialog-title'>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <TextField
              sx={{ mt: 5 }}
              fullWidth
              type='text'
              label='Current Password'
              id='form-props-password-input'
              autoComplete='new-password'
              onChange={(e: any) => setCurrentPassword(e.target.value)}
            />
            <TextField
              sx={{ mt: 5 }}
              fullWidth
              label='New Password'
              value={newPasswordValue.newPassword}
              id='icons-adornment-password'
              onChange={newPasswordhandleChange('newPassword')}
              type={newPasswordValue.showNewPassword ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      onClick={handleClickShowNewPassword}
                      onMouseDown={e => e.preventDefault()}
                      aria-label='toggle password visibility'
                    >
                      <Icon fontSize='1.25rem' icon={newPasswordValue.showNewPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              sx={{ mt: 5 }}
              fullWidth
              label='Confirm New Password'
              value={confirmPasswordValue.confirmPassword}
              id='icons-adornment-password'
              onChange={confirmPasswordhandleChange('confirmPassword')}
              type={confirmPasswordValue.showConfirmPassword ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      onClick={handleClickShowConfirmPassword}
                      onMouseDown={e => e.preventDefault()}
                      aria-label='toggle password visibility'
                    >
                      <Icon fontSize='1.25rem' icon={confirmPasswordValue.showConfirmPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

          </DialogContent>
          <DialogActions className='dialog-actions-dense'>
            <Button sx={{ mb: 5 }} variant='contained' onClick={changePasswordApi}>Save</Button>
            <Button sx={{ mr: 4, mb: 5 }} variant='outlined' color='secondary' onClick={handleModel}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    </Fragment>
  )
}

export default UserDropdown
