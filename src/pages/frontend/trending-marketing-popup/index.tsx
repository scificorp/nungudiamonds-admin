// ** MUI Imports
import { CardContent, Divider, CardHeader, Grid, Card, Drawer, Typography, IconButton, Button, TextField, } from '@mui/material'
import { forwardRef, useEffect, useState } from 'react'
import TCCTableHeader from 'src/customComponents/data-table/header'
import TccDataTable from 'src/customComponents/data-table/table'
import TccInput from 'src/customComponents/Form-Elements/inputField'
import Box, { BoxProps } from '@mui/material/Box'
import DrawerHeader from 'src/customComponents/components/drawer-header'
import TccSingleFileUpload from 'src/customComponents/Form-Elements/file-upload/singleFile-upload'
import { createPagination } from 'src/utils/sharedFunction'
import { ADD_MARKETING_POPUP, DELETE_MARKETING_POPUP, EDIT_MARKETING_POPUP, GET_ALL_MARKETING_POPUP, STATUS_MARKETING_POPUP } from 'src/services/AdminServices'
import { toast } from 'react-hot-toast'
import { appErrors, SEARCH_DELAY_TIME } from 'src/AppConstants'
import format from 'date-fns/format'

// ** Third Party Imports

import addDays from 'date-fns/addDays'
import { ICommonPagination } from 'src/data/interface'
import DeleteDataModel from 'src/customComponents/delete-model'
import DatePicker, { ReactDatePickerProps } from 'react-datepicker'
import DatePickerWrapper from 'src/customComponents/Form-Elements/styles/data-picker'

interface PickerProps {
    label?: string
    end: Date | number
    start: Date | number
}

type DateType = Date | null | undefined

