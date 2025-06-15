// ** MUI Imports
import { CardContent, Divider, CardHeader, Grid, Card, Drawer, Typography, IconButton, Button, FormControl, TextField, FormHelperText } from '@mui/material'
import { useEffect, useState } from 'react'
import TCCTableHeader from 'src/customComponents/data-table/header'
import TccDataTable from 'src/customComponents/data-table/table'
import Box, { BoxProps } from '@mui/material/Box'
import TccEditor from 'src/customComponents/Form-Elements/editor'
import DrawerHeader from 'src/customComponents/components/drawer-header'
import { toast } from 'react-hot-toast'
import { appErrors, SEARCH_DELAY_TIME, FIELD_REQUIRED } from 'src/AppConstants'
import { createPagination } from 'src/utils/sharedFunction'
import { ICommonPagination } from 'src/data/interface'
import { ADD_COLOR, DELETE_COLOR, EDIT_COLOR, GET_ALL_COLOR, STATUS_UPDATE_COLOR } from 'src/services/AdminServices'
import DeleteDataModel from 'src/customComponents/delete-model'
import { Controller, useForm } from 'react-hook-form'

const Color = () => {

  let timer: any;
  const [searchFilter, setSearchFilter] = useState('')
  const [showModel, setShowModel] = useState(false)
  const [drawerAction, setDrawerAction] = useState(false);
  const [editorDrawerAction, setEditorDrawerAction] = useState(false);
  const [colorValue, setColorValue] = useState("");
  const [colorName, setColorName] = useState("");
  const [colorSlug, setColorSlug] = useState("");
  const [colorId, setColorId] = useState("")
  const [dialogTitle, setDialogTitle] = useState<'Add' | 'Edit'>('Add')
  const [colorData, setColorData] = useState([]);
  const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" });
  const [editerData, setEditerData] = useState("")
  const [edit, setEdit] = useState<String>('<p></p>')
  const [called, setCalled] = useState(true)
  const toggleAddColorDrawer = () => setDrawerAction(!drawerAction);

  const toggleEditorDrawer = () => setEditorDrawerAction(!editorDrawerAction)

  const defaultValues = {
    colorValue: colorValue,
    colorName: colorName,
    colorSlug: colorSlug,
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

  const clearFormData = () => {
    reset()
  }

  const editOnClickHandler = (data: any) => {
    setValue("colorValue", data.value)
    setValue("colorName", data.name)
    setValue("colorSlug", data.slug)
    setColorId(data.id)
    setDialogTitle('Edit')
    toggleAddColorDrawer()
  }
  const deleteOnclickHandler = (data: any) => {
    setColorId(data.id)
    setShowModel(!showModel)
  }

  /////////////////// GET API ///////////////////
  const getAllColorDataApi = async (mbPagination: ICommonPagination) => {
    try {
      const data = await GET_ALL_COLOR(mbPagination);
      if (data.code === 200 || data.code === "200") {

        setColorData(data.data.result);
        setPagination(data.data.pagination)

      } else {
        return toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }

  useEffect(() => {
    getAllColorDataApi(pagination);
  }, []);

  const handleChangePerPageRows = (perPageRows: number) => {
    getAllColorDataApi({ ...pagination, per_page_rows: perPageRows, current_page: 1 })
  }

  const handleOnPageChange = (page: number) => {
    getAllColorDataApi({ ...pagination, current_page: page + 1 })
  }

  const handleChangeSortBy = (orderSort: any) => {
    getAllColorDataApi({ ...pagination, sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field), order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort) })
  }
  const searchBusinessUser = async () => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      getAllColorDataApi({ ...pagination, current_page: 1, search_text: searchFilter });
    }, SEARCH_DELAY_TIME);
  }

  useEffect(() => {
    searchBusinessUser();
  }, [searchFilter]);

  /////////////////// ADD API ///////////////////

  const addColorApi = async (data: any) => {
    const payload = {
      "value": data.colorValue,
      "name": data.colorName,
      "slug": data.colorSlug,
    }
    try {
      const data = await ADD_COLOR(payload)
      if (data.code === 200 || data.code === "200") {

        toggleAddColorDrawer();
        clearFormData();
        toast.success(data.message)
        getAllColorDataApi(pagination)

      } else {
        return toast.error(data.message)
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN, {
        position: "top-center"
      })
    }

    return false
  }

  /////////////////// EDIT API /////////////////// 

  const editColorDataApi = async (data: any) => {

    const payload = {
      "id": colorId,
      "value": data.colorValue,
      "slug": data.colorSlug,
      "name": data.colorName,
    }
    try {
      const data = await EDIT_COLOR(payload)
      if (data.code === 200 || data.code === "200") {

        toggleAddColorDrawer();
        clearFormData();
        toast.success(data.message)
        getAllColorDataApi(pagination)
      } else {
        return toast.error(data.message)
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN, {
        position: "top-center"
      })
    }

    return false

  }

  /////////////////// DELETE API /////////////////// 

  const deleteColorDataApi = async () => {

    const payload = {
      "id": colorId
    }

    try {
      const data = await DELETE_COLOR(payload);
      if (data.code === 200 || data.code === "200") {
        toast.success(data.message);
        setShowModel(!showModel)
        getAllColorDataApi(pagination)
      } else {
        return toast.error(data.message)
      }
    } catch (error) {

    }
  }

  /////////////////// STATUS API /////////////////// 

  const activeStatusDataApi = async (checked: boolean, row: any) => {
    const payload = {
      "id": row.id,
      "is_active": checked ? '1' : '0',
    }
    try {
      const datas = await STATUS_UPDATE_COLOR(payload)

      if (datas.code === 200 || datas.code === "200") {
        toast.success("Successfully updated")
        getAllColorDataApi(pagination)

        return true
      } else {
        return toast.error(datas.message)
      }
    } catch (error) {

      return toast.error(appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }

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
      value: 'value',
      headerName: 'value',
      field: 'value',
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
      deletedOnClick: deleteOnclickHandler
    },
  ]

  const onsubmit = (data: any) => {
    if (dialogTitle === 'Add') {
      addColorApi(data)
    } else {
      editColorDataApi(data)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Color'></CardHeader>
          <Divider />
          <Box>
            <TCCTableHeader isButton value={searchFilter}
              onChange={(e: any) => setSearchFilter(e.target.value)}
              toggle={() => {
                setDialogTitle('Add')
                toggleAddColorDrawer()
                clearFormData()
              }}
              ButtonName='Add Color'
              infoButton
              infotoggle={toggleEditorDrawer}
            />

          </Box>
          <TccDataTable
            column={column}
            rows={colorData}
            handleSortChanges={handleChangeSortBy}
            pageSize={parseInt(pagination.per_page_rows.toString())}
            onChangepage={handleChangePerPageRows}
            rowCount={pagination.total_items}
            page={pagination.current_page - 1}
            onPageChange={handleOnPageChange}
            iconTitle='Color'
          />
        </Card>
      </Grid>
      <Drawer
        open={drawerAction}
        anchor='right'
        variant='temporary'
        onClose={toggleAddColorDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
      >

        <DrawerHeader
          title={`${dialogTitle} Color`}
          onClick={() => {
            toggleAddColorDrawer()
            clearFormData()
          }}
          tabBar
        />
        <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
          <form onSubmit={handleSubmit(onsubmit)}>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <Controller
                name='colorName'
                control={control}
                rules={{ required: true }}
                render={({ field }: any) => (
                  <TextField
                    autoFocus
                    size='small'
                    value={colorName}
                    label='Color Name'
                    onChange={(e) => setColorName(e.target.value)}
                    error={Boolean(errors.colorName)}
                    {...field}
                  />
                )}
              />
              {errors.colorName && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <Controller
                name='colorValue'
                control={control}
                rules={{ required: true }}
                render={({ field }: any) => (
                  <TextField
                    autoFocus
                    size='small'
                    label='Color value'
                    value={colorValue}
                    onChange={(e) => setColorValue(e.target.value)}
                    error={Boolean(errors.colorValue)}
                    {...field}
                  />
                )}
              />
              {errors.colorValue && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <Controller
                name='colorSlug'
                control={control}
                rules={{ required: true }}
                render={({ field }: any) => (
                  <TextField
                    autoFocus
                    size='small'
                    label='Color Slug'
                    value={colorSlug}
                    onChange={(e) => setColorSlug(e.target.value)}
                    error={Boolean(errors.colorSlug)}
                    {...field}
                  />
                )}
              />
              {errors.colorSlug && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
            </FormControl>

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
              <Button variant='contained' sx={{ mr: 3 }} type="submit">
                {dialogTitle === 'Add' ? "SUBMIT" : "EDIT"}
              </Button>
              <Button variant='outlined' color='secondary' onClick={() => {
                toggleAddColorDrawer()
                clearFormData()
              }}>
                Cancel
              </Button>
            </Box>
          </form>
        </Box>
      </Drawer>

      <Drawer
        open={editorDrawerAction}
        anchor='right'
        variant='temporary'
        onClose={toggleEditorDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 800, sm: 800 } } }}
      >

        <DrawerHeader
          title='Add Color Info'
          onClick={toggleEditorDrawer}
        />


        <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
          <form>

            <TccEditor getHtmlData={setEditerData} data={edit} called={called} />

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
              <Button variant='contained' sx={{ mr: 3 }}>
                Submit
              </Button>
              <Button variant='outlined' color='secondary' onClick={toggleEditorDrawer}>
                Cancel
              </Button>
            </Box>
          </form>
        </Box>
      </Drawer>
      <DeleteDataModel showModel={showModel} toggle={(show: any) => setShowModel(show)} onClick={deleteColorDataApi} />

    </Grid>
  )
}


export default Color