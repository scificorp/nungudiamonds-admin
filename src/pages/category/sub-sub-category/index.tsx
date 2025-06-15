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
import TCCAutoComplete from 'src/customComponents/Form-Elements/auto-complete'
import TccSelect from 'src/customComponents/Form-Elements/select'
import DrawerHeader from 'src/customComponents/components/drawer-header'

const Data = [
  {
    id: 1,
    name: "gold",
    main_Category: "Men",
    sub_Category: 'ring',
    Slug: "gold",
    status: "active",
    imgs: "https://bit.ly/dan-abramov"
  },
  {
    id: 2,
    name: "silver",
    Slug: "silver",
    main_Category: "women",
    sub_Category: 'ring',
    status: "unactive",
    imgs: "https://bit.ly/dan-abramov"
  },

]

const initialOptions = [

  { title: 'none', id: 1 },
  { title: 'men', id: 2 },
  { title: "women", id: 3 },

]

const SubToSubCategory = () => {

  const [SearchFilter, setSearchFilter] = useState()
  const [pageSize, setPageSize] = useState(10)
  const [drawerAction, setDrawerAction] = useState(false)
  const [currencyName, setCurrencyName] = useState()
  const toggleAddUserDrawer = () => setDrawerAction(!drawerAction)


  const deletedHandler = () => {
    // console.log('123');

  }

  const column = [
    {
      flex: 1,
      value: 'name',
      headerName: 'name',
      field: 'name',
      text: 'text1'
    },
    {
      flex: 1,
      value: 'Slug',
      headerName: 'Slug',
      field: 'Slug',
      text: 'text'
    },
    {
      flex: 1,
      value: 'main_Category',
      headerName: 'main Category',
      field: 'main_Category',
      text: 'text'
    },
    {
      flex: 1,
      value: 'sub_Category',
      headerName: 'sub Category',
      field: 'sub_Category',
      text: 'text'
    },
    {
      flex: 1,
      headerName: 'Image',
      field: 'img',
      avatars: 'avatars',
      value: 'imgs'
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
      headerName: 'Action',
      field: 'action',
      edit: "edit",
      deleted: 'deleted',
      deletedOnClick: deletedHandler,
      switch: 'switch',
      value: 'status'
    },


  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Sub Sub Category '></CardHeader>
          <Divider />
          <TCCTableHeader isButton value={SearchFilter}
            onChange={(e: any) => setSearchFilter(e.target.value)}
            toggle={toggleAddUserDrawer}
            ButtonName='Add New Sub sub Category'
          />
          <TccDataTable
            column={column}
            rows={Data}
            pageSize={pageSize}
            onChangepage={(e: any) => setPageSize(e)}
            iconTitle='Sub Sub Category'
          />
        </Card>
      </Grid>
      <Drawer
        open={drawerAction}
        anchor='right'
        variant='temporary'
        onClose={toggleAddUserDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
      >
        <DrawerHeader
          title='Add Sub Sub Category'
          onClick={toggleAddUserDrawer}
          tabBar
        />

        <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
          <form>
            <TccSelect
              inputLabel="Select Main Category"
              defaultValue=""
              label='Select Main Category'
              Options={initialOptions}
              fullWidth
              sx={{ mb: 4 }}
            />

            <TccSelect
              inputLabel="Select Sub Category"
              defaultValue=""
              label='Select Sub Category'
              Options={initialOptions}
              fullWidth
            />
            <TccInput label='Sub Sub category Name' fullWidth
              sx={{ mb: 4, mt: 4 }}
              value={currencyName}
              onChange={(e: any) => setCurrencyName(e.target.value)} />
            <TccSingleFileUpload />

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
              <Button variant='contained' sx={{ mr: 3 }}>
                Submit
              </Button>
              <Button variant='outlined' color='secondary' onClick={toggleAddUserDrawer}>
                Cancel
              </Button>
            </Box>
          </form>
        </Box>
      </Drawer>
    </Grid>
  )
}

export default SubToSubCategory