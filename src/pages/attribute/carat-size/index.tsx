
// ** MUI Imports
import { Divider, CardHeader, Grid, Card, Drawer, Button, FormControl, TextField, FormHelperText, SelectChangeEvent, Autocomplete } from '@mui/material'
import React, { useEffect, useState } from 'react'
import TCCTableHeader from 'src/customComponents/data-table/header'
import TccDataTable from 'src/customComponents/data-table/table'
import TccInput from 'src/customComponents/Form-Elements/inputField'
import Box, { BoxProps } from '@mui/material/Box'
import TccEditor from 'src/customComponents/Form-Elements/editor'
import DrawerHeader from 'src/customComponents/components/drawer-header'
import { CARAT_SIZE_ADD, CARAT_SIZE_DELETE, CARAT_SIZE_EDIT, CARAT_SIZE_GET_ALL, CARAT_SIZE_STATUS } from 'src/services/AdminServices'
import { appErrors, FIELD_REQUIRED, SEARCH_DELAY_TIME } from 'src/AppConstants'
import { toast } from 'react-hot-toast'
import DeleteDataModel from 'src/customComponents/delete-model'
import { createPagination } from 'src/utils/sharedFunction'
import { ICommonPagination } from 'src/data/interface'
import { Controller, useForm } from 'react-hook-form'
import TccSelect from 'src/customComponents/Form-Elements/select'

const stone_type_List = [
  {
    id: 1,
    name: "Diamond"
  },
  {
    id: 2,
    name: "Gemstone"
  },
  {
    id: 3,
    name: "Both"
  }
]
import TccSingleFileUpload from 'src/customComponents/Form-Elements/file-upload/singleFile-upload'

