// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import { Alert, Box, Button, CardContent, CardHeader, Chip, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material'
import { ChangeEvent, useState } from 'react'
import TccInput from 'src/customComponents/Form-Elements/inputField'

const PaymentManagement = () => {

  const [radioButtonPaypal, setRadioButtonPaypal] = useState('')
  const [radioButtonStripe, setRadioButtonStripe] = useState('')

  const [clientIDValue, setClientIdValue] = useState()
  const [secretValue, setSecretValue] = useState()
  const [publicKeyValue, setPublicKeyValue] = useState()
  const [apiKeyValue, setApiKeyValue] = useState()


  const handleRadioChangePaypal = (event: ChangeEvent<HTMLInputElement>) => {

    setRadioButtonPaypal((event.target as HTMLInputElement).value)
  }
  const handleRadioChangeStripe = (event: ChangeEvent<HTMLInputElement>) => {

    setRadioButtonStripe((event.target as HTMLInputElement).value)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Payment Management'
            subtitle='Checkout currently records Yoco transactions through the API. The PayPal and Stripe forms below are legacy placeholders and are not wired as active checkout configuration.'
          />
          <CardContent sx={{ pt: 0 }}>
            <Alert severity='info'>
              Yoco is implemented in the backend payment flow using the server-side payment secret. Manage live Yoco keys in the API environment until a secure admin settings endpoint is added.
            </Alert>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box>
                <Typography variant='h6'>Yoco</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Active checkout integration. Payments post to Yoco from the API and save order transaction records.
                </Typography>
              </Box>
              <Chip color='success' label='Backend configured' />
            </Box>
            <Alert severity='warning'>
              Do not collect or store Yoco secret keys in this browser-only form. Add a secured API settings endpoint before making Yoco editable from the admin portal.
            </Alert>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6} lg={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Alert severity='warning' sx={{ mb: 4 }}>
                Legacy placeholder only. This form does not currently persist PayPal settings or change checkout behavior.
              </Alert>
              <Typography variant='h6' color='black' sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>Paypal</Typography>
              <form>
                <Typography sx={{ mb: 4 }}>Paypal Payment</Typography>
                <RadioGroup value={radioButtonPaypal} name='simple-radio' onChange={handleRadioChangePaypal} aria-label='simple-radio'>
                  <FormControlLabel value='checked' control={<Radio />} label='Active' />
                  <FormControlLabel value='unchecked' control={<Radio />} label='InActive' />
                </RadioGroup>
                <TccInput
                  sx={{ mt: 4, mb: 6 }}
                  label='Paypal ClientID'
                  fullWidth
                  value={clientIDValue}
                  onChange={(e: any) => setClientIdValue(e.target.value)}
                />
                <TccInput
                  label='Paypal Secret'
                  fullWidth
                  value={apiKeyValue}
                  onChange={(e: any) => setApiKeyValue(e.target.value)}
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
              <Alert severity='warning' sx={{ mb: 4 }}>
                Legacy placeholder only. This form does not currently persist Stripe settings or change checkout behavior.
              </Alert>
              <Typography variant='h6' color='black' sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>Stripe</Typography>
              <form>
                <Typography sx={{ mb: 4 }}>Stripe </Typography>
                <RadioGroup value={radioButtonStripe} name='simple-radio' onChange={handleRadioChangeStripe} aria-label='simple-radio'>
                  <FormControlLabel value='checked' control={<Radio />} label='Active' />
                  <FormControlLabel value='unchecked' control={<Radio />} label='InActive' />
                </RadioGroup>
                <TccInput
                  sx={{ mt: 4, mb: 6 }}
                  label='Publish key'
                  fullWidth
                  value={publicKeyValue}
                  onChange={(e: any) => setPublicKeyValue(e.target.value)}
                />
                <TccInput
                  label='API key'
                  fullWidth
                  value={secretValue}
                  onChange={(e: any) => setSecretValue(e.target.value)}
                />

                <Button variant='contained' sx={{ mr: 3, mt: 5 }}>
                  Submit
                </Button>
              </form>

            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default PaymentManagement
