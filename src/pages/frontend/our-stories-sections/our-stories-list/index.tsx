// ** MUI Imports
import { Divider, CardHeader, Grid, Card } from '@mui/material'
import { useEffect, useState } from 'react'
import TCCTableHeader from 'src/customComponents/data-table/header'
import TccDataTable from 'src/customComponents/data-table/table'
import Box from '@mui/material/Box'
import { appErrors, SEARCH_DELAY_TIME } from 'src/AppConstants'
import { createPagination } from 'src/utils/sharedFunction'
import { DELETE_OURSTORIES, GET_ALL_OURSTORIES, OURSTORIES_STATUS } from 'src/services/AdminServices'
import { toast } from 'react-hot-toast'
import { ICommonPagination } from 'src/data/interface'
import DeleteDataModel from 'src/customComponents/delete-model'
import Router from 'next/router'

const StoriesComponent = () => {

    let timer: any;
    const [searchFilter, setSearchFilter] = useState()
    const [id, setId] = useState('');
    const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" })
    const [result, setResult] = useState([])
    const [showModel, setShowModel] = useState(false);


    const editOnClickHandler = async (data: any) => {
        Router.push({ pathname: "/frontend/our-stories-sections/our-stories-add", query: { id: data.id } })

    }

    const deleteOnClickHandler = async (data: any) => {
        setId(data.id)
        setShowModel(!showModel)
    }

    /////////////////////// GET API ///////////////////////

    const getAllApi = async (mbPagination: ICommonPagination) => {
        try {
            const data = await GET_ALL_OURSTORIES(mbPagination);
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
            getAllApi({ ...pagination, current_page: 1, search_text: searchFilter });
        }, SEARCH_DELAY_TIME);
    }

    useEffect(() => {
        searchBusinessUser();
    }, [searchFilter]);

    //////////////////// STATUS API ///////////////////////

    const statusApi = async (checked: boolean, row: any) => {
        const payload = {
            "id": row.id,
            "is_active": checked ? '1' : '0',
        };
        try {
            const data = await OURSTORIES_STATUS(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                getAllApi(pagination);

            } else {
                return toast.error(data.message);
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
            const data = await DELETE_OURSTORIES(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                setShowModel(!showModel);
                getAllApi(pagination);
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
            headerName: 'Image',
            field: 'image_path',
            avatars: 'Image',
            value: 'image_path'
        },
        {
            flex: 2,
            value: 'title',
            headerName: 'Title',
            field: 'title',
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
            SwitchonChange: statusApi,

        },
        {
            flex: 2,
            headerName: 'Action',
            field: 'action',
            edit: "edit",
            editOnClick: editOnClickHandler,
            deleted: 'deleted',
            deletedOnClick: deleteOnClickHandler,
        },
    ]

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <CardHeader title='Our Stories'></CardHeader>
                    <Divider />
                    <Box>
                        <TCCTableHeader isButton value={searchFilter}
                            onChange={(e: any) => setSearchFilter(e.target.value)}
                            toggle={() => {
                                Router.push("/frontend/our-stories-sections/our-stories-add")
                            }}
                            ButtonName='Add Our Stories'
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
                        iconTitle='Our Stories'
                    />
                </Card>
            </Grid>

            <DeleteDataModel showModel={showModel} toggle={toggleModel} onClick={deleteApi} />
        </Grid>
    )
}

export default StoriesComponent