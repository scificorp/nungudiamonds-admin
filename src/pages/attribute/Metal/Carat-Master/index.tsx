// ** MUI Imports

// ** MUI Imports
import { Icon } from '@iconify/react'
import { CardContent, Divider, CardHeader, Grid, Card, Drawer, Typography, IconButton, Button, FormControl, TextField, FormHelperText, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material'
import { useEffect, useState } from 'react'
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
import { GOLD_KT_ADD, GOLD_KT_DELETE, GOLD_KT_EDIT, GOLD_KT_GET_ALL, GOLD_KT_MASTER, GOLD_KT_STATUS } from 'src/services/AdminServices'
import { toast } from 'react-hot-toast'
import { appErrors, FIELD_REQUIRED, SEARCH_DELAY_TIME } from 'src/AppConstants'
import DeleteDataModel from 'src/customComponents/delete-model'
import { createPagination } from 'src/utils/sharedFunction'
import { ICommonPagination } from 'src/data/interface'
import { Controller, useForm } from 'react-hook-form'
import TccSelect from 'src/customComponents/Form-Elements/select'

const GoldKT = () => {

  let timer: any;
  const [searchFilter, setSearchFilter] = useState()
  const [drawerAction, setDrawerAction] = useState(false)
  const [editorDrawerAction, setEditorDrawerAction] = useState(false)
  const [goldKTName, setGoldKTName] = useState('')
  const [goldKTSlug, setGoldKTSlug] = useState('')
  const [categoryvalue, setCategoryValue] = useState<string>('')
  const [options, setOptions] = useState([])
  const [imageFile, setImageFile] = useState<string>()
  const [imageShow, setImageShow] = useState("")
  const [removeimage, setRemoveImage] = useState("0")
  const [goldKTpagination, setGoldKTPagination] = useState({ ...createPagination(), search_text: "" })
  const [goldKTresult, setGoldKTResult] = useState([])
  const [goldKTId, setGoldKTId] = useState('');
  const [dialogTitle, setDialogTitle] = useState<'Add' | 'Edit'>('Add')
  const [editerData, setEditerData] = useState("")
  const [edit, setEdit] = useState<String>('<p></p>')
  const [called, setCalled] = useState(true)
  const [showModel, setShowModel] = useState(false);

  const defaultValues = {
    goldKTName: goldKTName,
    goldKTSlug: goldKTSlug
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

  const handleChange = (event: SelectChangeEvent) => {
    setCategoryValue(event.target.value as string)
  }
  const toggleAddGoldKTDrawer = () => {
    if (drawerAction == false) {
      setRemoveImage("1")
    } else {
      setRemoveImage("0")
    }
    setDrawerAction(!drawerAction)
  }

  const toggleEditorDrawer = () => setEditorDrawerAction(!editorDrawerAction)

  const editOnClickHandler = async (data: any) => {
    setValue("goldKTName", data.name);
    setValue("goldKTSlug", data.slug);
    setDialogTitle('Edit');
    setImageShow(data.image_path);
    setCategoryValue(data.id_metal);
    toggleAddGoldKTDrawer();
    setGoldKTId(data.id);
  }

  const deleteOnClickHandler = async (data: any) => {
    setGoldKTId(data.id)
    setShowModel(!showModel)
  }

  const clearFormDataHandler = () => {
    reset()
    setCategoryValue('')
    setImageShow("")
  }


  /////////////////// ADD API ///////////////////////

  const addApi = async (data: any) => {
    if (!imageFile) {
      toast.error("image is required", {
        position: "top-left"
      });
    } else {
      const formData = new FormData()
      formData.append("name", data.goldKTName)
      formData.append("slug", data.goldKTSlug)
      formData.append("image", imageFile || "")
      formData.append("metal_master_id", categoryvalue)

      try {
        const data = await GOLD_KT_ADD(formData);

        if (data.code === 200 || data.code === "200") {
          toggleAddGoldKTDrawer();
          toast.success(data.message);
          getAllApi(goldKTpagination);
          clearFormDataHandler();
        } else {
          return toast.error(data.message);
        }
      } catch (e: any) {
        toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN, {
          position: "top-center"
        });
      }
    }
    return false;
  }

  //////////////////////// GET API ///////////////////////

  const getAllApi = async (mbPagination: ICommonPagination) => {
    try {
      const data = await GOLD_KT_GET_ALL(mbPagination);

      if (data.code === 200 || data.code === "200") {
        setGoldKTPagination(data.data.pagination)
        setGoldKTResult(data.data.result)
      } else {
        return toast.error(data.message);
      }

    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
    }

    return false;
  }
  useEffect(() => {
    getAllApi(goldKTpagination);
  }, []);

  const handleChangePerPageRows = (perPageRows: number) => {
    getAllApi({ ...goldKTpagination, per_page_rows: perPageRows, current_page: 1 })
  }

  const handleChangeSortBy = (orderSort: any) => {
    getAllApi({ ...goldKTpagination, sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field), order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort) })
  }

  const handleOnPageChange = (page: number) => {
    getAllApi({ ...goldKTpagination, current_page: page + 1 })
  }
  const searchBusinessUser = async () => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      getAllApi({ ...goldKTpagination, current_page: 1, search_text: searchFilter });
    }, SEARCH_DELAY_TIME);
  }

  useEffect(() => {
    searchBusinessUser();
  }, [searchFilter])

  /////////////////////// EDIT API ///////////////////////

  const editApi = async (data: any) => {
    const formData = new FormData()
    formData.append("id", goldKTId)
    formData.append("image", imageFile || "")
    formData.append("name", data.goldKTName)
    formData.append("slug", data.goldKTSlug)
    formData.append("metal_master_id", categoryvalue)
    try {
      const data = await GOLD_KT_EDIT(formData);

      if (data.code === 200 || data.code === "200") {
        toast.success(data.message);
        toggleAddGoldKTDrawer();
        clearFormDataHandler();
        getAllApi(goldKTpagination);
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

  ///////////////////// DELETE API ///////////////////////

  const toggleModel = (showdata: any) => {
    setShowModel(showdata)
  }

  const deleteApi = async () => {
    const payload = {
      "id": goldKTId,
    };
    try {
      const data = await GOLD_KT_DELETE(payload);

      if (data.code === 200 || data.code === "200") {
        toast.success(data.message);
        setShowModel(!showModel);
        getAllApi(goldKTpagination);
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
      const data = await GOLD_KT_STATUS(payload);

      if (data.code === 200 || data.code === "200") {
        toast.success(data.message);
        getAllApi(goldKTpagination)

      } else {
        return toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
    }

    return false;
  }

  //////////////////// MASTER API /////////////////////// 

  const masterApi = async () => {
    try {
      const data = await GOLD_KT_MASTER();
      setOptions(data.data)

      if (data.code === 200 || data.code === "200") {
        toast.success(data.message);
        clearFormDataHandler();
      } else {
        return toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
    }

    return false;
  }
  useEffect(() => {
    masterApi()
  }, []);

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
      value: 'name',
      headerName: 'Carat',
      field: 'name',
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
      SwitchonChange: statusApi

    },
    {
      flex: 1,
      headerName: 'Action',
      field: 'action',
      edit: "edit",
      editOnClick: editOnClickHandler,
      deleted: 'deleted',
      deletedOnClick: deleteOnClickHandler
    },
  ]

  const onsubmit = (data: any) => {
    if (dialogTitle === 'Add') {
      addApi(data)
    } else {
      editApi(data)
    }
  }


  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Carat Master'></CardHeader>
          <Divider />
          <Box>
            <TCCTableHeader isButton value={searchFilter}
              onChange={(e: any) => setSearchFilter(e.target.value)}
              toggle={() => {
                setDialogTitle('Add')
                toggleAddGoldKTDrawer()
                clearFormDataHandler()
              }}
              ButtonName='Add Carat'
              infoButton
              infotoggle={toggleEditorDrawer}
            />

          </Box>
          <TccDataTable
            column={column}
            rows={goldKTresult}
            handleSortChanges={handleChangeSortBy}
            pageSize={parseInt(goldKTpagination.per_page_rows.toString())}
            onChangepage={handleChangePerPageRows}
            rowCount={goldKTpagination.total_items}
            page={goldKTpagination.current_page - 1}
            onPageChange={handleOnPageChange}
            iconTitle='Carat'
          />
        </Card>
      </Grid>
      <Drawer
        open={drawerAction}
        anchor='right'
        variant='temporary'
        onClose={toggleAddGoldKTDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
      >
        <DrawerHeader
          title={`${dialogTitle} Carat`}
          onClick={() => {
            clearFormDataHandler()
            toggleAddGoldKTDrawer()
          }}
          tabBar
        />

        <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
          <form onSubmit={handleSubmit(onsubmit)}>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <Controller
                name='goldKTName'
                control={control}
                rules={{ required: true }}
                render={({ field }: any) => (
                  <TextField
                    autoFocus
                    size='small'
                    value={goldKTName}
                    label='Karat'
                    onChange={(e) => setGoldKTName(e.target.value)}
                    error={Boolean(errors.goldKTName)}
                    {...field}
                  />
                )}
              />
              {errors.goldKTName && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <Controller
                name='goldKTSlug'
                control={control}
                rules={{ required: true }}
                render={({ field }: any) => (
                  <TextField
                    autoFocus
                    size='small'
                    label='Slug'
                    value={goldKTSlug}
                    onChange={(e) => setGoldKTSlug(e.target.value)}
                    error={Boolean(errors.goldKTSlug)}
                    {...field}
                  />
                )}
              />
              {errors.goldKTSlug && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
            </FormControl>

            <TccSelect
              sx={{ mb: 4 }}
              fullWidth
              inputLabel="Select Metal"
              label='Select Metal'
              value={categoryvalue}
              id='controlled-select'
              onChange={handleChange}
              title='name'
              Options={options}
            />
            <TccSingleFileUpload onDrop={setImageFile} onClick={removeimage} imageFile={imageShow} />
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
              <Button variant='contained' sx={{ mr: 3 }} type="submit">
                {dialogTitle === "Add" ? "SUBMIT" : "EDIT"}
              </Button>
              <Button variant='outlined' color='secondary' onClick={toggleAddGoldKTDrawer}>
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
          title='Add GoldKT Info'
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
      <DeleteDataModel showModel={showModel} toggle={toggleModel} onClick={deleteApi} />
    </Grid>
  )
}


export default GoldKT