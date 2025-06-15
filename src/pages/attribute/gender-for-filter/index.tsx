// ** MUI Imports
import { Icon } from '@iconify/react'
import { CardContent, Divider, CardHeader, Grid, Card, Drawer, Typography, IconButton, Button } from '@mui/material'
import { useState } from 'react'
import TCCTableHeader from 'src/customComponents/data-table/header'
import TccDataTable from 'src/customComponents/data-table/table'
import TccInput from 'src/customComponents/Form-Elements/inputField'
import Box, { BoxProps } from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import TabList from '@mui/lab/TabList'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TccSingleFileUpload from 'src/customComponents/Form-Elements/file-upload/singleFile-upload'
import TccEditor from 'src/customComponents/Form-Elements/editor'
import DrawerHeader from 'src/customComponents/components/drawer-header'

const Data = [
  {
    id: 1,
    name: "male",
    slag: 'male',
    status: "active",
    imgs: "https://bit.ly/dan-abramov"
  },
  {
    id: 2,
    name: "female",
    slag: 'female',
    status: "unactive",
    imgs: "https://bit.ly/dan-abramov"
  }
]

const GenderForFilter = () => {

  const [SearchFilter, setSearchFilter] = useState()
  const [pageSize, setPageSize] = useState(10)
  const [drawerAction, setDrawerAction] = useState(false)
  const [editorDrawerAction, setEditorDrawerAction] = useState(false)
  const [genderName, setGenderName] = useState()
  const toggleAddGenderDrawer = () => setDrawerAction(!drawerAction)

  const column = [
    {
      flex: 1,
      value: 'name',
      headerName: 'name',
      field: 'name',
      text: 'text'
    },
    {
      flex: 1,
      value: 'slag',
      headerName: 'Gender',
      field: 'slag',
      text: 'text'
    },

    {
      flex: 1,
      headerName: 'Status',
      field: 'Status',
      chip: 'chip',
      value: 'status'

    },
    {
      flex: 1,
      headerName: 'status',
      field: 'status',
      switch: 'switch',
      value: 'status'

    },
    {
      flex: 1,
      headerName: 'Action',
      field: 'action',
      edit: "edit",
      deleted: 'deleted',
    },


  ]


  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Gender for filter'></CardHeader>
          <Divider />
          <Box>
            <TCCTableHeader isButton value={SearchFilter}
              onChange={(e: any) => setSearchFilter(e.target.value)}
              toggle={toggleAddGenderDrawer}
              ButtonName='Add Gender'
            />

          </Box>
          <TccDataTable
            column={column}
            rows={Data}
            pageSize={pageSize}
            onChangepage={(e: any) => setPageSize(e)}
            iconTitle='Gender'
          />
        </Card>
      </Grid>
      <Drawer
        open={drawerAction}
        anchor='right'
        variant='temporary'
        onClose={toggleAddGenderDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
      >
        <DrawerHeader
          title='Add Gender'
          onClick={toggleAddGenderDrawer}
          tabBar
        />

        <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
          <form>

            <TccInput label='Gender Name' fullWidth
              sx={{ mb: 4 }}
              value={genderName}
              onChange={(e: any) => setGenderName(e.target.value)} />

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
              <Button variant='contained' sx={{ mr: 3 }}>
                Submit
              </Button>
              <Button variant='outlined' color='secondary' onClick={toggleAddGenderDrawer}>
                Cancel
              </Button>
            </Box>
          </form>
        </Box>
      </Drawer>


    </Grid>
  )
}


export default GenderForFilter