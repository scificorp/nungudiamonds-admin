// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardHeader from '@mui/material/CardHeader'
import { Box, Button, Divider, Drawer, TextField, Typography } from '@mui/material'
import TCCTableHeader from 'src/customComponents/data-table/header'
import TccDataTable from 'src/customComponents/data-table/table'
import { useEffect, useState } from 'react'
import DrawerHeader from 'src/customComponents/components/drawer-header'
import TccInput from 'src/customComponents/Form-Elements/inputField'
import TccEditor from 'src/customComponents/Form-Elements/editor'
import TccSingleFileUpload from 'src/customComponents/Form-Elements/file-upload/singleFile-upload'
import { ICommonPagination } from 'src/data/interface'
import { ADD_HOME_ABOUT_SECTION, DELETE_HOME_ABOUT_SECTION, EDIT_HOME_ABOUT_SECTION, GET_ALL_HOME_ABOUT_SECTION, GET_MAIN_HOME_ABOUT_SECTION, MAIN_CONTENT_HOME_ABOUT_EDIT, STATUS_UPDATE_HOME_ABOUT_SECTION } from 'src/services/AdminServices'
import { createPagination } from 'src/utils/sharedFunction'
import { appErrors, SEARCH_DELAY_TIME } from 'src/AppConstants'
import { toast } from 'react-hot-toast'
import DeleteDataModel from 'src/customComponents/delete-model'

