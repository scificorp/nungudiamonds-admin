// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardHeader from '@mui/material/CardHeader'
import { Button, CardContent, Typography } from '@mui/material'
import TccInput from 'src/customComponents/Form-Elements/inputField'
import { useState } from 'react'

const MailConfig = () => {

  const [subscription, setSubScription] = useState()
  const [mailServer, setMailServer] = useState()
  const [userName, setUserName] = useState()
  const [password, setPassword] = useState()

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Email Setup'></CardHeader>
        </Card>
      </Grid>
      <Grid item xs={12} md={6} lg={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant='h6' color='black' sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>Subscription Email</Typography>
              <form>
                <Typography>Subscription Email</Typography>
                <TccInput
                  sx={{ mt: 10, mb: 6 }}
                  label='Subscription Email'
                  fullWidth
                  value={subscription}
                  onChange={(e: any) => setSubScription(e.target.value)}
                />

                <Button variant='contained' sx={{ mr: 3, mt: 5 }}>
                  Submit
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid item xs={12} md={6} lg={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant='h6' color='black' sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>Mail Config</Typography>
              <form>
                <Typography>Mail Config</Typography>

                <TccInput
                  sx={{ mt: 10, mb: 2 }}
                  label='Mail Server'
                  fullWidth
                  value={mailServer}
                  onChange={(e: any) => setMailServer(e.target.value)}
                />
                <TccInput
                  sx={{ mt: 4, mb: 2 }}
                  label='UserName'
                  fullWidth
                  value={userName}
                  onChange={(e: any) => setUserName(e.target.value)}
                />
                <TccInput
                  sx={{ mt: 4, mb: 2 }}
                  label='Password'
                  fullWidth
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                />
                <Button variant='contained' sx={{ mr: 3, mt: 5 }}>
                  Submit
                </Button></form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default MailConfig