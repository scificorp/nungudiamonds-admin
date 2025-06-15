// ** MUI Imports

import { Icon } from '@iconify/react'
import { Avatar, Box, IconButton, Rating, Switch, Tooltip, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'
import { DataGrid } from '@mui/x-data-grid'
import moment from 'moment'
import { useState } from 'react'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomChip from 'src/@core/components/mui/chip'
import { DATEPICKER_DATE_FORMAT, IMG_ENDPOINT } from 'src/AppConfig'
import TccSwitch from 'src/customComponents/Form-Elements/switch'
import { getPriceFormat } from 'src/utils/sharedFunction'

const TccDataTable = ({ rows, index, column, onChangepage, rowHeight, pageSize, iconTitle, rowCount, page, onPageChange, paginationMode, handleSortChanges }: any) => {


    const imagePath = IMG_ENDPOINT + "/"

    const orderStatus: any = {
        1: { title: 'Pending', color: 'primary' },
        2: { title: 'Confirmed', color: 'success' },
        3: { title: 'Processing', color: 'warning' },
        4: { title: 'OutOfDelivery', color: 'info' },
        5: { title: 'Delivered', color: 'success' },
        6: { title: 'Returned', color: 'warning' },
        7: { title: "Failed", color: "error" },
        8: { title: "Canceled", color: "error" }
    }

    const columns = column.map((rows: any) => (
        {
            flex: rows.flex,
            headerName: rows.headerName,
            field: rows.field,
            renderCell: ({ row }: any) => {

                return (
                    <div itemID={row.id} >
                        {rows.text && <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary', textTransform: 'capitalize' }}>
                            {row[rows.value]}
                        </Typography>}

                        {rows.date && <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary', textTransform: 'capitalize' }}>
                            {moment(row[rows.value]).format(DATEPICKER_DATE_FORMAT)}
                        </Typography>}

                        {rows.price && <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary', textTransform: 'capitalize' }}>
                            {`${getPriceFormat(row[rows.value])}`}
                        </Typography>}

                        {rows.avatars && <CustomAvatar
                            skin='light'
                            sx={{ mr: 4, width: 30, height: 30 }}

                            src={`${imagePath}${row[rows.value]}`}

                        />
                        }
                        {rows.chips && <CustomChip
                            rounded
                            skin='light'
                            size='small'
                            label={row[rows.value] === '1' ? "Active" : "Inactive"}
                            color={row[rows.value] === '1' ? "success" : "error"}
                            sx={{ textTransform: 'capitalize' }}
                        />}
                        {rows.order_status_chip && <CustomChip
                            rounded
                            skin='light'
                            size='small'
                            label={orderStatus[row.order_status]?.title}
                            color={orderStatus[row.order_status]?.color}
                            sx={{ textTransform: 'capitalize' }}
                        />}

                        {rows.switch &&
                            <Tooltip title='Enable/Disable'>
                                <Switch checked={row[rows.value] === "1"} onChange={(event, checked) => rows.SwitchonChange(checked, row)} />
                            </Tooltip>
                        }
                        {rows.view &&
                            <Tooltip title='View Details'>
                                <IconButton
                                    size='small'
                                    sx={{ color: 'text.secondary' }}
                                    onClick={() => rows.viewOnClick(row)}
                                >
                                    <Icon icon='tabler:eye' />
                                </IconButton>
                            </Tooltip>
                        }
                        {rows.edit &&
                            <Tooltip title={`Edit ${iconTitle}`}>
                                <IconButton size='small'
                                    sx={{ color: 'text.secondary' }}
                                    onClick={() => rows.editOnClick(row)}
                                >
                                    <Icon icon='tabler:edit' />
                                </IconButton>
                            </Tooltip>
                        }
                        {
                            rows.deleted &&
                            <Tooltip title={`Delete ${iconTitle}`}>
                                <IconButton size='small'
                                    sx={{ color: 'text.secondary' }}
                                    onClick={() => rows.deletedOnClick(row)}
                                >
                                    <Icon icon='tabler:trash' />
                                </IconButton>
                            </Tooltip>
                        }
                        {
                            rows.imageUpload &&
                            <Tooltip title={`Images`}>
                                <IconButton size='small'
                                    sx={{ color: 'text.secondary' }}
                                    onClick={() => rows.imageUploadOnClick(row)}
                                >
                                    <Icon icon='uil:image-upload' />
                                </IconButton>
                            </Tooltip>
                        }
                        {
                            rows.rating &&
                            <Rating readOnly defaultValue={row[rows.value]} precision={0.5} name='read-only' />
                        }
                        {
                            rows.gustName &&
                            <div>{row[rows.value] ? <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary', textTransform: 'capitalize' }}>
                                {row[rows.value]}
                            </Typography> : <div style={{ display: 'flex' }}><CustomChip
                                rounded
                                skin='light'
                                size='small'
                                label="G"
                                color="success"
                                sx={{ textTransform: 'capitalize' }}
                            /><Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary', textTransform: 'capitalize', marginLeft: 2 }}>
                                    {row[rows.value2]}
                                </Typography></div>}</div>
                        }

                    </div >
                )
            }
        }
    ))

    return (
        <Grid item xs={12} className='config-filter-content'>

            <DataGrid
                autoHeight
                disableColumnFilter
                // rowHeight={rowHeight ? rowHeight : 62}
                rows={rows}
                columns={columns}
                pageSize={pageSize}
                onPageSizeChange={onChangepage}
                disableSelectionOnClick
                rowsPerPageOptions={[5, 10, 25, 50]}
                rowCount={rowCount}
                onSortModelChange={handleSortChanges}
                page={page}
                paginationMode={paginationMode}
                onPageChange={onPageChange}
            />
        </Grid>
    )
}


export default TccDataTable

