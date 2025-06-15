// ** MUI Imports
import { Button, Card, CardContent, Checkbox, Box, FormControl, FormControlLabel, FormHelperText, Grid, Switch, TextField, Typography, SelectChangeEvent, Autocomplete } from "@mui/material"
import { alpha, styled } from '@mui/material/styles'
import MuiTreeView, { TreeViewProps } from '@mui/lab/TreeView'
import TreeItem from '@mui/lab/TreeItem'
import Icon from 'src/@core/components/icon'
import TccSelect from "src/customComponents/Form-Elements/select"
import { ChangeEvent, useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { appErrors, FIELD_REQUIRED } from "src/AppConstants"
import { toast } from "react-hot-toast"
import TccSingleFileUpload from "src/customComponents/Form-Elements/file-upload/singleFile-upload"
import { ADD_CATEGORY, ADD_PRODUCT_DROPDOWN_LIST, DELETE_CATEGORY, EDIT_CATEGORY, GET_ALL_CATEGORY, SEARCHABLE_CATEGORY, STATUS_UPDATE_CATEGORY } from "src/services/AdminServices"
import TccInput from "src/customComponents/Form-Elements/inputField"
import DeleteDataModel from "src/customComponents/delete-model"

const TreeView = styled(MuiTreeView)<TreeViewProps>(({ theme }) => ({
  Height: 264,

  '& .MuiTreeItem-iconContainer .close': {
    opacity: 0.3

  },
  '& .MuiTreeItem-group': {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: alpha(theme.palette.text.primary, 0.4)
  }
}))

const CategoryMaster = () => {

  const [parentCategoryList, setParentCategoryList] = useState([])
  const [parentCategoryId, setParentCategoryId] = useState<string>('')
  const [categoryName, setCategoryName] = useState("")
  const [categorySlug, setCategorySlug] = useState("")
  const [settingStyleChecked, setSettingStyleChecked] = useState<boolean>(false)
  const [sizeChecked, setSizeChecked] = useState<boolean>(false)
  const [lengthChecked, setLengthChecked] = useState<boolean>(false)
  const [checked, setChecked] = useState<boolean>(true)
  const [status, setStatus] = useState<boolean>(true)
  const [categoryList, setCategoryList] = useState([])
  const [imageFile, setImageFile] = useState<string>()
  const [dialogTitle, setDialogTitle] = useState<'Add' | 'Edit'>('Add');
  const [categoryId, setCategoryId] = useState("")
  const [showModel, setShowModel] = useState(false)
  const [removeimage, setRemoveImage] = useState("1")
  const [imageShow, setImageShow] = useState("")
  const [itemSize, setItemSize] = useState<{ id: null, size: "" }[]>([])
  const [itemLength, setItemLength] = useState<{ id: null, length: "" }[]>([])
  const [itemSizeList, setItemSizeList] = useState([])
  const [itemLengthList, setItemLengthList] = useState([])

  const handleChange = (event: SelectChangeEvent) => {
    setParentCategoryId(event.target.value as string)
  }
  const defaultValues = {
    categoryName,
    categorySlug
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

  const editOnClickHandler = async (data: any) => {
    setRemoveImage("1")
    setDialogTitle("Edit")
    setCategoryId(data.id)
    setImageShow(data.image_path)
    setValue("categoryName", data.category_name)
    setValue("categorySlug", data.slug)
    setParentCategoryId(data.parent_id)
    setSettingStyleChecked(data.is_setting_style == "1" ? true : false)
    setSizeChecked(data.is_size == "1" ? true : false)
    setLengthChecked(data.is_length == "1" ? true : false)
    const item_size = itemSizeList.filter((t: any) => {
      if (data.id_size.indexOf(parseInt(t.id)) >= 0) return t;
    })
    setItemSize(item_size)
    const item_length = itemLengthList.filter((t: any) => {
      if (data.id_length.indexOf(parseInt(t.id)) >= 0) return t;
    })
    setItemLength(item_length)
    setStatus(data.is_active == "1" ? true : false)
    setChecked(data.is_searchable == "1" ? true : false)
  }

  const deleteOnclickHandler = () => {
    setShowModel(!showModel)
  }

  const clearFormData = () => {
    setRemoveImage("0")
    setCategoryId("")
    setParentCategoryId('')
    setImageShow("")
    setDialogTitle("Add")
    setItemSize([{ id: null, size: "" }])
    setItemLength([{ id: null, length: "" }])
    setValue("categoryName", "")
    setValue("categorySlug", "")
    setSizeChecked(false)
    setLengthChecked(false)
    setSettingStyleChecked(false)
  }

  // **  DropdownData Api

  const getAllDropDownData = async () => {

    try {
      const data = await ADD_PRODUCT_DROPDOWN_LIST();
      if (data.code === 200 || data.code === "200") {
        setItemSizeList(data.data.item_size)
        setItemLengthList(data.data.item_length)
      }
      else {
        return toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
    return false;
  }
  useEffect(() => {
    getAllDropDownData()
  }, [])

  // ** List API 

  const getAllCategoryList = async () => {

    try {
      const data = await GET_ALL_CATEGORY();
      if (data.code === 200 || data.code === "200") {

        setCategoryList(data.data)
        const parentCategory = data.data.filter(((t: any) => t.is_active == "1"))
        setParentCategoryList(parentCategory)

      } else {

        return toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }

  // ** Add Categogy Api

  const addCategoryData = async (data: any) => {

    const formData = new FormData()
    formData.append("image", imageFile || "")
    formData.append("name", data.categoryName)
    formData.append("slug", data.categorySlug)
    formData.append("is_setting_style", settingStyleChecked ? '1' : '0')
    formData.append("is_size", sizeChecked ? '1' : '0')
    formData.append("is_length", lengthChecked ? '1' : '0')
    itemSize.map((value, index) => formData.append(`id_size[${index}]`, value.id || ""))
    itemLength.map((value, index) => formData.append(`id_length[${index}]`, value.id || ""))
    { parentCategoryId == '' ? '' : formData.append("parent_id", parentCategoryId) }

    try {
      const data = await ADD_CATEGORY(formData)
      if (data.code === 200 || data.code === "200") {
        clearFormData();
        toast.success(data.message)
        getAllCategoryList()

      } else {
        return toast.error(data.message)
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }

    return false
  }

  // ** edit Categogy Api

  const editCategoryData = async (data: any) => {
    const formData = new FormData()
    formData.append("image", imageFile || "")
    formData.append("id", categoryId)
    formData.append("name", data.categoryName)
    formData.append("slug", data.categorySlug)
    formData.append("is_setting_style", settingStyleChecked ? '1' : '0')
    formData.append("is_size", sizeChecked ? '1' : '0')
    formData.append("is_length", lengthChecked ? '1' : '0')
    itemSize.map((value, index) => formData.append(`id_size[${index}]`, value.id || ""))
    itemLength.map((value, index) => formData.append(`id_length[${index}]`, value.id || ""))
    { parentCategoryId == "" && formData.append("parent_id", parentCategoryId) }

    try {
      const data = await EDIT_CATEGORY(formData)
      if (data.code === 200 || data.code === "200") {
        toast.success(data.message)
        setDialogTitle("Add")
        getAllCategoryList()
        clearFormData()
      } else {
        return toast.error(data.message)
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }

    return false
  }

  // ** status update 

  const activeStatusDataApi = async (checked: boolean) => {
    const payload = {
      id: categoryId,
      is_active: checked == true ? '1' : '0'
    }

    try {
      const datas = await STATUS_UPDATE_CATEGORY(payload)

      if (datas.code === 200 || datas.code === "200") {
        toast.success("Successfully updated")
        getAllCategoryList()
        clearFormData()

        return true
      } else {

      }
    } catch (error: any) {

      return toast.error(error?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }

  // ** Searchable update 

  const searchableDataUpdate = async (checked: boolean) => {
    const payload = {
      id: categoryId,
      is_searchable: checked == true ? '1' : '0',
    }
    try {
      const datas = await SEARCHABLE_CATEGORY(payload)

      if (datas.code === 200 || datas.code === "200") {
        toast.success("Successfully updated")
        getAllCategoryList()
        clearFormData()

        return true
      } else {

        return toast.error(datas.message)
      }
    } catch (error: any) {

      return toast.error(error?.datas?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }

  // ** delete Data

  const deleteDataApi = async () => {

    const payload = {
      id: categoryId
    }
    try {
      const data = await DELETE_CATEGORY(payload);
      if (data.code === 200 || data.code === "200") {
        toast.success(data.message);
        setShowModel(!showModel)
        clearFormData()
        getAllCategoryList()
      } else {
        return toast.error(data.message)
      }
    } catch (error: any) {

      return toast.error(error?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)

    }
  }

  useEffect(() => {
    getAllCategoryList()
  }, [])

  const onsubmit = (data: any) => {
    if (dialogTitle === 'Add') {
      addCategoryData(data)
    } else {
      editCategoryData(data)
    }
  }

  return (
    <>
      <Grid container gridRow={1} spacing={6}>
        <Grid item xs={12} md={6} lg={6}>

          <Card>
            <CardContent>
              <TreeView
                defaultExpanded={['1']}
                sx={{ marginBottom: 10 }}
                defaultExpandIcon={<Icon icon='tabler:square-plus' />}
                defaultCollapseIcon={<Icon icon='tabler:square-minus' />}
                defaultEndIcon={<Icon icon='tabler:square-x' className='close' />}
              >
                {categoryList.filter(((t: any) => t.parent_id === null)).map((category: any, index) => (
                  <>
                    <TreeItem key={category.id} nodeId={category.id} label={category.category_name} sx={{ marginBottom: 2 }}
                      onClick={() => {
                        editOnClickHandler(category)
                      }}
                    >
                      {categoryList.filter(((t: any) => t.parent_id === category.id)).map((subcategory: any, index) => (

                        <TreeItem key={subcategory.id} nodeId={subcategory.id} label={subcategory.category_name}
                          onClick={() => {
                            editOnClickHandler(subcategory)
                          }}
                        >
                          {categoryList.filter(((t: any) => t.parent_id === subcategory.id)).map((subsubcategory: any, index) => (

                            <TreeItem key={subsubcategory.id} nodeId={subsubcategory.id} label={subsubcategory.category_name}
                              onClick={() => {
                                editOnClickHandler(subsubcategory)
                              }}
                            />
                          ))}

                        </ TreeItem>

                      ))}

                    </TreeItem>

                  </>

                ))}
              </TreeView>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' color='black' sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>{`${dialogTitle} Category`}</Typography>
              <form onSubmit={handleSubmit(onsubmit)}>
                {dialogTitle === 'Edit' && <TccInput
                  value={categoryId}
                  fullWidth
                  label="category Id"
                  disabled
                  sx={{ mb: 4 }}
                />}
                <TccSelect
                  sx={{ mb: 4 }}
                  fullWidth
                  inputLabel="Select parent category"
                  label='Select parent category'
                  value={parentCategoryId}
                  id='controlled-select'
                  onChange={handleChange}
                  title='category_name'
                  Options={parentCategoryList}
                />

                <FormControl fullWidth sx={{ mb: 4 }}>
                  <Controller
                    name='categoryName'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }: any) => (
                      <TextField
                        autoFocus
                        size='small'
                        value={categoryName}
                        label='Category Name'
                        onChange={(e) => setCategoryName(e.target.value)}
                        error={Boolean(errors.categoryName)}
                        {...field}
                      />
                    )}
                  />
                  {errors.categoryName && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                </FormControl>
                <FormControl fullWidth sx={{ mb: 4 }}>
                  <Controller
                    name='categorySlug'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }: any) => (
                      <TextField
                        autoFocus
                        size='small'
                        value={categorySlug}
                        label='Slug'
                        onChange={(e) => setCategorySlug(e.target.value)}
                        error={Boolean(errors.categorySlug)}
                        {...field}
                      />
                    )}
                  />
                  {errors.categorySlug && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                </FormControl>

                <TccSingleFileUpload onDrop={setImageFile} onClick={removeimage} imageFile={imageShow} />
                <FormControlLabel
                  label='Setting Style'
                  control={<Checkbox checked={settingStyleChecked} onChange={(event, check) => {
                    setSettingStyleChecked(check)
                  }} name='controlled' />}
                />
                <FormControlLabel
                  label='Size'
                  control={<Checkbox checked={sizeChecked} onChange={(event, check) => {
                    setSizeChecked(check)
                  }} name='controlled' />}
                />
                <FormControlLabel
                  label='Length'
                  control={<Checkbox checked={lengthChecked} onChange={(event, check) => {
                    setLengthChecked(check)
                  }} name='controlled' />}
                />
                {sizeChecked === true ? <Autocomplete
                  fullWidth
                  multiple
                  options={itemSizeList}
                  value={itemSize}
                  onChange={(event, newItem) => {
                    setItemSize(newItem)
                  }}
                  filterSelectedOptions
                  size='small'
                  id='autocomplete-multiple-outlined'
                  getOptionLabel={(option: any) => option.size}
                  renderInput={(params: any) => <TextField {...params} label='Select size' />}
                /> : <></>}
                {lengthChecked === true ? <Autocomplete
                  sx={{ mt: 4 }}
                  fullWidth
                  multiple
                  options={itemLengthList}
                  value={itemLength}
                  onChange={(event, newItem) => {
                    setItemLength(newItem)
                  }}
                  filterSelectedOptions
                  size='small'
                  id='autocomplete-multiple-outlined'
                  getOptionLabel={(option: any) => option.length}
                  renderInput={(params: any) => <TextField {...params} label='Select Length' />}
                /> : <></>}
                {dialogTitle === 'Edit' && <Box>
                  <FormControlLabel control={<Switch checked={status} onChange={(e, check) => {
                    setStatus(check)
                    activeStatusDataApi(check)
                  }} size="medium" color='success' />} label='Status' /> <br />
                  <FormControlLabel
                    label='Controlled'
                    control={<Checkbox checked={checked} onChange={(event, check) => {
                      setChecked(check)
                      searchableDataUpdate(check)
                    }} name='controlled' />}
                  /> <br />
                </Box>
                }
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
                  <Button variant='contained' sx={{ mr: 3, mt: 2 }} type="submit">
                    SAVE
                  </Button>
                  {dialogTitle === "Edit" && <>
                    <Button variant='contained' color="error" sx={{ mr: 3, mt: 2 }} type='button' onClick={deleteOnclickHandler}>
                      DELETE
                    </Button>

                  </>
                  }
                  <Button variant='contained' sx={{ mr: 3, mt: 2 }} type="submit" onClick={clearFormData}>
                    CANCEL
                  </Button>

                </Box>

              </form>
            </CardContent>
          </Card>
        </Grid>
        <DeleteDataModel showModel={showModel} toggle={(show: any) => setShowModel(show)} onClick={deleteDataApi} />

      </Grid>
    </>
  )
}

export default CategoryMaster