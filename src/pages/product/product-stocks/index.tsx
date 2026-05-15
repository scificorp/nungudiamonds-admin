// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const ProductStoks = () => {
    return (
        <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Inventory'></CardHeader>
            <CardContent>
              <Typography variant='body2' color='text.secondary'>
                This section is not wired to a live inventory queue yet. It is hidden from the main navigation until the stock model is ready.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
}

export default ProductStoks
