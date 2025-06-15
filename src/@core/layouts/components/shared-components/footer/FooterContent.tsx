// ** MUI Imports
import Box from '@mui/material/Box'
import MuiLink from '@mui/material/Link'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

const FooterContent = () => {
  // ** Var
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography sx={{ mr: 2 }}>
        COPYRIGHT © {new Date().getFullYear()}{" "}
        {/* <Box component='span' sx={{ color: 'error.main' }}>
          ❤️
        </Box>
        {` by `} */}
        <MuiLink target='_blank' href='https://www.tcctechno.com/'>
          TCC Technologies
        </MuiLink>
        <span className="d-none d-sm-inline-block">, All rights Reserved</span>
      </Typography>
    </Box>
  )
}

export default FooterContent
