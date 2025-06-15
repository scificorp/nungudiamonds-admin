// ** MUI Imports
import { Icon } from '@iconify/react'
import { CardContent, Divider, CardHeader, Grid, Card, Drawer, Typography, IconButton, Button, Box, FormControl, TextField, FormHelperText } from '@mui/material'
import { useEffect, useState } from 'react'
import TCCTableHeader from 'src/customComponents/data-table/header'
import TccDataTable from 'src/customComponents/data-table/table'
import TccInput from 'src/customComponents/Form-Elements/inputField'
import TccEditor from 'src/customComponents/Form-Elements/editor'
import DrawerHeader from 'src/customComponents/components/drawer-header'
import { ICommonPagination } from 'src/data/interface'
import { createPagination } from 'src/utils/sharedFunction'
import { toast } from 'react-hot-toast'
import { appErrors, FIELD_REQUIRED, SEARCH_DELAY_TIME } from 'src/AppConstants'
import { ADD_STATIC_PAGE, DELETE_STATIC_PAGE, EDIT_STATIC_PAGE, GET_ALL_STATIC_PAGE, STATUS_UPDATE_STATIC_PAGE } from 'src/services/AdminServices'
import DeleteDataModel from 'src/customComponents/delete-model'
import { Controller, useForm } from 'react-hook-form'

