// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardHeader from '@mui/material/CardHeader'
import { Button, CardContent, Typography } from '@mui/material'
import TccInput from 'src/customComponents/Form-Elements/inputField'
import { useState } from 'react'

const InstagramID = () => {

  const [instagramId, setInstagramId] = useState()
  const [instagramKey, setInstagramKey] = useState()

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Instagram ID'></CardHeader>
        </Card>
      </Grid>
      <Grid item xs={12} md={6} lg={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant='h6' color='black' sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>Instagram ID</Typography>
              <form>
                <Typography>Instagram ID</Typography>

                <TccInput
                  sx={{ mt: 10, mb: 2 }}
                  label='Instagram Id'
                  fullWidth
                  value={instagramId}
                  onChange={(e: any) => setInstagramId(e.target.value)}
                />
                <TccInput
                  sx={{ mt: 4, mb: 2 }}
                  label='key'
                  fullWidth
                  value={instagramKey}
                  onChange={(e: any) => setInstagramKey(e.target.value)}
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

export default InstagramID