const HomeAboutSection = () => {
    let timer: any;
    const [searchFilter, setSearchFilter] = useState()
    const [subContentId, setSubContentId] = useState("")
    const [drawerAction, setDrawerAction] = useState(false)
    const [showModel, setShowModel] = useState(false)
    const [sortTitle, setSortTitle] = useState('');
    const [mainTitle, setMainTitle] = useState("")
    const [title, setTitle] = useState("")
    const [buttonName, setButtonName] = useState("")
    const [mainContent, setMainContent] = useState("")
    const [content, setContent] = useState("")
    const [pageLink, setPageLink] = useState("")
    const [imageFile, setImageFile] = useState<string>()
    const [imageShow, setImageShow] = useState("")
    const [removeimage, setRemoveImage] = useState("0")
    const [mainContentDataId, setMainContentDataId] = useState("")
    const [subContentData, setSubContentData] = useState([])
    const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" });
    const [dialogTitle, setDialogTitle] = useState<'Add' | 'Edit'>('Add')

    const toggleAddHomeAboutSection = () => {
        if (drawerAction == false) {
            setRemoveImage("1")
        } else {
            setRemoveImage("0")
        }
        setDrawerAction(!drawerAction)
    }

    const clearFormData = () => {
        setTitle("")
        setImageShow("")
        setContent("")
        setPageLink("")
        setButtonName("")
        setSubContentId("")
    }

    const editOnClickHandler = (data: any) => {
        setTitle(data.title)
        setImageShow(data.image_path)
        setContent(data.content)
        setPageLink(data.target_link)
        setButtonName(data.button_name)
        setSubContentId(data.id)
        setDialogTitle('Edit')
        toggleAddHomeAboutSection()
    }
    const deleteOnclickHandler = (data: any) => {
        setSubContentId(data.id)
        setShowModel(!showModel)
    }
    const getAllMainHomeAboutDataApi = async () => {
        try {
            const data = await GET_MAIN_HOME_ABOUT_SECTION();
            if (data.code === 200 || data.code === "200") {
                setSortTitle(data.data[0].sort_title)
                setMainContent(data.data[0].content)
                setMainTitle(data.data[0].title)
                setMainContentDataId(data.data[0].id)
            } else {
                return toast.error(data.message);
            }
        } catch (error) {
            return toast.error(appErrors.UNKNOWN_ERROR_TRY_AGAIN)
        }
    }

    const getAllHomeAboutDataApi = async (mbPagination: ICommonPagination) => {
        try {
            const data = await GET_ALL_HOME_ABOUT_SECTION(mbPagination);
            if (data.code === 200 || data.code === "200") {
                setSubContentData(data.data.result);
                setPagination(data.data.pagination)

            } else {
                return toast.error(data.message);
            }
        } catch (error) {
            return toast.error(appErrors.UNKNOWN_ERROR_TRY_AGAIN)

        }
    }

    useEffect(() => {
        getAllMainHomeAboutDataApi()
        getAllHomeAboutDataApi(pagination)
    }, [])

    const handleChangePerPageRows = (perPageRows: number) => {
        getAllHomeAboutDataApi({ ...pagination, per_page_rows: perPageRows, current_page: 1 })
    }

    const handleOnPageChange = (page: number) => {
        getAllHomeAboutDataApi({ ...pagination, current_page: page + 1 })
    }

    const handleChangeSortBy = (orderSort: any) => {
        getAllHomeAboutDataApi({ ...pagination, sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field), order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort) })
    }

    const searchBusinessUser = async () => {
        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            getAllHomeAboutDataApi({ ...pagination, current_page: 1, search_text: searchFilter });
        }, SEARCH_DELAY_TIME);
    }

    useEffect(() => {
        searchBusinessUser();
    }, [searchFilter]);

    const editMainContentData = async () => {
        const payload = {
            "id": mainContentDataId,
            "sort_title": sortTitle,
            "title": mainTitle,
            "content": mainContent,
        }
        try {
            const datas = await MAIN_CONTENT_HOME_ABOUT_EDIT(payload)

            if (datas.code === 200 || datas.code === "200") {
                toast.success("Successfully updated")
                getAllHomeAboutDataApi(pagination)
                return true
            } else {

            }
        } catch (error) {
            return toast.error(appErrors.UNKNOWN_ERROR_TRY_AGAIN)
        }

    }

    const addHomeAboutSectionApi = async () => {
        const formData = new FormData()
        formData.append("image", imageFile || "")
        formData.append("title", title)
        formData.append("content", content)
        formData.append("target_link", pageLink)
        formData.append("button_name", buttonName)
        formData.append("main_content_id", mainContentDataId)

        try {
            const data = await ADD_HOME_ABOUT_SECTION(formData)
            if (data.code === 200 || data.code === "200") {
                toggleAddHomeAboutSection();
                clearFormData()
                toast.success(data.message)
                getAllHomeAboutDataApi(pagination)

            } else {
                toast.error(data.message)
            }
        } catch (e: any) {

            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
        }

        return false
    }

    const editHomeAboutSectionApi = async () => {

        const formData = new FormData()
        formData.append("id", subContentId)
        formData.append("image", imageFile || "")
        formData.append("title", title)
        formData.append("content", content)
        formData.append("target_link", pageLink)
        formData.append("button_name", buttonName)
        try {
            const data = await EDIT_HOME_ABOUT_SECTION(formData)
            if (data.code === 200 || data.code === "200") {
                toggleAddHomeAboutSection();
                clearFormData();
                toast.success(data.message)
                getAllHomeAboutDataApi(pagination)
            } else {
                toast.error(data.message)
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
        }

        return false
    }

    const deleteBannerDataApi = async () => {

        const payload = {
            "id": subContentId,
        }

        try {
            const data = await DELETE_HOME_ABOUT_SECTION(payload);
            if (data.code === 200 || data.code === "200") {
                clearFormData();
                toast.success(data.message);
                setShowModel(!showModel)
                getAllHomeAboutDataApi(pagination)
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
            const datas = await STATUS_UPDATE_HOME_ABOUT_SECTION(payload)

            if (datas.code === 200 || datas.code === "200") {
                toast.success("Successfully updated")
                getAllHomeAboutDataApi(pagination)

                return true
            } else {

            }
        } catch (error) {

            return toast.error(appErrors.UNKNOWN_ERROR_TRY_AGAIN)
        }
    }
    const column = [
        {
            flex: 2,
            value: 'title',
            headerName: 'sort title',
            field: 'title',
            text: 'text'
        },

        {
            flex: 2,
            value: 'target_link',
            headerName: 'link',
            field: 'target_link',
            text: 'text'
        },
        {
            flex: 1,
            value: 'button_name',
            headerName: 'Buton Name',
            field: 'button_name',
            text: 'text'
        },
        {
            flex: 1,
            headerName: 'Status',
            field: '',
            chips: 'chip',
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
            editOnClick: editOnClickHandler,
            deleted: 'deleted',
            deletedOnClick: deleteOnclickHandler

        },
    ];

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <CardHeader title='Home About Section'></CardHeader>
                    <Divider />
                    <CardHeader title='Main Content Form'></CardHeader>

                    <form>
                        <Grid container spacing={6}>
                            <Grid item xs={6}>
                                <TccInput
                                    fullWidth
                                    label='Sort Title'
                                    value={sortTitle}
                                    onChange={(e: any) => setSortTitle(e.target.value)}
                                    sx={{ m: 4 }}
                                />
                                <TccInput
                                    label='Title'
                                    fullWidth
                                    value={mainTitle}
                                    onChange={(e: any) => setMainTitle(e.target.value)}
                                    sx={{ m: 4 }}
                                />

                            </Grid>
                            <Grid item xs={5.7} >
                                <TccInput
                                    fullWidth
                                    rows={4}
                                    multiline
                                    label='Main Content'
                                    value={mainContent}
                                    onChange={(e: any) => setMainContent(e.target.value)}
                                    sx={{ m: 4 }}
                                />
                                <Button variant='contained' sx={{ ml: 4, mb: 4 }} onClick={editMainContentData}>
                                    SAVE
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                    <Divider />
                    <TCCTableHeader
                        isButton
                        value={searchFilter}
                        onChange={(e: any) => setSearchFilter(e.target.value)}
                        ButtonName='Add Home About Section'
                        toggle={() => {
                            setDialogTitle('Add')
                            toggleAddHomeAboutSection()
                            clearFormData()
                        }}
                    />

                    <TccDataTable
                        column={column}
                        rows={subContentData}
                        handleSortChanges={handleChangeSortBy}
                        pageSize={parseInt(pagination.per_page_rows.toString())}
                        onChangepage={handleChangePerPageRows}
                        rowCount={pagination.total_items}
                        page={pagination.current_page - 1}
                        onPageChange={handleOnPageChange}
                        iconTitle='Section'
                    />
                </Card>
            </Grid>
            <Drawer
                open={drawerAction}
                anchor='right'
                variant='temporary'
                onClose={toggleAddHomeAboutSection}
                ModalProps={{ keepMounted: true }}
                sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
            >

                <DrawerHeader
                    title={`${dialogTitle} Home About Section`}
                    onClick={toggleAddHomeAboutSection}
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
                        <TccInput
                            fullWidth
                            label='Button Name'
                            value={buttonName}
                            onChange={(e: any) => setButtonName(e.target.value)}
                            sx={{ mb: 4 }}
                        />

                        <TccSingleFileUpload onDrop={setImageFile} onClick={removeimage} imageFile={imageShow} />

                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 6 }}>
                            {dialogTitle === 'Add' ? <Button variant='contained' sx={{ mr: 3 }} onClick={() => {
                                addHomeAboutSectionApi()
                            }}>Submit
                            </Button> : <Button variant='contained' sx={{ mr: 3 }} onClick={() => {
                                editHomeAboutSectionApi()
                            }}>EDIT
                            </Button>}
                            <Button variant='outlined' color='secondary' onClick={() => {
                                toggleAddHomeAboutSection()
                                clearFormData()
                            }}>
                                Cancel
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Drawer>
            <DeleteDataModel showModel={showModel} toggle={(show: any) => setShowModel(show)} onClick={deleteBannerDataApi} />

        </Grid >
    )
}


export default HomeAboutSection