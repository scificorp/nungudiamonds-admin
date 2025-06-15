// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardHeader from '@mui/material/CardHeader'
import { Button, CardContent, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material'
import { ChangeEvent, useState } from 'react'
import TccRadioButton from 'src/customComponents/Form-Elements/radio'
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
          <CardHeader title='Payment Management'></CardHeader>
        </Card>
      </Grid>
      <Grid item xs={12} md={6} lg={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
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