const CaratSize = () => {

  let timer: any;
  const [searchFilter, setSearchFilter] = useState()
  const [drawerAction, setDrawerAction] = useState(false)
  const [editorDrawerAction, setEditorDrawerAction] = useState(false)
  const [caratSize, setCaratSize] = useState("")
  const [caratSlug, setCaratSlug] = useState("")
  const [caratId, setCaratid] = useState('');
  const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" })
  const [result, setResult] = useState([])
  const [dialogTitle, setDialogTitle] = useState<'Add' | 'Edit'>('Add')
  const [showModel, setShowModel] = useState(false);
  const [sortCode, setSortCode] = useState('')
  const [editerData, setEditerData] = useState("")
  const [edit, setEdit] = useState<String>('<p></p>')
  const [called, setCalled] = useState(true)
  const [queryOptions, setQueryOptions] = React.useState({});
  const [stoneTypeValue, setStoneTypeValue] = useState<string>('')
  const [dropDownList, setDropDownList] = useState({ diamondShapeList: [], shankList: [] })
  const [diamondShape, setDiamondShape] = useState<{ id: null, name: "" }[]>([])
  const [imageFile, setImageFile] = useState<string>()
  const [imageShow, setImageShow] = useState("")
  const [removeimage, setRemoveImage] = useState("0")

  console.log("dropDownList", dropDownList);
  console.log("diamondShape", diamondShape);


  const defaultValues = {
    caratSize: caratSize,
    caratSlug: caratSlug,
    sortCode: sortCode,
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

  const toggleAddCaratSizeDrawer = () => {
    if (drawerAction == false) {
      setRemoveImage("1")
    } else {
      setRemoveImage("0")
    }
    setDrawerAction(!drawerAction)
  }

  const toggleEditorDrawer = () => setEditorDrawerAction(!editorDrawerAction)

  const editOnClickHandler = async (data: any) => {
    setValue("caratSize", data.value)
    setValue("caratSlug", data.slug)
    setValue("sortCode", data.sort_code);
    setDialogTitle('Edit');
    setImageShow(data.image_path);
    toggleAddCaratSizeDrawer();
    setCaratid(data.id);
    setStoneTypeValue(data.is_diamond)

    let diamondShapeData: any = []
    let list: any
    for (list of dropDownList.diamondShapeList) {
      const data = { id: list.id, name: list.name }

      diamondShapeData.push(data)
    }

    const diamondFinal = diamondShapeData?.filter((t: any) => {
      if (data.is_diamond_shape.indexOf(parseInt(t.id)) >= 0) return t;
    })

    setDiamondShape(diamondFinal)
  }

  const deleteOnClickHandler = async (data: any) => {
    setCaratid(data.id)
    setShowModel(!showModel)
  }

  const clearFormDataHandler = () => {
    reset()
    setStoneTypeValue('')
    setImageShow("")
    setDiamondShape([{ id: null, name: "" }])
  }

  /////////////////////// ADD API ///////////////////////

  const caratsizeAddApi = async (data: any) => {

    const formData = new FormData()
    formData.append("image", imageFile || "")
    formData.append("value", data.caratSize)
    formData.append("slug", data.caratSlug)
    formData.append("is_diamond", stoneTypeValue && stoneTypeValue)
    diamondShape.map((value: any, index) => formData.append(`is_diamond_shape[${index}]`, value.id))

    try {
      const data = await CARAT_SIZE_ADD(formData);
      if (data.code === 200 || data.code === "200") {
        toggleAddCaratSizeDrawer();
        toast.success(data.message);
        clearFormDataHandler();
        caratgetallApi(pagination);
      } else {
        return toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN, {
        position: "top-center"
      });
    }

    return false;

  }

  /////////////////////// GET API ///////////////////////

  const caratgetallApi = async (mbPagination: ICommonPagination) => {
    try {
      const data = await CARAT_SIZE_GET_ALL(mbPagination);
      if (data.code === 200 || data.code === "200") {
        setPagination(data.data.pagination)
        setResult(data.data.result)

      } else {
        return toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
    }

    return false;
  }
  useEffect(() => {
    caratgetallApi(pagination);
  }, []);

  const handleChangePerPageRows = (perPageRows: number) => {
    caratgetallApi({ ...pagination, per_page_rows: perPageRows, current_page: 1 })
  }

  const handleChangeSortBy = (orderSort: any) => {
    caratgetallApi({ ...pagination, sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field), order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort) })
  }

  const handleOnPageChange = (page: number) => {
    caratgetallApi({ ...pagination, current_page: page + 1 })
  }
  const searchBusinessUser = async () => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      caratgetallApi({ ...pagination, current_page: 1, search_text: searchFilter });
    }, SEARCH_DELAY_TIME);
  }

  useEffect(() => {
    searchBusinessUser();
  }, [searchFilter]);

  /////////////////////// EDIT API ///////////////////////

  const caratSizeEditApi = async (data: any) => {

    const formData = new FormData()
    formData.append("id", caratId)
    formData.append("image", imageFile || "")
    formData.append("value", data.caratSize)
    formData.append("slug", data.caratSlug)
    formData.append("is_diamond", stoneTypeValue && stoneTypeValue)
    diamondShape.map((value: any, index) => formData.append(`is_diamond_shape[${index}]`, value.id))

    try {
      const data = await CARAT_SIZE_EDIT(formData);
      if (data.code === 200 || data.code === "200") {
        toast.success(data.message);
        toggleAddCaratSizeDrawer();
        caratgetallApi(pagination);
        clearFormDataHandler();
      } else {
        return toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN, {
        position: "top-center"
      });
    }

    return false;
  }

  /////////////////////// DELETE  API ///////////////////////

  const toggleModel = (showdata: any) => {
    setShowModel(showdata)
  }

  const caratSizeDeleteApi = async () => {
    const payload = {
      "id": caratId,
    };

    try {
      const data = await CARAT_SIZE_DELETE(payload);
      if (data.code === 200 || data.code === "200") {
        toast.success(data.message);
        setShowModel(!showModel);
        caratgetallApi(pagination);
      } else {
        return toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
    }

    return false;
  }

  //////////////////// STATUS API ///////////////////////

  const statusApi = async (checked: boolean, row: any) => {
    const payload = {
      "id": row.id,
      "is_active": checked ? '1' : '0',
    };
    try {
      const data = await CARAT_SIZE_STATUS(payload);
      if (data.code === 200 || data.code === "200") {
        toast.success(data.message);
        caratgetallApi(pagination)

      } else {
        return toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
    }

    return false;
  }
  const column = [
    {
      flex: 1,
      headerName: 'image',
      field: 'image_path',
      avatars: 'avatars',
      value: 'image_path'
    },
    {
      flex: 1,
      value: 'value',
      headerName: 'Value',
      field: 'value',
      text: 'text'
    },
    {
      flex: 1,
      value: 'slug',
      headerName: 'Slug',
      field: 'slug',
      text: 'text'
    },
    {
      flex: 1,
      value: 'sort_code',
      headerName: 'sort code',
      field: 'sort_code',
      text: 'text'
    },
    {
      flex: 1,
      headerName: 'Status',
      field: '',
      chips: 'chips',
      value: 'is_active'

    },
    {
      flex: 1,
      headerName: 'status',
      field: 'is_active',
      switch: 'switch',
      value: 'is_active',
      SwitchonChange: statusApi
    },
    {
      flex: 1,
      headerName: 'Action',
      field: 'action',
      edit: "edit",
      editOnClick: editOnClickHandler,
      deletedOnClick: deleteOnClickHandler,
      deleted: 'deleted',
    },
  ]

  const onSubmit = (data: any) => {
    if (dialogTitle === 'Add') {
      caratsizeAddApi(data)
    } else {
      caratSizeEditApi(data)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Carat Size'></CardHeader>
          <Divider />
          <Box>
            <TCCTableHeader isButton value={searchFilter}
              onChange={(e: any) => setSearchFilter(e.target.value)}
              toggle={() => {
                setDialogTitle('Add')
                toggleAddCaratSizeDrawer()
                clearFormDataHandler()
              }}
              ButtonName='Add Carat Size'
              infoButton
              infotoggle={toggleEditorDrawer}
            />

          </Box>
          <TccDataTable
            column={column}
            sortingMode="server"
            rows={result}
            pageSize={parseInt(pagination.per_page_rows.toString())}
            onChangepage={handleChangePerPageRows}
            rowCount={pagination.total_items}
            handleSortChanges={handleChangeSortBy}
            page={pagination.current_page - 1}
            onPageChange={handleOnPageChange}
            iconTitle='Carat Size'
          />
        </Card>
      </Grid>
      <Drawer
        open={drawerAction}
        anchor='right'
        variant='temporary'
        onClose={toggleAddCaratSizeDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
      >

        <DrawerHeader
          title={`${dialogTitle} Carat Size`}
          onClick={() => {
            clearFormDataHandler()
            toggleAddCaratSizeDrawer()
          }}
          tabBar
        />

        <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <Controller
                name='caratSize'
                control={control}
                rules={{ required: true }}
                render={({ field }: any) => (
                  <TextField
                    type="number"
                    autoFocus
                    size='small'
                    value={caratSize}
                    label='Value'
                    onChange={(e) => setCaratSize(e.target.value)}
                    error={Boolean(errors.caratSize)}
                    {...field}
                  />
                )}
              />
              {errors.caratSize && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <Controller
                name='caratSlug'
                control={control}
                rules={{ required: true }}
                render={({ field }: any) => (
                  <TextField
                    autoFocus
                    size='small'
                    label='Slug'
                    value={caratSlug}
                    onChange={(e) => setCaratSlug(e.target.value)}
                    error={Boolean(errors.caratSlug)}
                    {...field}
                  />
                )}
              />
              {errors.caratSlug && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
            </FormControl>
            {dialogTitle === 'Edit' ? <FormControl fullWidth sx={{ mb: 4 }}>
              <Controller
                name='sortCode'
                control={control}
                rules={{ required: true }}
                render={({ field }: any) => (
                  <TextField
                    disabled
                    autoFocus
                    size='small'
                    label='Sort Code'
                    value={sortCode}
                    onChange={(e) => setSortCode(e.target.value)}
                    error={Boolean(errors.sortCode)}
                    {...field}
                  />
                )}
              />
              {errors.sortCode && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
            </FormControl> : ""}
            {/* <TccSelect
              sx={{ mb: 4 }}
              fullWidth
              inputLabel="Stone Type"
              label='Stone Type'
              value={stoneTypeValue}
              id='controlled-select'
              onChange={(event: SelectChangeEvent) => setStoneTypeValue(event.target.value)}
              title='name'
              Options={stone_type_List}
            /> */}
            {/* <Autocomplete
              sx={{ mb: 4 }}
              fullWidth
              multiple
              options={dropDownList.diamondShapeList}
              value={diamondShape}
              onChange={(event, newItem) => {
                setDiamondShape(newItem)
              }}
              filterSelectedOptions
              size='small'
              id='autocomplete-multiple-outlined'
              getOptionLabel={(option: any) => option.name}
              renderInput={(params: any) => <TextField {...params} label='Diamond Shape' />}
            /> */}

            <TccSingleFileUpload onDrop={setImageFile} onClick={removeimage} imageFile={imageShow} />

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
              <Button variant='contained' sx={{ mr: 3 }} type='submit' >
                {dialogTitle === "Add" ? "SUBMIT" : "EDIT"}
              </Button>
              <Button variant='outlined' color='secondary' onClick={() => {
                toggleAddCaratSizeDrawer()
                clearFormDataHandler()
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
          title='Add Carat Size Info'
          onClick={toggleEditorDrawer}
        />

        <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
          <form>
            <TccEditor getHtmlData={setEditerData} data={edit} called={called} />
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
              {dialogTitle === 'Add' ? <Button variant='contained' sx={{ mr: 3 }}>
                Submit
              </Button> : <Button variant='contained' sx={{ mr: 3 }}>
                Edit
              </Button>}
              <Button variant='outlined' color='secondary' onClick={toggleEditorDrawer}>
                Cancel
              </Button>
            </Box>
          </form>
        </Box>
      </Drawer>
      <DeleteDataModel showModel={showModel} toggle={toggleModel} onClick={caratSizeDeleteApi} />
    </Grid>
  )
}

export default CaratSize