const TrendingAndMarketingPopup = () => {

    let timer: any;
    const [SearchFilter, setSearchFilter] = useState()
    const [drawerAction, setDrawerAction] = useState(false)
    const [title, setTitle] = useState("")
    const [id, setId] = useState('')
    const [content, setContent] = useState("")
    const [buttonName, setButtonName] = useState("")
    const [pageLink, setPageLink] = useState("")
    const [imageFile, setImageFile] = useState<string>()
    const [imageShow, setImageShow] = useState("")
    const [removeimage, setRemoveImage] = useState("0")
    const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" });
    const [result, setResult] = useState([])
    const [dialogTitle, setDialogTitle] = useState<'Add' | 'Edit'>('Add')
    const [showModel, setShowModel] = useState(false)
    const [startDate, setStartDate] = useState<DateType>(new Date())
    const [endDate, setEndDate] = useState<DateType>(new Date())

    const handleOnChange = (dates: any) => {
        const [start, end] = dates
        setStartDate(start)
        setEndDate(end)
    }

    const CustomInput = forwardRef((props: PickerProps, ref) => {
        const startDate = props.start !== null ? `${format(props.start, 'dd/MM/yyyy')}` : null
        const endDate = props.end !== null ? ` - ${format(props.end, 'dd/MM/yyyy')}` : null

        const value = `${startDate}${endDate !== null ? endDate : ''}`

        return <TextField
            sx={{ mb: 4 }}
            size='small'
            fullWidth
            inputRef={ref}
            label={props.label || ''} {...props}
            value={value}
        />
    })

    const toggleAddTrandingMarketingDrawer = () => {
        if (drawerAction == false) {
            setRemoveImage("1")

        } else {
            setRemoveImage("0")
        }
        setDrawerAction(!drawerAction)
    }


    const editOnClickHandler = async (data: any) => {
        setTitle(data.name)
        setImageShow(data.image_path)
        setContent(data.content)
        setPageLink(data.target_url)
        setButtonName(data.button_name)
        setStartDate(new Date(data.active_date))
        setEndDate(new Date(data.expiry_date))
        setId(data.id)
        setDialogTitle('Edit')
        toggleAddTrandingMarketingDrawer()
    }
    const deleteOnclickHandler = (data: any) => {
        setId(data.id)
        setShowModel(!showModel)
    }

    const clearFormData = () => {
        setTitle("")
        setImageShow("")
        setContent("")
        setPageLink("")
        setButtonName("")
        setId("")
    }

    const deafultDateData = () => {
        setStartDate(new Date())
        setEndDate(addDays(new Date(), 1))
    }

    /////////////////////// ADD API ///////////////////////

    const addApi = async () => {
        const formData: any = new FormData()
        formData.append("image", imageFile || "")
        formData.append("name", title)
        formData.append("content", content)
        formData.append("active_date", startDate)
        formData.append("expiry_date", endDate)
        formData.append("target_url", pageLink)
        formData.append("button_name", buttonName)

        try {
            const data = await ADD_MARKETING_POPUP(formData)
            if (data.code === 200 || data.code === "200") {

                toggleAddTrandingMarketingDrawer();
                clearFormData();
                deafultDateData();
                toast.success(data.message)
                getAllApi(pagination)

            } else {
                toast.error(data.message)
            }
        } catch (e: any) {

            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
        }

        return false
    }

    /////////////////////// GET API ///////////////////////

    const getAllApi = async (mbPagination: ICommonPagination) => {
        try {
            const data = await GET_ALL_MARKETING_POPUP(mbPagination);
            if (data.code === 200 || data.code === "200") {
                setPagination(data.data.pagination)
                setResult(data.data.result)
            } else {
                toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }
    useEffect(() => {

        getAllApi(pagination);

    }, []);

    const handleChangePerPageRows = (perPageRows: number) => {
        getAllApi({ ...pagination, per_page_rows: perPageRows, current_page: 1 })
    }

    const handleOnPageChange = (page: number) => {
        getAllApi({ ...pagination, current_page: page + 1 })
    }

    const handleChangeSortBy = (orderSort: any) => {
        getAllApi({ ...pagination, sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field), order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort) })
    }

    const searchBusinessUser = async () => {
        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            getAllApi({ ...pagination, current_page: 1, search_text: SearchFilter });
        }, SEARCH_DELAY_TIME);
    }

    useEffect(() => {
        searchBusinessUser();
    }, [SearchFilter]);

    /////////////////////// EDIT API ///////////////////////

    const editApi = async () => {
        const formData: any = new FormData()
        formData.append("image", imageFile || "")
        formData.append("id", id)
        formData.append("name", title)
        formData.append("content", content)
        formData.append("active_date", startDate)
        formData.append("expiry_date", endDate)
        formData.append("target_url", pageLink)
        formData.append("button_name", buttonName)

        try {
            const data = await EDIT_MARKETING_POPUP(formData);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                toggleAddTrandingMarketingDrawer();
                getAllApi(pagination);
            } else {
                toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }

    /////////////////////// DELETE  API ///////////////////////

    const toggleModel = (showdata: any) => {
        setShowModel(showdata)
    }

    const deleteApi = async () => {
        const payload = {
            "id": id,
        };
        try {
            const data = await DELETE_MARKETING_POPUP(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                setShowModel(!showModel);
                getAllApi(pagination);


            } else {
                toast.error(data.message);
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
            const data = await STATUS_MARKETING_POPUP(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                getAllApi(pagination);

            } else {
                toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }

    const column = [
        {
            flex: 1,
            value: "image_path",
            headerName: "image",
            field: "image_path",
            avatars: "avatars"
        },
        {
            flex: 1,
            value: 'name',
            headerName: 'title',
            field: 'name',
            text: 'text'
        },
        {
            flex: 1,
            value: 'target_url',
            headerName: 'link',
            field: 'target_url',
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
            SwitchonChange: statusApi,
            value: 'is_active'
        },
        {
            flex: 1,
            headerName: 'Action',
            field: 'action',
            edit: "edit",
            deleted: 'deleted',
            editOnClick: editOnClickHandler,
            deletedOnClick: deleteOnclickHandler,
        },
    ]

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <CardHeader title='Trending/marketing Popup'></CardHeader>
                    <Divider />
                    <Box>
                        <TCCTableHeader isButton value={SearchFilter}
                            onChange={(e: any) => setSearchFilter(e.target.value)}
                            toggle={(e: any) => {
                                e.preventDefault()
                                toggleAddTrandingMarketingDrawer()
                                setDialogTitle('Add')
                                clearFormData()
                                deafultDateData()
                            }}
                            ButtonName='Add Trending/marketing Popup'
                        />

                    </Box>
                    <TccDataTable
                        column={column}
                        rows={result}
                        handleSortChanges={handleChangeSortBy}
                        pageSize={parseInt(pagination.per_page_rows.toString())}
                        onChangepage={handleChangePerPageRows}
                        rowCount={pagination.total_items}
                        page={pagination.current_page - 1}
                        onPageChange={handleOnPageChange}
                        iconTitle='popup'
                    />
                </Card>
            </Grid>
            <Drawer
                open={drawerAction}
                anchor='right'
                variant='temporary'
                onClose={toggleAddTrandingMarketingDrawer}
                ModalProps={{ keepMounted: true }}
                sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
            >
                <DrawerHeader
                    title={`${dialogTitle} Trending/marketing Popup`}
                    onClick={toggleAddTrandingMarketingDrawer}
                />

                <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
                    <form>
                        <TccInput
                            fullWidth
                            label='Title'
                            value={title}
                            onChange={(e: any) => setTitle(e.target.value)}
                            sx={{ mb: 4 }}
                        />
                        <TccInput
                            rows={4}
                            multiline
                            fullWidth
                            label='Content'
                            value={content}
                            onChange={(e: any) => setContent(e.target.value)}
                            sx={{ mb: 4 }}
                        />
                        <TccInput
                            fullWidth
                            label='Link'
                            value={pageLink}
                            onChange={(e: any) => setPageLink(e.target.value)}
                            sx={{ mb: 4 }}
                        />
                        <DatePickerWrapper>
                            <DatePicker
                                selectsRange
                                endDate={endDate}
                                selected={startDate}
                                startDate={startDate}
                                id='date-range-picker'
                                onChange={handleOnChange}
                                shouldCloseOnSelect={true}
                                customInput={
                                    <CustomInput label='ActiveDate - ExpiryDate' start={startDate as Date | number} end={endDate as Date | number} />
                                }
                            />
                        </DatePickerWrapper>

                        <TccInput
                            fullWidth
                            label='Button Name'
                            value={buttonName}
                            onChange={(e: any) => setButtonName(e.target.value)}
                            sx={{ mb: 4 }}
                        />

                        <TccSingleFileUpload onDrop={setImageFile} onClick={removeimage} imageFile={imageShow} />


                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
                            <Button variant='contained' sx={{ mr: 3 }} onClick={() => {
                                if (dialogTitle === "Add") {
                                    addApi()
                                } else {
                                    editApi()
                                }
                            }}>
                                {dialogTitle === 'Add' ? "SUBMIT" : "EDIT"}
                            </Button>
                            <Button variant='outlined' color='secondary' onClick={toggleAddTrandingMarketingDrawer}>
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

export default TrendingAndMarketingPopup