const StaticPageList = () => {

  let timer: any
  const [searchFilter, setSearchFilter] = useState()
  const [drawerAction, setDrawerAction] = useState(false)
  const [showModel, setShowModel] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [staticPageId, setStaticPageId] = useState("")
  const [editerData, setEditerData] = useState("")
  const [edit, setEdit] = useState<String>('<p></p>')
  const [staticPageData, setStaticPageData] = useState([])
  const [called, setCalled] = useState(true)
  const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" });

  const toggleAddStaticPageDrawer = () => {
    if (drawerAction == true) {
      setCalled(false)
    }
    if (drawerAction == false) {
      setCalled(true)
    }
    setDrawerAction(!drawerAction)
  }

  const defaultValues = {
    name: name,
    slug: slug
  }

  const {
    control,
    setValue,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues
  })

  const [dialogTitle, setDialogTitle] = useState<'Add' | 'Edit'>('Add')

  const clearFormData = () => {
    reset()
    setEdit('<p><p>')
  }
  const editOnClickHandler = (data: any) => {
    setValue("name", data.page_title)
    setValue("slug", data.slug)
    setEdit(data.content)
    setStaticPageId(data.id)
    setDialogTitle('Edit')
    toggleAddStaticPageDrawer()
  }

  const deleteOnClickHandler = (data: any) => {
    setStaticPageId(data.id)
    setShowModel(!showModel)
  }

  const getAllstaticDataApi = async (mbPagination: ICommonPagination) => {
    try {
      const data = await GET_ALL_STATIC_PAGE(mbPagination);
      if (data.code === 200 || data.code === "200") {

        setStaticPageData(data.data.result);
        setPagination(data.data.pagination)

      } else {
        return toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }

  useEffect(() => {

    getAllstaticDataApi(pagination);

  }, []);

  const handleChangePerPageRows = (perPageRows: number) => {
    getAllstaticDataApi({ ...pagination, per_page_rows: perPageRows, current_page: 1 })
  }

  const handleOnPageChange = (page: number) => {
    getAllstaticDataApi({ ...pagination, current_page: page + 1 })
  }

  const handleChangeSortBy = (orderSort: any) => {
    getAllstaticDataApi({ ...pagination, sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field), order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort) })
  }

  const searchBusinessUser = async () => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      getAllstaticDataApi({ ...pagination, current_page: 1, search_text: searchFilter });
    }, SEARCH_DELAY_TIME);
  }

  useEffect(() => {

    searchBusinessUser();

  }, [searchFilter]);

  const addStaticPageApi = async (data: any) => {
    const payload = {
      "name": data.name,
      "slug": data.slug,
      "content": editerData,
    }
    try {
      const data = await ADD_STATIC_PAGE(payload)
      if (data.code === 200 || data.code === "200") {

        toggleAddStaticPageDrawer();
        clearFormData();
        toast.success(data.message)
        getAllstaticDataApi(pagination)

      } else {
        toast.error(data.message)
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }

    return false
  }
  const editStaticPageDataApi = async (data: any) => {

    const payload = {
      "id": staticPageId,
      "name": data.name,
      "slug": data.slug,
      "content": editerData,
    }
    try {
      const data = await EDIT_STATIC_PAGE(payload)
      if (data.code === 200 || data.code === "200") {

        toggleAddStaticPageDrawer();
        clearFormData();
        toast.success(data.message)
        getAllstaticDataApi(pagination)
      } else {
        toast.error(data.message)
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }

    return false

  }


  const deleteStaticPageDataApi = async () => {

    const payload = {
      "id": staticPageId
    }

    try {
      const data = await DELETE_STATIC_PAGE(payload);
      if (data.code === 200 || data.code === "200") {
        toast.success(data.message);
        setShowModel(!showModel)
        getAllstaticDataApi(pagination)
      } else {
        toast.error(data.message)
      }
    } catch (error) {

    }
  }

  const activeStatusDataApi = async (checked: boolean, row: any) => {
    const payload = {
      "id": row.id,
      "is_active": checked ? '1' : '0',
    }
    try {
      const datas = await STATUS_UPDATE_STATIC_PAGE(payload)

      if (datas.code === 200 || datas.code === "200") {
        toast.success("Successfully updated")
        getAllstaticDataApi(pagination)

        return true
      } else {

      }
    } catch (error) {

      return toast.error(appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }
  const column = [
    {
      flex: 1,
      value: 'page_title',
      headerName: 'title',
      field: 'page_title',
      text: 'text'
    },
    {
      flex: 1,
      value: 'slug',
      headerName: 'slug',
      field: 'slug',
      text: 'text'
    },
    {
      flex: 1,
      headerName: 'Status',
      field: 'Status',
      chips: 'chips',
      value: 'is_active'

    },
    {
      flex: 1,
      headerName: 'status',
      field: 'is_active',
      switch: 'switch',
      value: 'is_active',
      SwitchonChange: activeStatusDataApi


    },
    {
      flex: 1,
      headerName: 'Action',
      field: 'action',
      edit: "edit",
      deleted: 'deleted',
      editOnClick: editOnClickHandler,
      deletedOnClick: deleteOnClickHandler,

    },
  ]

  const onSubmit = (data: any) => {
    if (dialogTitle === 'Add') {
      addStaticPageApi(data)
    } else {
      editStaticPageDataApi(data)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Static Page'></CardHeader>
          <Divider />
          <Box>
            <TCCTableHeader isButton value={searchFilter}
              onChange={(e: any) => setSearchFilter(e.target.value)}
              toggle={(e: any) => {
                e.preventDefault()
                clearFormData()
                toggleAddStaticPageDrawer()
                setDialogTitle('Add')
              }}
              ButtonName='Add Static Page'
            />

          </Box>
          <TccDataTable
            column={column}
            rows={staticPageData}
            handleSortChanges={handleChangeSortBy}
            pageSize={parseInt(pagination.per_page_rows.toString())}
            onChangepage={handleChangePerPageRows}
            rowCount={pagination.total_items}
            page={pagination.current_page - 1}
            onPageChange={handleOnPageChange}
            iconTitle='Page'
          />
        </Card>
      </Grid>
      <Drawer
        open={drawerAction}
        anchor='right'
        variant='temporary'
        onClose={toggleAddStaticPageDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 700, sm: 700 } } }}
      >
        <DrawerHeader
          title={`${dialogTitle} Static Page`}
          onClick={() => {
            toggleAddStaticPageDrawer()
            clearFormData()
          }}
        />

        <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <Controller
                name='name'
                control={control}
                rules={{ required: true }}
                render={({ field }: any) => (
                  <TextField
                    autoFocus
                    size='small'
                    label='Static Page Name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={Boolean(errors.name)}
                    {...field}
                  />
                )}
              />
              {errors.name && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <Controller
                name='slug'
                control={control}
                rules={{ required: true }}
                render={({ field }: any) => (
                  <TextField
                    autoFocus
                    size='small'
                    value={slug}
                    label='Static Page Slug'
                    onChange={(e) => setSlug(e.target.value)}
                    error={Boolean(errors.slug)}
                    {...field}
                  />
                )}
              />
              {errors.slug && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
            </FormControl>

            <TccEditor getHtmlData={setEditerData} data={edit} called={called} />

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
              <Button variant='contained' sx={{ mr: 3 }} type="submit">
                {dialogTitle === 'Add' ? "SUBMIT" : "EDIT"}
              </Button>

              <Button variant='outlined' color='secondary' onClick={() => {
                toggleAddStaticPageDrawer()
                clearFormData()
              }}>
                Cancel
              </Button>
            </Box>
          </form>
        </Box>
      </Drawer>
      <DeleteDataModel showModel={showModel} toggle={(show: any) => setShowModel(show)} onClick={deleteStaticPageDataApi} />

    </Grid>
  )
}

export default StaticPageList