// ** MUI Imports
import { Icon } from '@iconify/react'
import { IconButton } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

// ** Icon Imports


const TCCTableHeader = ({ onChange, toggle, value, isButton, ButtonName, exportButton, infoButton, infotoggle, importButton, uploadOnClick, onChangeUpload }: any) => {

    return (
        <Box
            sx={{
                py: 4,
                px: 6,
                pr: 4,
                pl: 4,
                rowGap: 2,
                columnGap: 4,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}
        >
            {exportButton ? <Button color='secondary' variant='outlined' startIcon={<Icon icon='tabler:upload' />}>
                Export
            </Button> : <></>}

            {exportButton ? <Box sx={{ rowGap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                    size='small'
                    value={value}
                    placeholder='Search'
                    onChange={onChange}
                />

                {infoButton ? <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button variant='contained' sx={{ '& svg': { mr: 2 }, mr: 2 }} onClick={infotoggle}>
                        <Icon icon='uil:info' fontSize='1.125rem' /> Info
                    </Button>

                    {isButton ? <Button onClick={toggle} variant='contained' sx={{ '& svg': { mr: 2 } }}>
                        <Icon fontSize='1.125rem' icon='tabler:plus' />
                        {ButtonName}
                    </Button> : <></>} </Box> :
                    <>
                        {isButton ? <Button onClick={toggle} variant='contained' sx={{ '& svg': { mr: 2 } }}>
                            <Icon fontSize='1.125rem' icon='tabler:plus' />
                            {ButtonName}
                        </Button> : <></>}
                    </>
                }

            </Box> :
                <>
                    <TextField
                        size='small'
                        value={value}
                        placeholder='Search'
                        onChange={onChange}
                    />

                    {infoButton ? <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button variant='contained' sx={{ '& svg': { mr: 2 }, mr: 2 }} onClick={infotoggle}>
                            <Icon icon='uil:info' fontSize='1.125rem' /> Info
                        </Button>

                        {isButton ? <Button onClick={toggle} variant='contained' sx={{ '& svg': { mr: 2 } }}>
                            <Icon fontSize='1.125rem' icon='tabler:plus' />
                            {ButtonName}
                        </Button> : <></>} </Box> :
                        <>
                            {isButton ? <Button onClick={toggle} variant='contained' sx={{ '& svg': { mr: 2 } }}>
                                <Icon fontSize='1.125rem' icon='tabler:plus' />
                                {ButtonName}
                            </Button> : <></>}
                        </>
                    }

                </>
            }

            {importButton ? <Box sx={{ display: 'flex', justifyContent: "end", mt: 3 }}>
                <Button variant='contained' sx={{ '& svg': { mr: 2 }, mr: 1 }}>
                    <input className="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium css-ya582n-MuiButtonBase-root-MuiButton-root"
                        style={{ marginRight: '5px', fontSize: '15px' }}
                        type="file"
                        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        onChange={onChangeUpload}
                    />
                </Button>
                <Button onClick={uploadOnClick} variant='contained' sx={{ '& svg': { mr: 2 }, mr: 1 }}>
                    <Icon icon='vaadin:refresh' fontSize='1.125rem' /> Apply Changes
                </Button>
                <Button onClick={toggle} variant='contained' sx={{ '& svg': { mr: 2 } }}>
                    <Icon fontSize='1.125rem' icon='tabler:plus' />
                    Add diamond group master
                </Button>
            </Box> :
                <></>
            }
        </Box>
    )
}

export default TCCTableHeader
