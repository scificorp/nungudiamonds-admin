// ** MUI Imports
import { Icon } from '@iconify/react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

// ** Icon Imports


const TCCTableHeader = ({ onChange, toggle, value, isButton, ButtonName, exportButton, infoButton, infotoggle, importButton, uploadOnClick, onChangeUpload }: any) => {
    const actionLabel = ButtonName || 'Add'

    const renderPrimaryAction = () => {
        if (!isButton) return null

        return (
            <Button onClick={toggle} variant='contained' sx={{ '& svg': { mr: 2 } }}>
                <Icon fontSize='1.125rem' icon='tabler:plus' />
                {actionLabel}
            </Button>
        )
    }

    const renderInfoAction = () => {
        if (!infoButton) return null

        return (
            <Button variant='contained' sx={{ '& svg': { mr: 2 }, mr: 2 }} onClick={infotoggle}>
                <Icon icon='uil:info' fontSize='1.125rem' /> Info
            </Button>
        )
    }

    return (
        <Box
            sx={{
                py: 4,
                px: 4,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2
            }}
        >
            {exportButton ? (
                <Button color='secondary' variant='outlined' startIcon={<Icon icon='tabler:upload' />}>
                    Export
                </Button>
            ) : null}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, flex: '1 1 320px' }}>
                <TextField
                    size='small'
                    value={value}
                    placeholder='Search'
                    onChange={onChange}
                    sx={{ minWidth: 240, maxWidth: 420, flex: '1 1 240px' }}
                />

                {renderInfoAction()}
                {renderPrimaryAction()}
            </Box>

            {importButton ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                    <Button variant='contained' sx={{ '& svg': { mr: 2 } }}>
                        <input
                            className="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium css-ya582n-MuiButtonBase-root-MuiButton-root"
                            style={{ marginRight: '5px', fontSize: '15px' }}
                            type="file"
                            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                            onChange={onChangeUpload}
                        />
                    </Button>
                    <Button onClick={uploadOnClick} variant='contained' sx={{ '& svg': { mr: 2 } }}>
                        <Icon icon='vaadin:refresh' fontSize='1.125rem' /> Apply Changes
                    </Button>
                    <Button onClick={toggle} variant='contained' sx={{ '& svg': { mr: 2 } }}>
                        <Icon fontSize='1.125rem' icon='tabler:plus' />
                        {actionLabel}
                    </Button>
                </Box>
            ) : null}
        </Box>
    )
}

export default TCCTableHeader
