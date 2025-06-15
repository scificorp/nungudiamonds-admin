// ** Type Imports
import { PaletteMode } from '@mui/material'
import { Skin } from 'src/@core/layouts/types'
import { BLACK_COLOR, DARK_PAPER_BG_COLOR, PRIMARY_COLOR_DARK, PRIMARY_COLOR_LIGHT, PRIMARY_COLOR_MAIN, SECONDARY_COLOR_DARK, SECONDARY_COLOR_LIGHT, SECONDARY_COLOR_MAIN, WHITE_COLOR } from 'src/AppConfig'

const DefaultPalette = (mode: PaletteMode, skin: Skin) => {
  // ** Vars
  const whiteColor = WHITE_COLOR
  const lightColor = '51, 48, 60'
  const darkColor = '228, 230, 244'
  const darkPaperBgColor = DARK_PAPER_BG_COLOR
  const mainColor = mode === 'light' ? lightColor : darkColor
  const yellowColor = '219, 185, 97'
  const defaultBgColor = () => {
    if (skin === 'bordered' && mode === 'light') {
      return whiteColor
    } else if (skin === 'bordered' && mode === 'dark') {
      return darkPaperBgColor
    } else if (mode === 'light') {
      return '#F8F7FA'
    } else return '#25293C'
  }

  return {
    customColors: {
      dark: darkColor,
      main: mainColor,
      light: lightColor,
      lightPaperBg: whiteColor,
      darkPaperBg: darkPaperBgColor,
      yellow: yellowColor,
      bodyBg: mode === 'light' ? '#F8F7FA' : '#25293C', // Same as palette.background.default but doesn't consider bordered skin
      trackBg: mode === 'light' ? '#F1F0F2' : '#3B405B',
      avatarBg: mode === 'light' ? '#F6F6F7' : '#4A5072',
      tableHeaderBg: mode === 'light' ? '#F6F6F7' : '#4A5072'
    },
    mode: mode,
    common: {
      black: BLACK_COLOR,
      white: whiteColor
    },
    primary: {
      light: PRIMARY_COLOR_LIGHT,
      main: PRIMARY_COLOR_MAIN,
      dark: PRIMARY_COLOR_DARK,
      contrastText: whiteColor
    },
    secondary: {
      light: SECONDARY_COLOR_LIGHT,
      main: SECONDARY_COLOR_MAIN,
      dark: SECONDARY_COLOR_DARK,
      contrastText: whiteColor
    },
    error: {
      light: '#ED6F70',
      main: '#EA5455',
      dark: '#CE4A4B',
      contrastText: whiteColor
    },
    warning: {
      light: '#FFAB5A',
      main: '#FF9F43',
      dark: '#E08C3B',
      contrastText: whiteColor
    },
    info: {
      light: '#1FD5EB',
      main: '#00CFE8',
      dark: '#00B6CC',
      contrastText: whiteColor
    },
    success: {
      light: '#42CE80',
      main: '#28C76F',
      dark: '#23AF62',
      contrastText: whiteColor
    },
    grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
      A100: '#F5F5F5',
      A200: '#EEEEEE',
      A400: '#BDBDBD',
      A700: '#616161'
    },
    text: {
      primary: `rgba(${mainColor}, 0.87)`,
      secondary: `rgba(${mainColor}, 0.6)`,
      disabled: `rgba(${mainColor}, 0.38)`
    },
    divider: `rgba(${mainColor}, 0.12)`,
    background: {
      paper: mode === 'light' ? whiteColor : darkPaperBgColor,
      default: defaultBgColor()
    },
    action: {
      active: `rgba(${mainColor}, 0.54)`,
      hover: `rgba(${mainColor}, 0.04)`,
      selected: `rgba(${mainColor}, 0.08)`,
      disabled: `rgba(${mainColor}, 0.26)`,
      disabledBackground: `rgba(${mainColor}, 0.12)`,
      focus: `rgba(${mainColor}, 0.12)`
    }
  }
}

export default DefaultPalette
