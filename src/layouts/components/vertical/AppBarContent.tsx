// ** MUI Imports
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'


// ** Type Import
import { Settings } from 'src/@core/context/settingsContext'

// ** Components
import ModeToggler from 'src/@core/layouts/components/shared-components/ModeToggler'
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'

interface Props {
  hidden: boolean
  settings: Settings
  toggleNavVisibility: () => void
  saveSettings: (values: Settings) => void
}

const AppBarContent = (props: Props) => {
  // ** Props
  const { hidden, settings, saveSettings, toggleNavVisibility } = props

  const handleMenuToggle = () => {
    if (hidden) {
      toggleNavVisibility()

      return
    }

    saveSettings({ ...settings, navCollapsed: !settings.navCollapsed })
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton color='inherit' sx={{ ml: -2.75 }} onClick={handleMenuToggle}>
          <Icon fontSize='1.5rem' icon={hidden || settings.navCollapsed ? 'tabler:menu-2' : 'tabler:layout-sidebar-left-collapse'} />
        </IconButton>

        {/* <ModeToggler settings={settings} saveSettings={saveSettings} /> */}
        <Icon icon='mi:notification' />
      </Box>
      <Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
        <UserDropdown settings={settings} />
      </Box>
    </Box>
  )
}

export default AppBarContent
