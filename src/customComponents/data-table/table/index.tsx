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
import ErrorBoundary from 'src/components/ErrorBoundary'

const TccDataTable = ({ rows, index, column, onChangepage, rowHeight, pageSize, emptyMessage, loading, iconTitle, rowCount, page, onPageChange, paginationMode, handleSortChanges }: any) => {

    // Helper function to get nested object values using dot notation
    const getNestedValue = (obj: any, path: string) => {
        // Check if path is defined and is a string
        if (!path || typeof path !== 'string') {
            return undefined;
        }

        // Check if obj is defined
        if (!obj) {
            return undefined;
        }

        try {
            return path.split('.').reduce((current, key) => current?.[key], obj);
        } catch (error) {
            return undefined;
        }
    };

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

    const safeRows = Array.isArray(rows) ? rows : []
    const usedColumnFields = new Set<string>()

    const columns = column.map((rows: any, columnIndex: number) => {
        const baseField = rows.field || rows.value || rows.headerName || 'column'
        const field = usedColumnFields.has(baseField) ? `${baseField}_${columnIndex}` : baseField
        usedColumnFields.add(field)

        return {
            flex: rows.flex,
            headerName: rows.headerName,
            field,
            renderCell: ({ row }: any) => {

                return (
                    <div itemID={row.id} >
                        {rows.text && rows.text !== 'collections' && <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary', textTransform: 'capitalize' }}>
                            {getNestedValue(row, rows.value)}
                        </Typography>}

                        {rows.text === 'collections' && (
                            <div>
                                {(() => {
                                    const collections = getNestedValue(row, rows.value);
                                    
return Array.isArray(collections) ? (
                                        collections.length > 0 ? (
                                            collections.map((collection: any, index: number) => (
                                            <CustomChip
                                                key={collection.id || index}
                                                rounded
                                                skin='light'
                                                size='small'
                                                label={collection.name}
                                                color='primary'
                                                sx={{
                                                    textTransform: 'capitalize',
                                                    mr: 1,
                                                    mb: 0.5,
                                                    backgroundColor: '#c6a55a',
                                                    color: 'white'
                                                }}
                                            />
                                        ))
                                    ) : (
                                        <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                                            No collections
                                        </Typography>
                                    )
                                ) : (
                                    <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                                        No collections
                                    </Typography>
                                );
                                })()}
                            </div>
                        )}

                        {rows.date && <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary', textTransform: 'capitalize' }}>
                            {(() => {
                                const dateValue = getNestedValue(row, rows.value);
                                
return dateValue ? moment(dateValue).format(DATEPICKER_DATE_FORMAT) : 'N/A';
                            })()}
                        </Typography>}

                        {rows.price && <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary', textTransform: 'capitalize' }}>
                            {(() => {
                                const priceValue = getNestedValue(row, rows.value);
                                
return priceValue ? `${getPriceFormat(priceValue)}` : 'N/A';
                            })()}
                        </Typography>}

                        {rows.avatars && (() => {
                            const imageSrc = getNestedValue(row, rows.value);
                            
return (
                                <CustomAvatar
                                    skin='light'
                                    sx={{ mr: 4, width: 30, height: 30 }}
                                    src={imageSrc ? `${imagePath}${imageSrc}` : undefined}
                                />
                            );
                        })()}
                        {rows.chips && (() => {
                            const chipValue = getNestedValue(row, rows.value);
                            const isActive = chipValue === '1' || chipValue === 1;
                            
return (
                                <CustomChip
                                    rounded
                                    skin='light'
                                    size='small'
                                    label={isActive ? "Active" : "Inactive"}
                                    color={isActive ? "success" : "error"}
                                    sx={{ textTransform: 'capitalize' }}
                                />
                            );
                        })()}
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
                                <Switch
                                    checked={(() => {
                                        const switchValue = getNestedValue(row, rows.value);
                                        
return switchValue === "1" || switchValue === 1;
                                    })()}
                                    onChange={(event, checked) => rows.SwitchonChange && rows.SwitchonChange(checked, row)}
                                />
                            </Tooltip>
                        }
                        {rows.view &&
                            <Tooltip title={rows.viewTitle || 'View Details'}>
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
                            <Tooltip title={rows.editTitle || `Edit ${iconTitle}`}>
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
                            <Tooltip title={rows.deleteTitle || `Delete ${iconTitle}`}>
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
                            <Rating
                                readOnly
                                defaultValue={(() => {
                                    const ratingValue = getNestedValue(row, rows.value);
                                    
return ratingValue ? Number(ratingValue) : 0;
                                })()}
                                precision={0.5}
                                name='read-only'
                            />
                        }
                        {
                            rows.gustName &&
                            <div>{(() => {
                                const gustNameValue = getNestedValue(row, rows.value);
                                
return gustNameValue ? (
                                    <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary', textTransform: 'capitalize' }}>
                                        {gustNameValue}
                                    </Typography>
                                ) : (
                                    <div style={{ display: 'flex' }}>
                                        <CustomChip
                                            rounded
                                            skin='light'
                                            size='small'
                                            label="G"
                                            color="success"
                                            sx={{ textTransform: 'capitalize' }}
                                        />
                                        <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary', textTransform: 'capitalize', marginLeft: 2 }}>
                                            {getNestedValue(row, rows.value2) || 'N/A'}
                                        </Typography>
                                    </div>
                                );
                            })()}</div>
                        }

                    </div >
                )
            }
        }
    })

    return (
        <Grid item xs={12} className='config-filter-content'>
            <ErrorBoundary>
                <DataGrid
                    autoHeight
                    disableColumnFilter
                    rows={safeRows}
                    columns={columns}
                    loading={Boolean(loading)}
                    localeText={{
                        noRowsLabel: emptyMessage || 'No records found. Use the add action above if this table should contain data.'
                    }}
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
            </ErrorBoundary>
        </Grid>
    )
}


export default TccDataTable
