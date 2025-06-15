import { Icon } from '@iconify/react'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import { IconButton, Tab, Typography } from '@mui/material'
import Box, { BoxProps } from '@mui/material/Box'
import { styled } from '@mui/material/styles'

const Header = styled(Box)<BoxProps>(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(6),
    justifyContent: 'space-between'
}))

const DrawerHeader = ({ onClick, title, tabBar }: any) => {


    return (
        <>
            <Header>
                <Typography variant='h6'>{title}</Typography>
                <IconButton
                    size='small'
                    onClick={onClick}
                    sx={{ borderRadius: 1, color: 'text.primary', backgroundColor: 'action.selected' }}
                >
                    <Icon icon='tabler:x' fontSize='1.125rem' />
                </IconButton>
            </Header>
            {tabBar && <Box sx={{ mb: 4 }}>
                <TabContext value='1'>

                    <TabList variant='fullWidth' aria-label='full width tabs example'>
                        <Tab value='1' label='English' />

                    </TabList>
                </TabContext>
            </Box>}
        </>
    )
}

export default DrawerHeader