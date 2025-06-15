// ** React Imports
import { ChangeEvent, Fragment, SyntheticEvent, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stepper from '@mui/material/Stepper'
import { styled } from '@mui/material/styles'
import StepLabel from '@mui/material/StepLabel'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import CardContent from '@mui/material/CardContent'
import MuiStep, { StepProps } from '@mui/material/Step'
// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Icon Imports
import { Icon } from '@iconify/react'

// ** Custom Components Imports
import StepperCustomDot from 'src/customComponents/StepperCustomDot/intex'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// ** Styled Component
import StepperWrapper from 'src/@core/styles/mui/stepper'
import TccInput from 'src/customComponents/Form-Elements/inputField'
import TccEditor from 'src/customComponents/Form-Elements/editor'
import { Autocomplete, CardHeader, Checkbox, FormControlLabel, FormGroup, MenuItem, Paper, Radio, RadioGroup, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tab, Tabs } from '@mui/material'
import TccSelect from 'src/customComponents/Form-Elements/select'
import BulkUploadZip from 'src/components/product/BulkUploadZip'
import BulkUploadFile from 'src/components/product/BulkUploadFile'
import CustomChip from 'src/@core/components/mui/chip'
import { ADD_PRODUCT_BASIC_DETAILS, ADD_PRODUCT_DETAILS, ADD_PRODUCT_DROPDOWN_LIST, ADD_PRODUCT_METAL_DIAMOND_DETAILS, ADD_PRODUCT_MRTAL_DATA, EDIT_PRODUCT_DETAILS, GET_BY_ID_PRODUCTS, GET_DIAMOND_GROUP_MASTER_WITH_DETAILS } from 'src/services/AdminServices'
import { appErrors, STONE_TYPE } from 'src/AppConstants'
import Router, { useRouter } from 'next/router'

import { MEATL_GOLD_ID, MEATL_PLATINUM_ID, MEATL_SILVER_ID } from 'src/AppConfig'

const steps = [
  {
    icon: 'fluent-mdl2:product-release',
    title: 'Product Basic Details',
  },
  {
    icon: 'ion:diamond-outline',
    title: 'Gold & Diamonds Details',
  }
  // {
  //   icon: 'ion:diamond-outline',
  //   title: 'Image Upload',
  // }

]

let genderData: any = [
  {
    id: 1,
    name: "Male",
  },
  {
    id: 2,
    name: "Female"
  },
  {
    id: 3,
    name: "Unisex"
  }
]

const Step = styled(MuiStep)<StepProps>(({ theme }) => ({
  paddingLeft: theme.spacing(4),
  paddingRight: theme.spacing(4),
  '&:first-of-type': {
    paddingLeft: 0
  },
  '&:last-of-type': {
    paddingRight: 0
  },
  '& .MuiStepLabel-iconContainer': {
    display: 'none'
  },
  '& .step-subtitle': {
    color: `${theme.palette.text.disabled} !important`
  },
  '& + svg': {
    color: theme.palette.text.disabled
  },
  '&.Mui-completed .step-title': {
    color: theme.palette.text.disabled
  },
  '&.Mui-completed + svg': {
    color: theme.palette.primary.main
  }
}))

const ProductAdd = () => {
  // ** States
  let productSizeLenghtFilter: any;
  const [productId, setProductId] = useState(0)
  const [count, setCount] = useState(1)
  const [radioButtonStripe, setRadioButtonStripe] = useState('')
  const [inputFields, setInputFields] = useState([{ category: null, subCategory: null, subSubCategory: null, categoryList: [], subCategoryList: [], subSubCategoryList: [], id: 0, isDeleted: 0 }])
  const [inputFieldsGold, setInputFieldsGold] = useState([{ rate: '', default: '0', price: '', weight: '', metalGroup: "", id: 0, isDeleted: 0 }])
  const [inputFieldsDiamond, setInputFieldsDiamond] = useState([{
    default: '0', id_diamond_group: null, diamondGroup: null, Stone_type: "", stone_mm_size: null,
    Stone_weight: 0, stone_cut: null, stone_color: null, stone_clarity: null, stone_shape: "",
    stone: "", stone_count: 0, stone_setting: "", rate: 0, price: 0,
    id: 0, isDeleted: 0
  }])

  const [inputFieldGoldMetal, setInputFieldGoldMetal] = useState<{ karat: null, id_karat: null, tone: any[], price: '', rate: 0, id: 0, metal_weight: null, metal_tone: [] }[]>([])
  const [inputFieldSilverMetal, setInputFieldSilverMetal] = useState([{ tone: [{ id: null, name: "" }], price: '', rate: 0, id: 0, metal_tone: [], metal_weight: null }])
  const [inputFieldPlatinumMetal, setInputFieldPlatinumMetal] = useState([{ tone: [{ id: null, name: "" }], price: '', rate: 0, id: 0, metal_tone: [], metal_weight: null }])
  const [productName, setProductName] = useState('')
  const [productSKU, setProductSKU] = useState<string>('')
  const [productSortDes, setProductSortDes] = useState('')
  const [productLongDes, setProductLongDes] = useState('')
  const [keywordsList, setKeywordsList] = useState([])
  const [keyword, setKeyword] = useState<{ id: null, name: "" }[]>([])
  const [gender, setGender] = useState<{ id: null, name: "" }[]>([])
  const [settingTypeList, setSettingTypeList] = useState([])
  const [settingType, setSettingType] = useState<{ id: null, name: "" }[]>([])
  const [itemSizeList, setItemSizeList] = useState([])
  const [itemSize, setItemSize] = useState<{ id: null, size: "" }[]>([])
  const [itemLengthList, setItemLengthList] = useState([])
  const [itemLength, setItemLength] = useState<{ id: null, length: "" }[]>([])
  const [metalGroupList, setMetalGroupList] = useState([])
  const [diamondGroupList, setDiamondGroupList] = useState([])
  const [diamondGroupsWithDetails, setDiamondGroupsWithDetails] = useState([])
  const [stoneTypeList, setStoneTypeList] = useState([{ id: 1, name: "center" }, { id: 2, name: "side" }])
  const [metalToneList, setMetalToneList] = useState([])
  const [silverToneList, setSilverToneList] = useState([])
  const [paltinumToneList, setPaltinumToneList] = useState([])
  const [stoneSettingList, setStoneSettingList] = useState([])
  const [categorysList, setCategorysList] = useState([])
  const [stoneList, setStoneList] = useState([])
  const [stoneShapeList, setStoneShapeList] = useState([])
  const [stoneColor, setStoneColor] = useState([])
  const [stoneClarity, setStoneClarity] = useState([])
  const [stoneCuts, setStoneCuts] = useState([])
  const [metalKaratList, setMetalKaratList] = useState([])
  const [stoneMMSize, setStoneMMSize] = useState([]);
  const [activeStep, setActiveStep] = useState<number>(0)
  const [checkedSize, setCheckedSize] = useState<boolean>(false)
  const [checkedLength, setCheckedLength] = useState<boolean>(false)
  const [marketingCharge, setMarketingCharge] = useState<number>(0)
  const [findingCharge, setFindingCharge] = useState<number>(0)
  const [otherCharge, setOtherCharge] = useState<number>(0)
  const [checked, setChecked] = useState({})
  const [category, setCategory] = useState<any>()

  const [isDisabled, setIsDisabled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const router = useRouter();
  const { id, action } = router.query;
  const { viewid } = router.query;

  const handleChecked = (id: any) => (e: any) => {
    const { checked } = e.target;
    setChecked((values) => ({
      ...values,
      [id]: checked
    }));
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }

  const handleBulkUploadSuccess = () => {
    Router.push({ pathname: "/product/all-products" })
  }


  productSizeLenghtFilter = categorysList.find((t: any) => t.id === inputFields[0].category)

  useEffect(() => {
    let productDetailId: string = id as string

    if (productDetailId != undefined) {
      setProductId(parseInt(productDetailId))
    }
    getAllDropDownData(productDetailId)
  }, [router.isReady])

  const getByIdProductData = async (dropDownData: any, productDetailId: string) => {

    try {
      const data = await GET_BY_ID_PRODUCTS(parseInt(productDetailId));
      if (data.code === 200 || data.code === "200") {
        setProductId(data.data.findProduct.id)
        setProductName(data.data.findProduct.name)
        setProductSKU(data.data.findProduct.sku)
        setProductSortDes(data.data.findProduct.sort_description)
        setProductLongDes(data.data.findProduct.long_description)
        setFindingCharge(data.data.findProduct.finding_charge)
        setMarketingCharge(data.data.findProduct.making_charge)
        setOtherCharge(data.data.findProduct.other_charge)

        const tags = dropDownData.keyWords?.filter((t: any) => {
          if (data.data.findProduct.tag.indexOf(parseInt(t.id)) >= 0) return t;
        });
        setKeyword(tags)

        const genderDatas: any = genderData?.filter((t: any) => {
          if (data.data.findProduct.gender.indexOf(parseInt(t.id)) >= 0) return t;
        });
        setGender(genderDatas)

        const setting_style_type = dropDownData.setting_type_list?.filter((t: any) => {
          if (data.data.findProduct.setting_style_type.indexOf(parseInt(t.id)) >= 0) return t;
        });

        setSettingType(setting_style_type)

        const item_size = dropDownData.item_size?.filter((t: any) => {
          if (data.data.findProduct.size.indexOf(parseInt(t.id)) >= 0) return t;
        })

        setItemSize(item_size)

        const item_length = dropDownData.item_length?.filter((t: any) => {
          if ((data.data.findProduct.length as number[]).indexOf(parseInt(t.id)) >= 0) return t;
        })
        setItemLength(item_length)

        const categoryData = dropDownData.categoryList.find((t: any) => t.id == parseInt(data.data.findProduct.product_categories[0].id_category))

        setCategory(categoryData)
        if (categoryData.id_size.length > 0) {
          const sizeList: any = []
          for (const list of categoryData.id_size) {
            const sizeData: any = dropDownData.item_size.find((t: any) => t.id == parseInt(list))
            if (sizeData) {
              sizeList.push({ id: sizeData.id, size: sizeData.size })
            }
          }

          setItemSizeList(sizeList)
        }
        if (categoryData.id_length.length > 0) {
          const lengthList: any = []
          for (const list of categoryData.id_length) {
            const lengthData: any = dropDownData.item_length.find((t: any) => t.id == parseInt(list))
            if (lengthData) {
              lengthList.push({ id: lengthData.id, length: lengthData.length })
            }
          }
          setItemLengthList(lengthList)
        }

        let arrCategories: any[] = []
        data.data.findProduct.product_categories.map((value: any) => {
          let categoryList = dropDownData.categoryList;
          let subCategoryList = []
          let subSubCategoryList = []
          if (value.id_sub_sub_category) {
            subCategoryList = categoryList.filter((t: any) => parseInt(t.parent_id) === parseInt(value.id_category));
            subSubCategoryList = categoryList.filter((t: any) => parseInt(t.parent_id) === parseInt(value.id_sub_category));
          }
          else {
            subCategoryList = categoryList.filter((t: any) => parseInt(t.parent_id) === parseInt(value.id_category));
          }

          const data = {
            category: value.id_category,
            subCategory: value.id_sub_category,
            subSubCategory: value.id_sub_sub_category,
            categoryList: categoryList,
            subCategoryList: subCategoryList,
            subSubCategoryList: subSubCategoryList,
            id: value.id,
            isDeleted: 0
          }
          arrCategories.push(data)

        })
        setInputFields(arrCategories)

        //Gold Calculations

        const metalList = dropDownData.metal_list;
        const goldMetalRate = metalList.filter((m: any) => parseInt(m.id) === 1)[0].metal_rate;
        let arrMetalKarat: any[] = []
        const metalKarat = dropDownData.metal_karat || []
        const metalTone = dropDownData.metal_tone as number[] || []
        let checkedValues = {}
        data.data.findProduct.PMO.filter(((t: any) => t.id_karat !== null)).map((value: any) => {

          const id_metal_tone = value.metal_tone ? value.metal_tone as number[] : [];
          var idMetalTonesNumber = id_metal_tone.map((t: any) => {
            return parseInt(t)
          });
          const selectedMetalTones = metalTone?.filter((r: any) => {
            if (idMetalTonesNumber.indexOf(parseInt(r.id)) >= 0) return r;
          });
          const karatValue = metalKarat.filter((x: any) => parseInt(x.id) === parseInt(value.id_karat))[0].name;

          const rate = ((parseFloat(goldMetalRate) / 31.104) * ((parseInt(karatValue) / 24))).toFixed(2)
          const data = {
            karat: karatValue,
            id_karat: value.id_karat,
            tone: selectedMetalTones,
            price: '',
            rate: rate,
            id: value.id,
            metal_weight: value.metal_weight,
            metal_tone: metalTone
          }
          arrMetalKarat.push(data)

        })

        const selectedKarats = arrMetalKarat.map((t: any) => parseInt(t.id_karat));
        const arrNotExitsKarats = metalKarat.filter((x: any) => selectedKarats.indexOf(parseInt(x.id)) === -1);
        arrNotExitsKarats.map((value: any) => {
          const rate = ((parseFloat(goldMetalRate) / 31.104) * ((parseInt(value.name) / 24))).toFixed(2)
          const data = {
            karat: value.name,
            id_karat: value.id,
            tone: [],
            price: '',
            rate: rate,
            id: 0,
            metal_weight: '',
            metal_tone: metalTone
          }
          arrMetalKarat.push(data)
        });


        if (arrMetalKarat.length > 0) {
          setInputFieldGoldMetal(arrMetalKarat)
        }
        if (arrMetalKarat.length > 0) {
          checkedValues = {
            [1]: true
          }
        }


        //Silver Metal

        arrMetalKarat = []
        const silverRate = metalList.filter((m: any) => parseInt(m.id) === 2)[0].metal_rate;
        data.data.findProduct.PMO.filter(((t: any) => (parseInt(t.id_metal) === 2))).map((value: any) => {

          const id_metal_tone = value.id_metal_tone ? value.id_metal_tone.split("|") as number[] : [];
          var idMetalTonesNumber = id_metal_tone.map((t: any) => {
            return parseInt(t)
          });
          const selectedMetalTones = metalTone?.filter((r: any) => {
            if (idMetalTonesNumber.indexOf(parseInt(r.id)) >= 0) return r;
          });

          const data = {
            karat: '',
            id_karat: value.id_karat,
            tone: selectedMetalTones,
            price: '',
            rate: silverRate,
            id: value.id,
            metal_weight: value.metal_weight,
            metal_tone: metalTone
          }
          arrMetalKarat.push(data)
        })
        if (arrMetalKarat.length > 0) {
          setInputFieldSilverMetal(arrMetalKarat)
        }
        if (arrMetalKarat.length > 0) {
          checkedValues = {
            ...checkedValues,
            [2]: true
          }
        }

        //Platinum
        arrMetalKarat = []
        const platinumRate = metalList.filter((m: any) => parseInt(m.id) === 3)[0].metal_rate;
        data.data.findProduct.PMO.filter(((t: any) => (parseInt(t.id_metal) === 3))).map((value: any) => {

          const id_metal_tone = value.metal_tone ? value.metal_tone as number[] : [];
          var idMetalTonesNumber = id_metal_tone.map((t: any) => {
            return parseInt(t)
          });
          const selectedMetalTones = metalTone?.filter((r: any) => {
            if (idMetalTonesNumber.indexOf(parseInt(r.id)) >= 0) return r;
          });

          const data = {
            karat: '',
            id_karat: value.id_karat,
            tone: selectedMetalTones,
            price: '',
            rate: platinumRate,
            id: value.id,
            metal_weight: value.metal_weight,
            metal_tone: metalTone
          }
          arrMetalKarat.push(data)
        })
        if (arrMetalKarat.length > 0) {
          setInputFieldPlatinumMetal(arrMetalKarat)
        }
        if (arrMetalKarat.length > 0) {
          checkedValues = {
            ...checkedValues,
            [3]: true
          }
        }
        setChecked(checkedValues)
        const product_diamond = data.data.findProduct.PDO.map((value: any) => {
          const diamondRate = dropDownData.diamond_master.filter((t: any) =>
            t.id_cuts == value.rate.id_cuts &&
            t.id_clarity == value.rate.id_clarity &&
            t.id_stone == value.rate.id_stone &&
            t.id_shape == value.rate.id_shape &&
            t.id_mm_size == value.rate.id_mm_size &&
            t.id_color == value.rate.id_color

          )


          const selectedRate = diamondRate.length > 0 ? diamondRate.map((t: any) => t.rate)[0] : ""
          const data = {
            // default: value.is_default,
            id_diamond_group: value.id_diamond_group,
            diamondGroup: value.id_diamond_group,
            stone: value.rate.id_stone,
            Stone_type: value.id_type,
            Stone_weight: value.weight,
            stone_cut: value.rate.id_cuts,
            stone_color: value.rate.id_color,
            stone_mm_size: value.rate.id_mm_size,
            stone_clarity: value.rate.id_clarity,
            stone_shape: value.rate.id_shape,
            stone_count: value.count,
            stone_setting: value.id_setting,
            rate: selectedRate,
            price: "",
            id: value.id,
            isDeleted: 0
          }


          return data
        })
        setInputFieldsDiamond(product_diamond)
      } else {

        return toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }

  const fetchDiamondGroupsWithDetails = async () => {
    try {
      const response = await GET_DIAMOND_GROUP_MASTER_WITH_DETAILS();
      if (response.code === 200 || response.code === "200") {
        setDiamondGroupsWithDetails(response.data);
      } else {
        toast.error(response.message || "Failed to fetch diamond groups");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
    }
  };

  const getAllDropDownData = async (productDetailId: string) => {

    try {
      const data = await ADD_PRODUCT_DROPDOWN_LIST();
      if (data.code === 200 || data.code === "200") {
        const categoryData = data.data.categoryList.filter((t: any) => t.parent_id === null)
        setKeywordsList(data.data.keyWords)
        inputFields.map((value) => value.categoryList = categoryData)
        setCategorysList(data.data.categoryList)
        setSettingTypeList(data.data.setting_type_list)
        setItemLengthList(data.data.item_length)
        setItemSizeList(data.data.item_size)
        setMetalGroupList(data.data.metal_list)
        setDiamondGroupList(data.data.diamond_master)
        setStoneSettingList(data.data.stone_setting)
        setMetalToneList(data.data.metal_tone.filter((m: any) => parseInt(m.id_metal) === MEATL_GOLD_ID))
        setSilverToneList(data.data.metal_tone.filter((m: any) => parseInt(m.id_metal) === MEATL_SILVER_ID))
        setPaltinumToneList(data.data.metal_tone.filter((m: any) => parseInt(m.id_metal) === MEATL_PLATINUM_ID))
        setStoneShapeList(data.data.stone_shape)
        setStoneList(data.data.stone)
        setStoneMMSize(data.data.MM_Size)
        setStoneColor(data.data.stone_color)
        setStoneClarity(data.data.stone_clarity)
        setStoneCuts(data.data.stone_cut)
        setMetalKaratList(data.data.metal_karat)

        // Fetch diamond groups with details
        fetchDiamondGroupsWithDetails();

        const product_metal_gold = data.data.metal_karat.map((value: any) => {
          const gold = {
            karat: value.name,
            id_karat: value.id,
            tone: [{ id: null, name: "" }],
            price: '',
            rate: ((data.data.metal_list[0].metal_rate / 31.104) * (value.name / 24)).toFixed(2), id: 0, metal_tone: data.data.metal_tone
          }

          return gold
        })
        setInputFieldGoldMetal(product_metal_gold)

        const silverRate = data.data.metal_list[1].metal_rate
        const platinumRate = data.data.metal_list[2].metal_rate

        const dataDisplay = [...inputFieldSilverMetal]

        inputFieldSilverMetal.map((value: any, index) => {

          dataDisplay[index].rate = silverRate
          dataDisplay[index].metal_tone = silverToneList

        })
        setInputFieldSilverMetal(dataDisplay)

        const dataPlatinum = [...inputFieldPlatinumMetal]
        inputFieldPlatinumMetal.map((value: any, index) => {

          dataPlatinum[index].rate = platinumRate
          dataPlatinum[index].metal_tone = paltinumToneList

        })
        setInputFieldPlatinumMetal(dataPlatinum)

        if (productDetailId && productDetailId != undefined) {
          getByIdProductData(data.data, productDetailId)
        }

      } else {

        return toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }

  // const addProductDetails = async () => {
  //   const payload = {
  //     "id_product": 0,
  //     "name": productName,
  //     "sku": productSKU,
  //     "sort_description": productSortDes,
  //     "long_description": productLongDes,
  //     "tag": keyword.map((id) => id.id)[0] != null ? keyword.map((id) => id.id) : null,
  //     "product_categories": inputFields.map((value) => {
  //       let data = {};
  //       if (value.subCategory != null && value.subSubCategory != null) {
  //         data = {
  //           "id": value.id,
  //           "id_category": value.category,
  //           "id_sub_category": value.subCategory,
  //           "id_sub_sub_category": value.subSubCategory,
  //         }
  //       } else if (value.subCategory == null) {
  //         data = {
  //           "id": value.id,
  //           "id_category": value.category,
  //         }
  //       } else {
  //         if (value.subSubCategory == null) {
  //           data = {
  //             "id": value.id,
  //             "id_category": value.category,
  //             "id_sub_category": value.subCategory,
  //           }
  //         }
  //       }
  //       return data
  //     })
  //     "making_charge": marketingCharge,
  //   }
  // }
  const addProductBasicDetails = async () => {
    const payload = {
      "id_product": 0,
      "name": productName,
      "sku": productSKU,
      "sort_description": productSortDes,
      "long_description": productLongDes,
      "tag": keyword.map((id) => id.id)[0] != null ? keyword.map((id) => id.id) : null,
      "product_categories": inputFields.map((value) => {
        let data = {};
        if (value.subCategory != null && value.subSubCategory != null) {
          data = {
            "id": value.id,
            "id_category": value.category,
            "id_sub_category": value.subCategory,
            "id_sub_sub_category": value.subSubCategory
          }
        } else if (value.subCategory == null) {
          data = {
            "id": value.id,
            "id_category": value.category,
          }
        } else {
          if (value.subSubCategory == null) {
            data = {
              "id": value.id,
              "id_category": value.category,
              "id_sub_category": value.subCategory,
            }
          }
        }

        return data
      }),
      "making_charge": marketingCharge,
      "finding_charge": findingCharge,
      "other_charge": otherCharge
    }

    try {
      const data = await ADD_PRODUCT_BASIC_DETAILS(payload);
      if (data.code === 200 || data.code === "200") {
        setProductId(data.data)
        addProductMetalDiamoundDetails(data.data)

      } else {

        return toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }

  const addProductMetalDiamoundDetails = async (data: any) => {
    let payload = {}

    if (checked['1' as keyof typeof checked] === true && checked['2' as keyof typeof checked] === true && checked['3' as keyof typeof checked] === true) {
      // if (settingType.map((id) => id.id)[0] == null) {
      payload = {
        "id_product": data,
        "settingStyleType": settingType.map((id) => id.id)[0] == null ? false : settingType.map((id) => id.id),
        "size": itemSize.map((value) => value.id)[0] == null ? false : itemSize.map((value) => value.id),
        "length": itemLength.map((value) => value.id)[0] == null ? false : itemLength.map((value) => value.id),
        "product_Gold_metal_options": inputFieldGoldMetal.map((value) => {

          const data = {
            "id": value.id,
            "metal_weight": value.metal_weight,
            "id_metal_tone": value.tone.map((t: any) => t.id),
            "id_karat": value.id_karat,
            "id_metal": checked['1' as keyof typeof checked] === true && 1
          }
          return data
        }),
        "product_silver_options": inputFieldSilverMetal.map((value) => {
          const data = {
            "id": value.id,
            "metal_weight": value.metal_weight,
            "id_metal_tone": value.tone.map((t: any) => t.id),
            "id_metal": checked['2' as keyof typeof checked] === true && 2
          }
          return data
        }),

        "product_platinum_options": inputFieldPlatinumMetal.map((value) => {
          const data = {
            "id": value.id,
            "metal_weight": value.metal_weight,
            "id_metal_tone": value.tone.map((t: any) => t.id),
            "id_metal": checked['3' as keyof typeof checked] === true && 3
          }
          return data
        }),
        "product_diamond_options": inputFieldsDiamond.map((value: any) => {
          const data = {
            "id": value.id,
            "id_type": value.Stone_type,
            "id_setting": value.stone_setting,
            "weight": value.Stone_weight,
            "count": value.stone_count,
            "is_default": value.default,
            "id_diamond_group": value.id_diamond_group,
            "id_diamond_group": value.id_diamond_group,
            "id_stone": value.stone,
            "id_shape": value.stone_shape,
            "id_mm_size": value.stone_mm_size,
            "id_color": value.stone_color,
            "id_clarity": value.stone_clarity,
            "id_cuts": value.stone_cut
          }
          return data
        })

      }

    } else if (checked['1' as keyof typeof checked] === true && checked['2' as keyof typeof checked]) {
      payload = {
        "id_product": data,
        "settingStyleType": settingType.map((id) => id.id)[0] == null ? false : settingType.map((id) => id.id),
        "size": itemSize.map((value) => value.id)[0] == null ? false : itemSize.map((value) => value.id),
        "length": itemLength.map((value) => value.id)[0] == null ? false : itemLength.map((value) => value.id),
        "product_Gold_metal_options": inputFieldGoldMetal.map((value) => {
          const data = {
            "id": value.id,
            "metal_weight": value.metal_weight,
            "id_metal_tone": value.tone.map((t: any) => t.id),
            "id_karat": value.id_karat,
            "id_metal": checked['1' as keyof typeof checked] === true && 1
          }
          return data
        }),
        "product_silver_options": inputFieldSilverMetal.map((value) => {
          const data = {
            "id": value.id,
            "metal_weight": value.metal_weight,
            "id_metal_tone": value.tone.map((t: any) => t.id),
            "id_metal": checked['2' as keyof typeof checked] === true && 2
          }
          return data
        }),
        "product_diamond_options": inputFieldsDiamond.map((value: any) => {
          const data = {
            "id": value.id,
            "id_type": value.Stone_type,
            "id_setting": value.stone_setting,
            "weight": value.Stone_weight,
            "count": value.stone_count,
            "is_default": value.default,
            "id_diamond_group": value.id_diamond_group,
            "id_diamond_group": value.id_diamond_group,
            "id_stone": value.stone,
            "id_shape": value.stone_shape,
            "id_mm_size": value.stone_mm_size,
            "id_color": value.stone_color,
            "id_clarity": value.stone_clarity,
            "id_cuts": value.stone_cut
          }
          return data
        })
      }
    } else if (checked['1' as keyof typeof checked] === true && checked['3' as keyof typeof checked]) {

      payload = {
        "id_product": data,
        "settingStyleType": settingType.map((id) => id.id)[0] == null ? false : settingType.map((id) => id.id),
        "size": itemSize.map((value) => value.id)[0] == null ? false : itemSize.map((value) => value.id),
        "length": itemLength.map((value) => value.id)[0] == null ? false : itemLength.map((value) => value.id),
        "product_Gold_metal_options": inputFieldGoldMetal.map((value) => {
          const data = {
            "id": value.id,
            "metal_weight": value.metal_weight,
            "id_metal_tone": value.tone.map((t: any) => t.id),
            "id_karat": value.id_karat,
            "id_metal": checked['1' as keyof typeof checked] === true && 1
          }
          return data
        }),

        "product_platinum_options": inputFieldPlatinumMetal.map((value) => {
          const data = {
            "id": value.id,
            "metal_weight": value.metal_weight,
            "id_metal_tone": value.tone.map((t: any) => t.id),
            "id_metal": checked['3' as keyof typeof checked] === true && 3
          }
          return data
        }),
        "product_diamond_options": inputFieldsDiamond.map((value: any) => {
          const data = {
            "id": value.id,
            "id_type": value.Stone_type,
            "id_setting": value.stone_setting,
            "weight": value.Stone_weight,
            "count": value.stone_count,
            "is_default": value.default,
            "id_diamond_group": value.id_diamond_group,
            "id_stone": value.stone,
            "id_shape": value.stone_shape,
            "id_mm_size": value.stone_mm_size,
            "id_color": value.stone_color,
            "id_clarity": value.stone_clarity,
            "id_cuts": value.stone_cut
          }
          return data
        })
      }
    } else if (checked['2' as keyof typeof checked] === true && checked['3' as keyof typeof checked]) {

      payload = {
        "id_product": data,
        "settingStyleType": settingType.map((id) => id.id)[0] == null ? false : settingType.map((id) => id.id),
        "size": itemSize.map((value) => value.id)[0] == null ? false : itemSize.map((value) => value.id),
        "length": itemLength.map((value) => value.id)[0] == null ? false : itemLength.map((value) => value.id),

        "product_silver_options": inputFieldSilverMetal.map((value) => {
          const data = {
            "id": value.id,
            "metal_weight": value.metal_weight,
            "id_metal_tone": value.tone.map((t: any) => t.id),
            "id_metal": checked['2' as keyof typeof checked] === true && 2
          }
          return data
        }),

        "product_platinum_options": inputFieldPlatinumMetal.map((value) => {
          const data = {
            "id": value.id,
            "metal_weight": value.metal_weight,
            "id_metal_tone": value.tone.map((t: any) => t.id),
            "id_metal": checked['3' as keyof typeof checked] === true && 3
          }
          return data
        }),
        "product_diamond_options": inputFieldsDiamond.map((value: any) => {
          const data = {
            "id": value.id,
            "id_type": value.Stone_type,
            "id_setting": value.stone_setting,
            "weight": value.Stone_weight,
            "count": value.stone_count,
            "is_default": value.default,
            "id_diamond_group": value.id_diamond_group,
            "id_stone": value.stone,
            "id_shape": value.stone_shape,
            "id_mm_size": value.stone_mm_size,
            "id_color": value.stone_color,
            "id_clarity": value.stone_clarity,
            "id_cuts": value.stone_cut
          }
          return data
        })
      }
    } else {
      if (checked['1' as keyof typeof checked] === true) {

        payload = {
          "id_product": data,
          "settingStyleType": settingType.map((id) => id.id)[0] == null ? false : settingType.map((id) => id.id),
          "size": itemSize.map((value) => value.id)[0] == null ? false : itemSize.map((value) => value.id),
          "length": itemLength.map((value) => value.id)[0] == null ? false : itemLength.map((value) => value.id),
          "product_Gold_metal_options": inputFieldGoldMetal.map((value) => {
            const data = {
              "id": value.id,
              "metal_weight": value.metal_weight,
              "id_metal_tone": value.tone && value.tone.map((t: any) => t.id),
              "id_karat": value.id_karat,
              "id_metal": checked['1' as keyof typeof checked] === true && 1
            }
            return data
          }),
          "product_diamond_options": inputFieldsDiamond.map((value: any) => {
            const data = {
              "id": value.id,
              "id_type": value.Stone_type,
              "id_setting": value.stone_setting,
              "weight": value.Stone_weight,
              "count": value.stone_count,
              "is_default": value.default,
              "id_diamond_group": value.id_diamond_group,
            "id_stone": value.stone,
              "id_shape": value.stone_shape,
              "id_mm_size": value.stone_mm_size,
              "id_color": value.stone_color,
              "id_clarity": value.stone_clarity,
              "id_cuts": value.stone_cut
            }
            return data
          })

        }
      }

      if (checked['2' as keyof typeof checked] === true) {
        payload = {
          "id_product": data,
          "settingStyleType": settingType.map((id) => id.id)[0] == null ? false : settingType.map((id) => id.id),
          "size": itemSize.map((value) => value.id)[0] == null ? false : itemSize.map((value) => value.id),
          "length": itemLength.map((value) => value.id)[0] == null ? false : itemLength.map((value) => value.id),

          "product_silver_options": inputFieldSilverMetal.map((value) => {
            const data = {
              "id": value.id,
              "metal_weight": value.metal_weight,
              "id_metal_tone": value.tone.map((t: any) => t.id),
              "id_metal": checked['2' as keyof typeof checked] === true && 2
            }
            return data
          }),
          "product_diamond_options": inputFieldsDiamond.map((value: any) => {
            const data = {
              "id": value.id,
              "id_type": value.Stone_type,
              "id_setting": value.stone_setting,
              "weight": value.Stone_weight,
              "count": value.stone_count,
              "is_default": value.default,
              "id_diamond_group": value.id_diamond_group,
            "id_stone": value.stone,
              "id_shape": value.stone_shape,
              "id_mm_size": value.stone_mm_size,
              "id_color": value.stone_color,
              "id_clarity": value.stone_clarity,
              "id_cuts": value.stone_cut
            }
            return data
          })
        }
      }
      if (checked['3' as keyof typeof checked] === true) {

        payload = {
          "id_product": data,
          "settingStyleType": settingType.map((id) => id.id)[0] == null ? false : settingType.map((id) => id.id),
          "size": itemSize.map((value) => value.id)[0] == null ? false : itemSize.map((value) => value.id),
          "length": itemLength.map((value) => value.id)[0] == null ? false : itemLength.map((value) => value.id),

          "product_platinum_options": inputFieldPlatinumMetal.map((value) => {
            const data = {
              "id": value.id,
              "metal_weight": value.metal_weight,
              "id_metal_tone": value.tone.map((t: any) => t.id),
              "id_metal": checked['3' as keyof typeof checked] === true && 3
            }

            return data
          }),
          "product_diamond_options": inputFieldsDiamond.map((value: any) => {
            const data = {
              "id": value.id,
              "id_type": value.Stone_type,
              "id_setting": value.stone_setting,
              "weight": value.Stone_weight,
              "count": value.stone_count,
              "is_default": value.default,
              "id_diamond_group": value.id_diamond_group,
            "id_stone": value.stone,
              "id_shape": value.stone_shape,
              "id_mm_size": value.stone_mm_size,
              "id_color": value.stone_color,
              "id_clarity": value.stone_clarity,
              "id_cuts": value.stone_cut
            }
            return data
          })
        }
      }

    }

    try {
      const data = await ADD_PRODUCT_MRTAL_DATA(payload);
      if (data.code === 200 || data.code === "200") {
        setActiveStep(prevActiveStep => prevActiveStep + 1)
        if (activeStep === steps.length - 1) {
          return toast.success('Form Submitted')
        }
      } else {

        return toast.error(data.message);

      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }

  const addProductDetails = async () => {
    try {
      // Validate required fields
      if (!productName || !productSKU || !productSortDes || !productLongDes) {
        return toast.error("Please fill all required product details");
      }

      // Validate categories
      if (!inputFields || inputFields.length === 0 || !inputFields[0].category) {
        return toast.error("Please select at least one category");
      }

      // Validate diamond options if any are present
      if (inputFieldsDiamond && inputFieldsDiamond.length > 0) {
        const hasDiamondOptions = inputFieldsDiamond.some(option =>
          option.stone || option.stone_shape || option.Stone_type || option.stone_setting);

        if (hasDiamondOptions) {
          const invalidDiamondOptions = inputFieldsDiamond.filter(option =>
            !option.stone || !option.stone_shape);

          if (invalidDiamondOptions.length > 0) {
            return toast.error("Please complete all diamond details or remove incomplete ones");
          }
        }
      }

      const payload1 = {
        "id_product": productId,
        "name": productName,
        "sku": productSKU,
        "sort_description": productSortDes,
        "long_description": productLongDes,
        "tag": keyword.map((id) => id.id)[0] != null ? keyword.map((id) => id.id) : null,
        "gender": gender.map((id) => id.id)[0] == null ? false : gender.map((id) => id.id),
        "product_categories": inputFields.map((value) => {
          let data = {};
          if (value.subCategory != null && value.subSubCategory != null) {
            data = {
              "id": value.id,
              "id_category": value.category,
              "id_sub_category": value.subCategory,
              "id_sub_sub_category": value.subSubCategory
            }
          } else if (value.subCategory == null) {
            data = {
              "id": value.id,
              "id_category": value.category,
            }
          } else {
            if (value.subSubCategory == null) {
              data = {
                "id": value.id,
                "id_category": value.category,
                "id_sub_category": value.subCategory,
              }
            }
          }

          return data
        }),
        "making_charge": marketingCharge,
        "finding_charge": findingCharge,
        "other_charge": otherCharge
      }

      let payload = {}

      if (checked['1' as keyof typeof checked] === true && checked['2' as keyof typeof checked] === true && checked['3' as keyof typeof checked] === true) {
        // if (settingType.map((id) => id.id)[0] == null) {
        payload = {
          "settingStyleType": settingType.map((id) => id.id)[0] == null ? false : settingType.map((id) => id.id),
          "size": itemSize.map((value) => value.id)[0] == null ? false : itemSize.map((value) => value.id),
          "length": itemLength.map((value) => value.id)[0] == null ? false : itemLength.map((value) => value.id),
          "product_Gold_metal_options": inputFieldGoldMetal.map((value) => {

            const data = {
              "id": value.id,
              "metal_weight": value.metal_weight,
              "id_metal_tone": value.tone.map((t: any) => t.id),
              "id_karat": value.id_karat,
              "id_metal": checked['1' as keyof typeof checked] === true && 1
            }
            return data
          }),
          "product_silver_options": inputFieldSilverMetal.map((value) => {
            const data = {
              "id": value.id,
              "metal_weight": value.metal_weight,
              "id_metal_tone": value.tone.map((t: any) => t.id),
              "id_metal": checked['2' as keyof typeof checked] === true && 2
            }
            return data
          }),

          "product_platinum_options": inputFieldPlatinumMetal.map((value) => {
            const data = {
              "id": value.id,
              "metal_weight": value.metal_weight,
              "id_metal_tone": value.tone.map((t: any) => t.id),
              "id_metal": checked['3' as keyof typeof checked] === true && 3
            }
            return data
          }),

          "product_diamond_options": inputFieldsDiamond.map((value: any) => {
            const data = {
              "id": value.id,
              "id_type": value.Stone_type,
              "id_setting": value.stone_setting,
              "weight": value.Stone_weight,
              "count": value.stone_count,
              "is_default": value.default,
              "id_diamond_group": value.id_diamond_group,
            "id_stone": value.stone,
              "id_shape": value.stone_shape,
              "id_mm_size": value.stone_mm_size,
              "id_color": value.stone_color,
              "id_clarity": value.stone_clarity,
              "id_cuts": value.stone_cut
            }
            return data
          })

        }

      } else if (checked['1' as keyof typeof checked] === true && checked['2' as keyof typeof checked]) {
        payload = {
          "settingStyleType": settingType.map((id) => id.id)[0] == null ? false : settingType.map((id) => id.id),
          "size": itemSize.map((value) => value.id)[0] == null ? false : itemSize.map((value) => value.id),
          "length": itemLength.map((value) => value.id)[0] == null ? false : itemLength.map((value) => value.id),
          "product_Gold_metal_options": inputFieldGoldMetal.map((value) => {
            const data = {
              "id": value.id,
              "metal_weight": value.metal_weight,
              "id_metal_tone": value.tone.map((t: any) => t.id),
              "id_karat": value.id_karat,
              "id_metal": checked['1' as keyof typeof checked] === true && 1
            }
            return data
          }),
          "product_silver_options": inputFieldSilverMetal.map((value) => {
            const data = {
              "id": value.id,
              "metal_weight": value.metal_weight,
              "id_metal_tone": value.tone.map((t: any) => t.id),
              "id_metal": checked['2' as keyof typeof checked] === true && 2
            }
            return data
          }),
          "product_diamond_options": inputFieldsDiamond.map((value: any) => {
            const data = {
              "id": value.id,
              "id_type": value.Stone_type,
              "id_setting": value.stone_setting,
              "weight": value.Stone_weight,
              "count": value.stone_count,
              "is_default": value.default,
              "id_diamond_group": value.id_diamond_group,
            "id_stone": value.stone,
              "id_shape": value.stone_shape,
              "id_mm_size": value.stone_mm_size,
              "id_color": value.stone_color,
              "id_clarity": value.stone_clarity,
              "id_cuts": value.stone_cut
            }
            return data
          })
        }
      } else if (checked['1' as keyof typeof checked] === true && checked['3' as keyof typeof checked]) {

        payload = {
          "settingStyleType": settingType.map((id) => id.id)[0] == null ? false : settingType.map((id) => id.id),
          "size": itemSize.map((value) => value.id)[0] == null ? false : itemSize.map((value) => value.id),
          "length": itemLength.map((value) => value.id)[0] == null ? false : itemLength.map((value) => value.id),
          "product_Gold_metal_options": inputFieldGoldMetal.map((value) => {
            const data = {
              "id": value.id,
              "metal_weight": value.metal_weight,
              "id_metal_tone": value.tone.map((t: any) => t.id),
              "id_karat": value.id_karat,
              "id_metal": checked['1' as keyof typeof checked] === true && 1
            }
            return data
          }),

          "product_platinum_options": inputFieldPlatinumMetal.map((value) => {
            const data = {
              "id": value.id,
              "metal_weight": value.metal_weight,
              "id_metal_tone": value.tone.map((t: any) => t.id),
              "id_metal": checked['3' as keyof typeof checked] === true && 3
            }
            return data
          }),
          "product_diamond_options": inputFieldsDiamond.map((value: any) => {
            const data = {
              "id": value.id,
              "id_type": value.Stone_type,
              "id_setting": value.stone_setting,
              "weight": value.Stone_weight,
              "count": value.stone_count,
              "is_default": value.default,
              "id_diamond_group": value.id_diamond_group,
            "id_stone": value.stone,
              "id_shape": value.stone_shape,
              "id_mm_size": value.stone_mm_size,
              "id_color": value.stone_color,
              "id_clarity": value.stone_clarity,
              "id_cuts": value.stone_cut
            }
            return data
          })
        }
      } else if (checked['2' as keyof typeof checked] === true && checked['3' as keyof typeof checked]) {

        payload = {
          "settingStyleType": settingType.map((id) => id.id)[0] == null ? false : settingType.map((id) => id.id),
          "size": itemSize.map((value) => value.id)[0] == null ? false : itemSize.map((value) => value.id),
          "length": itemLength.map((value) => value.id)[0] == null ? false : itemLength.map((value) => value.id),

          "product_silver_options": inputFieldSilverMetal.map((value) => {
            const data = {
              "id": value.id,
              "metal_weight": value.metal_weight,
              "id_metal_tone": value.tone.map((t: any) => t.id),
              "id_metal": checked['2' as keyof typeof checked] === true && 2
            }
            return data
          }),

          "product_platinum_options": inputFieldPlatinumMetal.map((value) => {
            const data = {
              "id": value.id,
              "metal_weight": value.metal_weight,
              "id_metal_tone": value.tone.map((t: any) => t.id),
              "id_metal": checked['3' as keyof typeof checked] === true && 3
            }
            return data
          }),
          "product_diamond_options": inputFieldsDiamond.map((value: any) => {
            const data = {
              "id": value.id,
              "id_type": value.Stone_type,
              "id_setting": value.stone_setting,
              "weight": value.Stone_weight,
              "count": value.stone_count,
              "is_default": value.default,
              "id_diamond_group": value.id_diamond_group,
            "id_stone": value.stone,
              "id_shape": value.stone_shape,
              "id_mm_size": value.stone_mm_size,
              "id_color": value.stone_color,
              "id_clarity": value.stone_clarity,
              "id_cuts": value.stone_cut
            }
            return data
          })
        }
      } else {
        if (checked['1' as keyof typeof checked] === true) {

          payload = {
            "settingStyleType": settingType.map((id) => id.id)[0] == null ? false : settingType.map((id) => id.id),
            "size": itemSize.map((value) => value.id)[0] == null ? false : itemSize.map((value) => value.id),
            "length": itemLength.map((value) => value.id)[0] == null ? false : itemLength.map((value) => value.id),
            "product_Gold_metal_options": inputFieldGoldMetal.map((value) => {
              const data = {
                "id": value.id,
                "metal_weight": value.metal_weight,
                "id_metal_tone": value.tone && value.tone.map((t: any) => t.id),
                "id_karat": value.id_karat,
                "id_metal": checked['1' as keyof typeof checked] === true && 1
              }
              return data
            }),
            "product_diamond_options": inputFieldsDiamond.map((value: any) => {
              const data = {
                "id": value.id,
                "id_type": value.Stone_type,
                "id_setting": value.stone_setting,
                "weight": value.Stone_weight,
                "count": value.stone_count,
                "is_default": value.default,
                "id_diamond_group": value.id_diamond_group,
            "id_stone": value.stone,
                "id_shape": value.stone_shape,
                "id_mm_size": value.stone_mm_size,
                "id_color": value.stone_color,
                "id_clarity": value.stone_clarity,
                "id_cuts": value.stone_cut
              }
              return data
            })

          }
        }

        if (checked['2' as keyof typeof checked] === true) {
          payload = {
            "settingStyleType": settingType.map((id) => id.id)[0] == null ? false : settingType.map((id) => id.id),
            "size": itemSize.map((value) => value.id)[0] == null ? false : itemSize.map((value) => value.id),
            "length": itemLength.map((value) => value.id)[0] == null ? false : itemLength.map((value) => value.id),

            "product_silver_options": inputFieldSilverMetal.map((value) => {
              const data = {
                "id": value.id,
                "metal_weight": value.metal_weight,
                "id_metal_tone": value.tone.map((t: any) => t.id),
                "id_metal": checked['2' as keyof typeof checked] === true && 2
              }
              return data
            }),
            "product_diamond_options": inputFieldsDiamond.map((value: any) => {
              const data = {
                "id": value.id,
                "id_type": value.Stone_type,
                "id_setting": value.stone_setting,
                "weight": value.Stone_weight,
                "count": value.stone_count,
                "is_default": value.default,
                "id_diamond_group": value.id_diamond_group,
            "id_stone": value.stone,
                "id_shape": value.stone_shape,
                "id_mm_size": value.stone_mm_size,
                "id_color": value.stone_color,
                "id_clarity": value.stone_clarity,
                "id_cuts": value.stone_cut
              }
              return data
            })
          }
        }
        if (checked['3' as keyof typeof checked] === true) {

          payload = {
            "settingStyleType": settingType.map((id) => id.id)[0] == null ? false : settingType.map((id) => id.id),
            "size": itemSize.map((value) => value.id)[0] == null ? false : itemSize.map((value) => value.id),
            "length": itemLength.map((value) => value.id)[0] == null ? false : itemLength.map((value) => value.id),

            "product_platinum_options": inputFieldPlatinumMetal.map((value) => {
              const data = {
                "id": value.id,
                "metal_weight": value.metal_weight,
                "id_metal_tone": value.tone.map((t: any) => t.id),
                "id_metal": checked['3' as keyof typeof checked] === true && 3
              }

              return data
            }),
            "product_diamond_options": inputFieldsDiamond.map((value: any) => {
              const data = {
                "id": value.id,
                "id_type": value.Stone_type,
                "id_setting": value.stone_setting,
                "weight": value.Stone_weight,
                "count": value.stone_count,
                "is_default": value.default,
                "id_diamond_group": value.id_diamond_group,
            "id_stone": value.stone,
                "id_shape": value.stone_shape,
                "id_mm_size": value.stone_mm_size,
                "id_color": value.stone_color,
                "id_clarity": value.stone_clarity,
                "id_cuts": value.stone_cut
              }
              return data
            })
          }
        }

      }

      let finalPayload = {
        ...payload1, ...payload
      }


      const data = await ADD_PRODUCT_DETAILS(finalPayload);
      if (data.code === 200 || data.code === "200") {
        toast.success(data.message)
        Router.push({ pathname: "/product/all-products" })
      } else {

        toast.error(data.message);
      }

    }
    catch (e: any) {
      toast.error(e.data.message);
    }
  }


  const editProductDetails = async () => {
    try {
      // Validate required fields
      if (!productName || !productSKU || !productSortDes || !productLongDes) {
        return toast.error("Please fill all required product details");
      }

      // Validate categories
      if (!inputFields || inputFields.length === 0 || !inputFields[0].category) {
        return toast.error("Please select at least one category");
      }

      // Validate diamond options if any are present
      if (inputFieldsDiamond && inputFieldsDiamond.length > 0) {
        const hasDiamondOptions = inputFieldsDiamond.some(option =>
          option.stone || option.stone_shape || option.Stone_type || option.stone_setting);

        if (hasDiamondOptions) {
          const invalidDiamondOptions = inputFieldsDiamond.filter(option =>
            !option.stone || !option.stone_shape);

          if (invalidDiamondOptions.length > 0) {
            return toast.error("Please complete all diamond details or remove incomplete ones");
          }
        }
      }

      const payload1 = {
        "id_product": productId,
        "name": productName,
        "sku": productSKU,
        "sort_description": productSortDes,
        "long_description": productLongDes,
        "tag": keyword.map((id) => id.id)[0] != null ? keyword.map((id) => id.id) : null,
        "gender": gender.map((id) => id.id)[0] == null ? false : gender.map((id) => id.id),
        "product_categories": inputFields.map((value) => {
          let data = {};
          if (value.subCategory != null && value.subSubCategory != null) {
            data = {
              "id": value.id,
              "id_category": value.category,
              "id_sub_category": value.subCategory,
              "id_sub_sub_category": value.subSubCategory
            }
          } else if (value.subCategory == null) {
            data = {
              "id": value.id,
              "id_category": value.category,
            }
          } else {
            if (value.subSubCategory == null) {
              data = {
                "id": value.id,
                "id_category": value.category,
                "id_sub_category": value.subCategory,
              }
            }
          }

          return data
        }),
        "making_charge": marketingCharge,
        "finding_charge": findingCharge,
        "other_charge": otherCharge
      }

      let payload = {}

      if (checked['1' as keyof typeof checked] === true && checked['2' as keyof typeof checked] === true && checked['3' as keyof typeof checked] === true) {
        // if (settingType.map((id) => id.id)[0] == null) {
        payload = {
          "settingStyleType": settingType.map((id) => id.id)[0] == null ? false : settingType.map((id) => id.id),
          "size": itemSize.map((value) => value.id)[0] == null ? false : itemSize.map((value) => value.id),
          "length": itemLength.map((value) => value.id)[0] == null ? false : itemLength.map((value) => value.id),
          "product_Gold_metal_options": inputFieldGoldMetal.map((value) => {

            const data = {
              "id": value.id,
              "metal_weight": value.metal_weight,
              "id_metal_tone": value.tone.map((t: any) => t.id),
              "id_karat": value.id_karat,
              "id_metal": checked['1' as keyof typeof checked] === true && 1
            }
            return data
          }),
          "product_silver_options": inputFieldSilverMetal.map((value) => {
            const data = {
              "id": value.id,
              "metal_weight": value.metal_weight,
              "id_metal_tone": value.tone.map((t: any) => t.id),
              "id_metal": checked['2' as keyof typeof checked] === true && 2
            }
            return data
          }),

          "product_platinum_options": inputFieldPlatinumMetal.map((value) => {
            const data = {
              "id": value.id,
              "metal_weight": value.metal_weight,
              "id_metal_tone": value.tone.map((t: any) => t.id),
              "id_metal": checked['3' as keyof typeof checked] === true && 3
            }
            return data
          }),
          "product_diamond_options": inputFieldsDiamond.map((value: any) => {
            const data = {
              "id": value.id,
              "id_type": value.Stone_type,
              "id_setting": value.stone_setting,
              "weight": value.Stone_weight,
              "count": value.stone_count,
              "is_default": value.default,
              "id_diamond_group": value.id_diamond_group,
            "id_stone": value.stone,
              "id_shape": value.stone_shape,
              "id_mm_size": value.stone_mm_size,
              "id_color": value.stone_color,
              "id_clarity": value.stone_clarity,
              "id_cuts": value.stone_cut
            }
            return data
          })

        }

      } else if (checked['1' as keyof typeof checked] === true && checked['2' as keyof typeof checked]) {
        payload = {
          "settingStyleType": settingType.map((id) => id.id)[0] == null ? false : settingType.map((id) => id.id),
          "size": itemSize.map((value) => value.id)[0] == null ? false : itemSize.map((value) => value.id),
          "length": itemLength.map((value) => value.id)[0] == null ? false : itemLength.map((value) => value.id),
          "product_Gold_metal_options": inputFieldGoldMetal.map((value) => {
            const data = {
              "id": value.id,
              "metal_weight": value.metal_weight,
              "id_metal_tone": value.tone.map((t: any) => t.id),
              "id_karat": value.id_karat,
              "id_metal": checked['1' as keyof typeof checked] === true && 1
            }
            return data
          }),
          "product_silver_options": inputFieldSilverMetal.map((value) => {
            const data = {
              "id": value.id,
              "metal_weight": value.metal_weight,
              "id_metal_tone": value.tone.map((t: any) => t.id),
              "id_metal": checked['2' as keyof typeof checked] === true && 2
            }
            return data
          }),
          "product_diamond_options": inputFieldsDiamond.map((value: any) => {
            const data = {
              "id": value.id,
              "id_type": value.Stone_type,
              "id_setting": value.stone_setting,
              "weight": value.Stone_weight,
              "count": value.stone_count,
              "is_default": value.default,
              "id_diamond_group": value.id_diamond_group,
            "id_stone": value.stone,
              "id_shape": value.stone_shape,
              "id_mm_size": value.stone_mm_size,
              "id_color": value.stone_color,
              "id_clarity": value.stone_clarity,
              "id_cuts": value.stone_cut
            }
            return data
          })
        }
      } else if (checked['1' as keyof typeof checked] === true && checked['3' as keyof typeof checked]) {

        payload = {
          "settingStyleType": settingType.map((id) => id.id)[0] == null ? false : settingType.map((id) => id.id),
          "size": itemSize.map((value) => value.id)[0] == null ? false : itemSize.map((value) => value.id),
          "length": itemLength.map((value) => value.id)[0] == null ? false : itemLength.map((value) => value.id),
          "product_Gold_metal_options": inputFieldGoldMetal.map((value) => {
            const data = {
              "id": value.id,
              "metal_weight": value.metal_weight,
              "id_metal_tone": value.tone.map((t: any) => t.id),
              "id_karat": value.id_karat,
              "id_metal": checked['1' as keyof typeof checked] === true && 1
            }
            return data
          }),

          "product_platinum_options": inputFieldPlatinumMetal.map((value) => {
            const data = {
              "id": value.id,
              "metal_weight": value.metal_weight,
              "id_metal_tone": value.tone.map((t: any) => t.id),
              "id_metal": checked['3' as keyof typeof checked] === true && 3
            }
            return data
          }),
          "product_diamond_options": inputFieldsDiamond.map((value: any) => {
            const data = {
              "id": value.id,
              "id_type": value.Stone_type,
              "id_setting": value.stone_setting,
              "weight": value.Stone_weight,
              "count": value.stone_count,
              "is_default": value.default,
              "id_diamond_group": value.id_diamond_group,
            "id_stone": value.stone,
              "id_shape": value.stone_shape,
              "id_mm_size": value.stone_mm_size,
              "id_color": value.stone_color,
              "id_clarity": value.stone_clarity,
              "id_cuts": value.stone_cut
            }
            return data
          })
        }
      } else if (checked['2' as keyof typeof checked] === true && checked['3' as keyof typeof checked]) {

        payload = {
          "settingStyleType": settingType.map((id) => id.id)[0] == null ? false : settingType.map((id) => id.id),
          "size": itemSize.map((value) => value.id)[0] == null ? false : itemSize.map((value) => value.id),
          "length": itemLength.map((value) => value.id)[0] == null ? false : itemLength.map((value) => value.id),

          "product_silver_options": inputFieldSilverMetal.map((value) => {
            const data = {
              "id": value.id,
              "metal_weight": value.metal_weight,
              "id_metal_tone": value.tone.map((t: any) => t.id),
              "id_metal": checked['2' as keyof typeof checked] === true && 2
            }
            return data
          }),

          "product_platinum_options": inputFieldPlatinumMetal.map((value) => {
            const data = {
              "id": value.id,
              "metal_weight": value.metal_weight,
              "id_metal_tone": value.tone.map((t: any) => t.id),
              "id_metal": checked['3' as keyof typeof checked] === true && 3
            }
            return data
          }),
          "product_diamond_options": inputFieldsDiamond.map((value: any) => {
            const data = {
              "id": value.id,
              "id_type": value.Stone_type,
              "id_setting": value.stone_setting,
              "weight": value.Stone_weight,
              "count": value.stone_count,
              "is_default": value.default,
              "id_diamond_group": value.id_diamond_group,
            "id_stone": value.stone,
              "id_shape": value.stone_shape,
              "id_mm_size": value.stone_mm_size,
              "id_color": value.stone_color,
              "id_clarity": value.stone_clarity,
              "id_cuts": value.stone_cut
            }
            return data
          })
        }
      } else {
        if (checked['1' as keyof typeof checked] === true) {

          payload = {
            "settingStyleType": settingType.map((id) => id.id)[0] == null ? false : settingType.map((id) => id.id),
            "size": itemSize.map((value) => value.id)[0] == null ? false : itemSize.map((value) => value.id),
            "length": itemLength.map((value) => value.id)[0] == null ? false : itemLength.map((value) => value.id),
            "product_Gold_metal_options": inputFieldGoldMetal.map((value) => {
              const data = {
                "id": value.id,
                "metal_weight": value.metal_weight,
                "id_metal_tone": value.tone && value.tone.map((t: any) => t.id),
                "id_karat": value.id_karat,
                "id_metal": checked['1' as keyof typeof checked] === true && 1
              }
              return data
            }),
            "product_diamond_options": inputFieldsDiamond.map((value: any) => {
              const data = {
                "id": value.id,
                "id_type": value.Stone_type,
                "id_setting": value.stone_setting,
                "weight": value.Stone_weight,
                "count": value.stone_count,
                "is_default": value.default,
                "id_diamond_group": value.id_diamond_group,
            "id_stone": value.stone,
                "id_shape": value.stone_shape,
                "id_mm_size": value.stone_mm_size,
                "id_color": value.stone_color,
                "id_clarity": value.stone_clarity,
                "id_cuts": value.stone_cut
              }
              return data
            })

          }
        }

        if (checked['2' as keyof typeof checked] === true) {
          payload = {
            "settingStyleType": settingType.map((id) => id.id)[0] == null ? false : settingType.map((id) => id.id),
            "size": itemSize.map((value) => value.id)[0] == null ? false : itemSize.map((value) => value.id),
            "length": itemLength.map((value) => value.id)[0] == null ? false : itemLength.map((value) => value.id),

            "product_silver_options": inputFieldSilverMetal.map((value) => {
              const data = {
                "id": value.id,
                "metal_weight": value.metal_weight,
                "id_metal_tone": value.tone.map((t: any) => t.id),
                "id_metal": checked['2' as keyof typeof checked] === true && 2
              }
              return data
            }),
            "product_diamond_options": inputFieldsDiamond.map((value: any) => {
              const data = {
                "id": value.id,
                "id_type": value.Stone_type,
                "id_setting": value.stone_setting,
                "weight": value.Stone_weight,
                "count": value.stone_count,
                "is_default": value.default,
                "id_diamond_group": value.id_diamond_group,
            "id_stone": value.stone,
                "id_shape": value.stone_shape,
                "id_mm_size": value.stone_mm_size,
                "id_color": value.stone_color,
                "id_clarity": value.stone_clarity,
                "id_cuts": value.stone_cut
              }
              return data
            })
          }
        }
        if (checked['3' as keyof typeof checked] === true) {

          payload = {
            "settingStyleType": settingType.map((id) => id.id)[0] == null ? false : settingType.map((id) => id.id),
            "size": itemSize.map((value) => value.id)[0] == null ? false : itemSize.map((value) => value.id),
            "length": itemLength.map((value) => value.id)[0] == null ? false : itemLength.map((value) => value.id),

            "product_platinum_options": inputFieldPlatinumMetal.map((value) => {
              const data = {
                "id": value.id,
                "metal_weight": value.metal_weight,
                "id_metal_tone": value.tone.map((t: any) => t.id),
                "id_metal": checked['3' as keyof typeof checked] === true && 3
              }

              return data
            }),
            "product_diamond_options": inputFieldsDiamond.map((value: any) => {
              const data = {
                "id": value.id,
                "id_type": value.Stone_type,
                "id_setting": value.stone_setting,
                "weight": value.Stone_weight,
                "count": value.stone_count,
                "is_default": value.default,
                "id_diamond_group": value.id_diamond_group,
            "id_stone": value.stone,
                "id_shape": value.stone_shape,
                "id_mm_size": value.stone_mm_size,
                "id_color": value.stone_color,
                "id_clarity": value.stone_clarity,
                "id_cuts": value.stone_cut
              }
              return data
            })
          }
        }

      }

      let finalPayload = {
        ...payload1, ...payload
      }


      const data = await EDIT_PRODUCT_DETAILS(finalPayload);
      if (data.code === 200 || data.code === "200") {
        toast.success(data.message)
        Router.push({ pathname: "/product/all-products" })
      } else {

        toast.error(data.message);
      }

    }
    catch (e: any) {
      toast.error(e.data.message);
    }
  }

  // Handle Stepper
  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }
  const handleNext = () => {
    if (productSizeLenghtFilter == null) {
      toast.error("please select category")
    } else {
      setActiveStep(prevActiveStep => prevActiveStep + 1)
      if (activeStep === steps.length - 1) {
        toast.success('Form Submitted')
      }
    }

  }

  const handleReset = () => {
    setProductName('')
    setProductSKU('')
    setProductSortDes('')
    setProductLongDes('')
    setMarketingCharge(0)
    setCategorysList([])
    setKeyword([{ id: null, name: "" }])
    setGender([{ id: null, name: "" }])
    inputFields.map((value) => value.category = null)
    inputFields.map((value) => value.subCategory = null)
    inputFields.map((value) => value.subSubCategory = null)
    setSettingType([{ id: null, name: "" }])
    setItemLength([{ id: null, length: "" }])
    setItemSize([{ id: null, size: "" }])
    inputFieldsGold.map((value) => value.metalGroup = "")
    inputFieldsGold.map((value) => value.weight = "")
    inputFieldsDiamond.map((value) => {
      value.diamondGroup = null
      value.Stone_type = null
      value.Stone_weight = 0
      value.stone_setting = null
      value.stone_count = 0
      value.default = '0',
        value.stone = null,
        value.stone_color = null,
        value.stone_clarity = null,
        value.stone_mm_size = null,
        value.stone_shape = null
    })
    inputFieldGoldMetal.map((value) => {
      value.id = 0,
        value.id_karat = null,
        value.karat = null,
        value.metal_weight = null,
        value.tone = []
    })

    setFindingCharge(0)
    setOtherCharge(0)
    setActiveStep(0)
    setCheckedSize(false)
    setCheckedLength(false)
  }

  // Handle repited
  const addFields = () => {
    const categoryData = categorysList.filter((t: any) => t.parent_id === null)
    const newfield = { category: null, subCategory: null, subSubCategory: null, categoryList: categoryData, subCategoryList: [], subSubCategoryList: [], id: 0, isDeleted: 0 }
    const data = [...inputFields, newfield]
    setInputFields(data)
    setCount(data.length)
  }

  const addGoldSettingFields = () => {
    const newfield = { rate: '', default: '0', price: '', weight: '', metalGroup: "", id: 0, isDeleted: 0 }
    const data = [...inputFieldsGold, newfield]
    setInputFieldsGold(data)
    setCount(data.length)
  }

  const addDiamondSettingFields = () => {
    const newfield = {
      default: '0',
      id_diamond_group: null,
      diamondGroup: null,
      Stone_type: "",
      Stone_weight: 0,
      stone_cut: null,
      stone_color: null,
      stone_clarity: null,
      stone_shape: "",
      stone: "",
      stone_count: 0,
      stone_setting: "",
      rate: 0,
      price: 0,
      stone_mm_size: null,
      id: 0,
      isDeleted: 0
    }
    const data = [...inputFieldsDiamond, newfield]
    setInputFieldsDiamond(data)
    setCount(data.length)
  }

  const removeFields = (index: any) => {

    const data = [...inputFields]
    data.splice(index, 1)
    setInputFields(data)
  }

  const removeGoldSettingFields = (index: any) => {

    const data = [...inputFieldsGold]
    data.splice(index, 1)
    setInputFieldsGold(data)
  }

  const removeDiamondSettingFields = (index: any) => {
    const data = [...inputFieldsDiamond]
    data.splice(index, 1)
    setInputFieldsDiamond(data)
  }

  const handleRadioChangeStripe = (event: ChangeEvent<HTMLInputElement>) => {
    setRadioButtonStripe((event.target as HTMLInputElement).value)
  }


  const handleChangeMetalDefaultValue = (event: ChangeEvent<HTMLInputElement>) => {
    inputFieldsGold.map((input, index) => {
      const data = [...inputFieldsGold]
      data[index].default = (event.target as HTMLInputElement).value === index.toString() ? "1" : "0"
      setInputFieldsGold(data)
    })
  }

  const handleChangeDiamoundDefaultValue = (event: ChangeEvent<HTMLInputElement>) => {
    inputFieldsDiamond.map((input, index) => {
      const data = [...inputFieldsDiamond]
      data[index].default = (event.target as HTMLInputElement).value === index.toString() ? "1" : "0"
      setInputFieldsDiamond(data)
    })
  }

  useEffect(() => {
    if (action == 'view') {
      setIsDisabled(true)
    } else {
      setIsDisabled(false)
    }
  }, [action])

  const getStepContent = (step: number) => {

    switch (step) {
      case 0:
        return (
          <Fragment>

            {/* <Grid item xs={12} sm={12}>
              <RadioGroup row value={radioButtonStripe} name='simple-radio' onChange={handleRadioChangeStripe} aria-label='simple-radio'>
                <FormControlLabel value='checked' control={<Radio />} label='Fixed Stone' />
                <FormControlLabel value='unchecked' control={<Radio />} label='API Based' />
                <FormControlLabel value='Both' control={<Radio />} label='Both' />
              </RadioGroup>
            </Grid> */}
            <Grid item xs={12} sm={6}>

              <TccInput
                InputProps={isDisabled}
                fullWidth
                label='Product SKU'
                value={productSKU}
                placeholder='ZG011AQA'
                onChange={(e: any) => setProductSKU(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TccInput
                InputProps={isDisabled}
                fullWidth
                type='text'
                label='Product Title'
                value={productName}
                placeholder=''
                onChange={(e: any) => setProductName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <TccInput
                InputProps={isDisabled}
                fullWidth
                type='text'
                label='Product Short Description'
                value={productSortDes}
                placeholder=''
                onChange={(e: any) => setProductSortDes(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <TccInput
                InputProps={isDisabled}
                multiline
                fullWidth
                label=" Product Long Description"
                value={productLongDes}
                row={4}
                onChange={(e: any) => setProductLongDes(e.target.value)}
              />
              {/* <TccEditor /> */}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                readOnly={isDisabled}
                fullWidth
                multiple
                options={keywordsList}
                value={keyword}
                onChange={(event, newItem) => {
                  setKeyword(newItem)
                }}
                filterSelectedOptions
                size='small'
                id='autocomplete-multiple-outlined'
                getOptionLabel={(option: any) => option.name}
                renderInput={(params: any) => <TextField {...params} label='Keywords' />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                readOnly={isDisabled}
                fullWidth
                multiple
                options={genderData}
                value={gender}
                onChange={(event, newItem) => {

                  setGender(newItem)
                }}
                filterSelectedOptions
                size='small'
                id='autocomplete-multiple-outlined'
                getOptionLabel={(option: any) => option.name}
                renderInput={(params: any) => <TextField {...params} label='Gender' />}
              />
            </Grid>

            {inputFields.map((input, index) => {
              return (
                <>
                  <Grid item xs={12} sm={4} key={"CAT_" + index}>
                    <TccSelect
                      InputProps={isDisabled}
                      sx={{ mb: 4 }}
                      fullWidth
                      inputLabel="Category"
                      label='Category'
                      value={input.category || ''}
                      id='controlled-select'
                      title='category_name'
                      onChange={(e: any) => {

                        const data = [...inputFields]
                        data[index].category = e.target.value
                        const subCategoryData = categorysList.filter((t: any) =>
                          t.parent_id === e.target.value
                        )
                        if (index === 0) {
                          const CategoryData: any = categorysList.filter((t: any) =>
                            t.id === e.target.value
                          )
                          setCategory(CategoryData[0])

                          const sizeList: any = []
                          for (const list of CategoryData[0].id_size) {
                            const sizeData: any = itemSizeList.find((t: any) => t.id == parseInt(list))
                            if (sizeData) {
                              sizeList.push({ id: sizeData.id, size: sizeData.size })
                            }
                          }
                          setItemSizeList(sizeList)

                          const lengthList: any = []
                          for (const list of CategoryData[0].id_length) {
                            const lengthData: any = itemLengthList.find((t: any) => t.id == parseInt(list))
                            if (lengthData) {
                              lengthList.push({ id: lengthData.id, length: lengthData.length })
                            }
                          }

                          setItemLengthList(lengthList)
                        }
                        data[index].subCategoryList = subCategoryData
                        data[index].subCategory = null
                        data[index].subSubCategory = null
                        data[index].subSubCategoryList = []
                        setInputFields(data)
                      }
                      }
                      Options={categorysList.filter((t: any) => t.parent_id == null)}

                    />
                  </Grid>
                  <Grid item xs={12} sm={4} key={"SUBCAT_" + index}>
                    <TccSelect
                      InputProps={isDisabled}
                      sx={{ mb: 4 }}
                      fullWidth
                      inputLabel="Sub Category"
                      label='Sub Category'
                      value={input.subCategory || ''}
                      id='controlled-select'
                      title='category_name'
                      onChange={(e: any) => {
                        const data = [...inputFields]
                        data[index].subCategory = e.target.value
                        const subSubCategoryData = categorysList.filter((t: any) =>
                          t.parent_id === e.target.value
                        )
                        data[index].subSubCategory = null
                        data[index].subSubCategoryList = subSubCategoryData
                        setInputFields(data)
                      }}
                      Options={input.subCategoryList}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3} key={"SUBSUBCAT_" + index}>
                    <TccSelect
                      InputProps={isDisabled}
                      sx={{ mb: 4 }}
                      fullWidth
                      inputLabel="Sub Sub Category"
                      label='Sub Sub Category'
                      value={input.subSubCategory || ''}
                      id='controlled-select'
                      title='category_name'
                      onChange={(e: any) => {
                        const data = [...inputFields]
                        data[index].subSubCategory = e.target.value
                        setInputFields(data)
                      }}
                      Options={input.subSubCategoryList}
                    />
                  </Grid>
                  <Grid item xs={12} sm={1}>

                    <Button fullWidth
                      variant='outlined'
                      color='secondary' onClick={() => removeFields(index)}>
                      Delete
                    </Button>
                  </Grid>

                </>
              )
            })
            }
            <Grid item xs={12} sm={12} sx={{ display: "flex", justifyContent: "end" }}>
              {action === "view" ? <></> : <Button variant='contained' onClick={addFields}>
                Add
              </Button>}
            </Grid>
            <Grid item xs={12} sm={12} sx={{ display: "flex", justifyContent: "space-between" }}>
              <TccInput
                InputProps={isDisabled}
                type='number'
                label='Labor charges'
                value={marketingCharge}
                placeholder=''
                onChange={(e: any) => setMarketingCharge(e.target.value)}
              />
              <TccInput
                InputProps={isDisabled}
                type='number'
                label='Finding Charge'
                value={findingCharge}
                placeholder=''
                onChange={(e: any) => setFindingCharge(e.target.value)}
              />
              <TccInput
                InputProps={isDisabled}
                type='number'
                label='Other Charge'
                value={otherCharge}
                placeholder=''
                onChange={(e: any) => setOtherCharge(e.target.value)}
              />
            </Grid>

          </Fragment >
        )
      case 1:

        return (
          <>
            <Fragment key={"SET_" + step}>
              <Grid item xs={12} sm={6}>
                {category && category.is_setting_style === "1" ?
                  <Autocomplete
                    readOnly={isDisabled}
                    fullWidth
                    multiple
                    options={settingTypeList}
                    value={settingType}
                    onChange={(event, newItem) => {
                      setSettingType(newItem)
                    }}
                    filterSelectedOptions
                    size='small'
                    id='autocomplete-multiple-outlined'
                    getOptionLabel={(option: any) => option.name}
                    renderInput={(params: any) => <TextField {...params} label='Setting Type' />}
                  />
                  : <></>}
              </Grid>
              <Grid item xs={12} sm={6}>
                {/* <FormControlLabel
                label='Size'
                control={<Checkbox checked={checkedSize} onChange={(e) => setCheckedSize(e.target.checked)} name='Size' />}
              />
              <FormControlLabel
                label='Length'
                control={<Checkbox checked={checkedLength} onChange={(e) => setCheckedLength(e.target.checked)} name='Length' />}
              /> */}
                {category && category.is_size === "1" ?
                  <Autocomplete
                    readOnly={isDisabled}
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
                  />
                  : <></>}
                {category && category.is_length === "1" ?
                  <Autocomplete
                    sx={{ mt: 5 }}
                    readOnly={isDisabled}
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
                  />
                  : <></>}

              </Grid>
              <Grid item sm={12}>
                <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Metal Details
                </Typography>
                <FormGroup row>
                  {metalGroupList.map(({ id, name }) => (
                    <div key={"ID_" + id}>
                      <FormControlLabel
                        label={name}
                        control={<Checkbox disabled={action == "view" ? true : false} checked={checked[id]} onChange={handleChecked(id)} name={name} />}
                      />
                    </div>

                  ))}
                </FormGroup>
              </Grid>
              <Grid item xs={12} sm={12}>
                {checked['1' as keyof typeof checked] === true && <TableContainer component={Paper} sx={{ maxHeight: 350 }}>
                  <Table stickyHeader aria-label='sticky table'>
                    <TableHead>
                      <TableRow>
                        <TableCell align='center'>Metal Karat</TableCell>
                        <TableCell align='center' sx={{ minWidth: 270 }}>Metal Tone</TableCell>
                        <TableCell align='center'>Metal Weight</TableCell>
                        <TableCell align='center'> Rate</TableCell>
                        <TableCell align='center'>Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inputFieldGoldMetal.map((input, index) => {
                        return (
                          <TableRow key={"GOLD_" + index}>
                            <TableCell>
                              <TccInput
                                fullWidth
                                disabled
                                type='text'
                                label='Metal Karat'
                                value={`${input.karat}KT`}
                                placeholder=''
                              />
                            </TableCell>
                            <TableCell>
                              <Autocomplete
                                readOnly={isDisabled}
                                fullWidth
                                multiple
                                options={metalToneList}
                                value={input.tone}
                                onChange={(event, newItem) => {
                                  const data = [...inputFieldGoldMetal]
                                  data[index].tone = newItem as any[]
                                  setInputFieldGoldMetal(data)
                                }}
                                filterSelectedOptions
                                size='small'
                                id='autocomplete-multiple-outlined'
                                getOptionLabel={(option: any) => option.name}
                                renderInput={(params: any) => <TextField {...params} label='Metal Tone' />}
                              />
                            </TableCell>
                            <TableCell>
                              <TccInput
                                InputProps={isDisabled}
                                fullWidth
                                type='number'
                                label='Metal Weight'
                                value={input.metal_weight}
                                placeholder=''
                                onChange={(e: any) => {
                                  const data = [...inputFieldGoldMetal]
                                  data[index].metal_weight = e.target.value
                                  setInputFieldGoldMetal(data)
                                }}
                              />

                            </TableCell>

                            <TableCell>
                              <TccInput
                                fullWidth
                                disabled
                                type='text'
                                label='Rate'
                                value={input.rate}
                                placeholder=''
                              />
                            </TableCell>
                            <TableCell>
                              <TccInput
                                fullWidth
                                disabled
                                type='number'
                                label='Price'
                                value={`${(parseFloat(input.metal_weight === null ? '0.00' : input.metal_weight) * input.rate).toFixed(2)}`}
                                placeholder=''
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>}
                {checked['2' as keyof typeof checked] === true ? <TableContainer component={Paper} sx={{ maxHeight: 350 }}>
                  <Table stickyHeader aria-label='sticky table' sx={{ mt: 6 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell align='center' sx={{ minWidth: 270 }}>Metal Tone</TableCell>
                        <TableCell align='center'>Metal Weight</TableCell>
                        <TableCell align='center'> Rate</TableCell>
                        <TableCell align='center'>Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inputFieldSilverMetal.map((input, index) => {
                        return (
                          <TableRow key={"SIL_" + index}>

                            <TableCell>
                              <Autocomplete
                                readOnly={isDisabled}
                                fullWidth
                                multiple
                                options={silverToneList}
                                value={input.tone}
                                onChange={(event, newItem) => {
                                  const data = [...inputFieldSilverMetal]
                                  data[index].tone = newItem
                                  setInputFieldSilverMetal(data)
                                }}
                                filterSelectedOptions
                                size='small'
                                id='autocomplete-multiple-outlined'
                                getOptionLabel={(option: any) => option.name}
                                renderInput={(params: any) => <TextField {...params} label='Metal Tone' />}
                              />
                            </TableCell>
                            <TableCell>
                              <TccInput
                                InputProps={isDisabled}
                                fullWidth
                                type='text'
                                label='Metal Weight'
                                value={input.metal_weight}
                                placeholder=''
                                onChange={(event: any) => {
                                  const data = [...inputFieldSilverMetal]
                                  data[index].metal_weight = event.target.value
                                  setInputFieldSilverMetal(data)
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <TccInput
                                fullWidth
                                disabled
                                type='text'
                                label='Rate'
                                value={input.rate}
                                placeholder=''
                              />
                            </TableCell>
                            <TableCell>
                              <TccInput
                                fullWidth
                                disabled
                                type='text'
                                label='Price'
                                value={`${(parseFloat(input.metal_weight === null ? '0.00' : input.metal_weight) * input.rate).toFixed(2)}`}
                                placeholder=''
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer> : ""}
                {checked['3' as keyof typeof checked] === true ? <TableContainer component={Paper} sx={{ maxHeight: 350 }}>
                  <Table stickyHeader aria-label='sticky table' sx={{ mt: 6 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell align='center' sx={{ minWidth: 270 }}>Metal Tone</TableCell>
                        <TableCell align='center'>Metal Weight</TableCell>
                        <TableCell align='center'> Rate</TableCell>
                        <TableCell align='center'>Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inputFieldPlatinumMetal.map((input, index) => {
                        return (
                          <TableRow key={"PLT_" + index}>

                            <TableCell>
                              <Autocomplete
                                readOnly={isDisabled}
                                fullWidth
                                multiple
                                options={paltinumToneList}
                                value={input.tone}
                                onChange={(event, newItem) => {
                                  const data = [...inputFieldPlatinumMetal]
                                  data[index].tone = newItem
                                  setInputFieldPlatinumMetal(data)
                                }}
                                filterSelectedOptions
                                size='small'
                                id='autocomplete-multiple-outlined'
                                getOptionLabel={(option: any) => option.name}
                                renderInput={(params: any) => <TextField {...params} label='Metal Tone' />}
                              />
                            </TableCell>
                            <TableCell>
                              <TccInput
                                InputProps={isDisabled}
                                fullWidth
                                type='text'
                                label='Metal Weight'
                                value={input.metal_weight}
                                onChange={(event: any) => {
                                  const data = [...inputFieldPlatinumMetal]
                                  data[index].metal_weight = event.target.value
                                  setInputFieldPlatinumMetal(data)
                                }}
                                placeholder=''
                              />
                            </TableCell>
                            <TableCell>
                              <TccInput
                                fullWidth
                                disabled
                                type='text'
                                label='Rate'
                                value={input.rate}
                                placeholder=''
                              />
                            </TableCell>
                            <TableCell>
                              <TccInput
                                fullWidth
                                disabled
                                type='text'
                                label='Price'
                                value={`${(parseFloat(input.metal_weight === null ? '0.00' : input.metal_weight) * input.rate).toFixed(2)}`}
                                placeholder=''
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer> : ""}
                {/* <TableContainer component={Paper} sx={{ maxHeight: 350 }}>
                <Table stickyHeader aria-label='sticky table'>
                  <TableHead>
                    <TableRow>
                      <TableCell align='center'>Default</TableCell>
                      <TableCell align='center'>Metal Group</TableCell>
                      <TableCell align='center'>Metal Weight</TableCell>
                      <TableCell align='center'>Include Rate</TableCell>
                      <TableCell align='center'>Price</TableCell>
                      <TableCell align='center'>Delete</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inputFieldsGold.map((input, index) => {
                      return (
                        <TableRow key={index}>
                          <RadioGroup row aria-label='controlled' name='controlled' value={input.default} onChange={handleChangeMetalDefaultValue}>
                            <TableCell>
                              <FormControlLabel value={index} control={<Radio checked={input.default == "1"} />} label='' />
                            </TableCell>
                          </RadioGroup>
                          <TableCell>
                            <TccSelect
                              fullWidth
                              inputLabel="Metal Group"
                              label='Metal Group'
                              value={input.metalGroup}
                              id='controlled-select'
                              title='name'
                              onChange={(e: any) => {
                                const data = [...inputFieldsGold]
                                data[index].metalGroup = e.target.value
                                setInputFieldsGold(data)
                              }}
                              Options={metalGroupList}
                            />
                          </TableCell>
                          <TableCell>
                            <TccInput
                              fullWidth
                              type='text'
                              label='Metal Weight'
                              value={input.weight}
                              placeholder=''
                              onChange={(e: any) => {
                                const data = [...inputFieldsGold]
                                data[index].weight = e.target.value
                                setInputFieldsGold(data)
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <TccInput
                              fullWidth
                              type='text'
                              disabled
                              label='Include Rate'
                              value={input.rate}
                              placeholder=''
                            />
                          </TableCell>
                          <TableCell>
                            <TccInput
                              fullWidth
                              type='text'
                              disabled
                              label='Price'
                              value={input.price}
                              placeholder=''
                            />
                          </TableCell>
                          <TableCell>
                            <Button variant='outlined' color='error'
                              onClick={() => removeGoldSettingFields(index)}>
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}

                  </TableBody>
                </Table>
              </TableContainer> */}
              </Grid>
              <Grid item xs={12} sm={12} sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Diamonds Details
                </Typography>
                {action === "view" ? <></> : <Button sx={{ mt: 8 }} variant='contained' onClick={addDiamondSettingFields}>
                  Add Diamond Details
                </Button>}
              </Grid>
              <Grid item xs={12} sm={12}>
                <TableContainer component={Paper} sx={{ maxHeight: 350 }}>
                  <Table stickyHeader aria-label='sticky table'>
                    <TableHead>
                      <TableRow>
                        <TableCell align='center' sx={{ minWidth: 250 }}>Diamond Group</TableCell>
                        <TableCell align='center'>stone Type</TableCell>
                        <TableCell align='center' sx={{ minWidth: 200 }}>Stone Setting</TableCell>
                        <TableCell align='center' sx={{ minWidth: 170 }}>Stone Weight</TableCell>
                        <TableCell align='center' sx={{ minWidth: 170 }}>Stone Pieces/count</TableCell>
                        <TableCell align='center' sx={{ minWidth: 170 }}>Stone Rate</TableCell>
                        <TableCell align='center' sx={{ minWidth: 170 }}>Stone price</TableCell>
                        <TableCell align='center'>Delete </TableCell>

                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inputFieldsDiamond.map((input, index) => {
                        return (
                          <TableRow key={"DIA_" + index}>
                            <TableCell>
                              <TccSelect
                                InputProps={isDisabled}
                                fullWidth
                                size='small'
                                inputLabel="Diamond Group"
                                label='Diamond Group'
                                value={input.id_diamond_group}
                                id='controlled-select'
                                title='display_name'
                                onChange={(e: any) => {
                                  const data = [...inputFieldsDiamond];
                                  const selectedGroup = diamondGroupsWithDetails.find((group: any) => group.id === e.target.value);

                                  if (selectedGroup) {
                                    data[index].id_diamond_group = selectedGroup.id;
                                    data[index].diamondGroup = selectedGroup.id;
                                    data[index].stone = selectedGroup.id_stone;
                                    data[index].stone_shape = selectedGroup.id_shape;
                                    data[index].stone_mm_size = selectedGroup.id_mm_size;
                                    data[index].stone_color = selectedGroup.id_color;
                                    data[index].stone_clarity = selectedGroup.id_clarity;
                                    data[index].stone_cut = selectedGroup.id_cuts;
                                    data[index].rate = selectedGroup.rate;
                                  }

                                  setInputFieldsDiamond(data);
                                }}
                                Options={diamondGroupsWithDetails}
                              />
                            </TableCell>
                            <TableCell>
                              <TccSelect
                                InputProps={isDisabled}
                                fullWidth
                                size='small'
                                inputLabel="stone Type"
                                label='stone Type'
                                value={input.Stone_type}
                                id='controlled-select'
                                title='name'
                                onChange={(e: any) => {
                                  const data = [...inputFieldsDiamond]
                                  data[index].Stone_type = e.target.value
                                  setInputFieldsDiamond(data)
                                }}
                                Options={stoneTypeList}
                              />
                            </TableCell>
                            <TableCell>
                              <TccSelect
                                InputProps={isDisabled}
                                fullWidth
                                size='small'
                                inputLabel="Stone Setting"
                                label='Stone Setting'
                                value={input.stone_setting}
                                id='controlled-select'
                                title='name'
                                onChange={(e: any) => {
                                  const data = [...inputFieldsDiamond]
                                  data[index].stone_setting = e.target.value
                                  setInputFieldsDiamond(data)
                                }}
                                Options={settingTypeList}
                              />
                            </TableCell>
                            <TableCell>
                              <TccInput
                                InputProps={isDisabled}
                                fullWidth
                                type='text'
                                label='Stone Weight'
                                value={input.Stone_weight}
                                placeholder=''
                                onChange={(e: any) => {
                                  const data = [...inputFieldsDiamond]
                                  data[index].Stone_weight = e.target.value
                                  setInputFieldsDiamond(data)
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <TccInput
                                InputProps={isDisabled}
                                fullWidth
                                type='text'
                                label='Stone Pieces'
                                value={input.stone_count}
                                placeholder=''
                                onChange={(e: any) => {
                                  const data = [...inputFieldsDiamond]
                                  data[index].stone_count = e.target.value
                                  setInputFieldsDiamond(data)
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <TccInput
                                fullWidth
                                type='text'
                                label='Stone Rate'
                                disabled
                                value={input.rate}
                                placeholder=''
                              />
                            </TableCell>
                            <TableCell>
                              <TccInput
                                fullWidth
                                type='text'
                                disabled
                                label='Price'
                                value={`${input.rate * input.Stone_weight * input.stone_count}`}
                                placeholder=''
                              />
                            </TableCell>
                            <TableCell>
                              <Button variant='outlined' color='error'
                                onClick={() => removeDiamondSettingFields(index)}>
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}

                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Fragment >
          </>
        )
      default:
        return 'Unknown Step'
    }

  }

  const renderContent = () => {
    if (activeStep === steps.length) {
      return (
        <>
          <Typography>All steps are completed!</Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button size='large' variant='contained' onClick={handleReset}>
              Add New Products
            </Button>
          </Box>
        </>
      )
    } else {
      return (
        <form onSubmit={e => e.preventDefault()}>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                {activeStep === 2 ? "" : steps[activeStep].title}
              </Typography>
              <Typography variant='caption' component='p'>
                {/* {steps[activeStep].subtitle} */}
              </Typography>
            </Grid>
            {getStepContent(activeStep)}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                size='large'
                variant='outlined'
                color='secondary'
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </Button>
              {activeStep === steps.length - 1 && action == "view" ? <></> : <Button size='large' variant='contained' onClick={activeStep === 0 ?
                handleNext : activeStep === 1 ? id == undefined && productId == 0 ? addProductDetails : editProductDetails : handleNext}>
                {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
              </Button>}
            </Grid>
          </Grid>
        </form>
      )
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <>
            <StepperWrapper>
              <Stepper activeStep={activeStep} sx={{ display: 'flex', justifyContent: "start" }} connector={<Icon icon='tabler:chevron-right' />}>
                {steps.map((step, index) => {
                  const RenderAvatar = activeStep >= index ? CustomAvatar : Avatar

                  return (
                    <Step key={"THE_" + index}>
                      <StepLabel StepIconComponent={StepperCustomDot}>
                        <div className='step-label'>
                          <RenderAvatar
                            variant='rounded'
                            {...(activeStep >= index && { skin: 'light' })}
                            {...(activeStep === index && { skin: 'filled' })}
                            {...(activeStep >= index && { color: 'primary' })}
                            sx={{
                              ...(activeStep === index && { boxShadow: theme => theme.shadows[3] }),
                              ...(activeStep > index && { color: theme => hexToRGBA(theme.palette.primary.main, 0.4) })
                            }}
                          >
                            <Icon icon={step.icon} />
                          </RenderAvatar>
                          <div>
                            <Typography className='step-title'>{step.title}</Typography>
                          </div>
                        </div>
                      </StepLabel>
                    </Step>
                  )
                })}
              </Stepper>
            </StepperWrapper>
            <Divider sx={{ m: '0 !important' }} />
            <CardContent>{renderContent()}</CardContent>
          </>
        )
      case 1:
        return <BulkUploadZip onSuccess={handleBulkUploadSuccess} />
      case 2:
        return <BulkUploadFile onSuccess={handleBulkUploadSuccess} />
      default:
        return null
    }
  }

  return (
    <>
      <Button variant='contained' sx={{ mr: 3, mb: 4, '& svg': { mr: 2 } }} onClick={() => Router.back()}>
        <Icon icon='material-symbols:arrow-back-rounded' />
        Back
      </Button>
      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="product addition tabs">
              <Tab
                label="Single Product"
                icon={<Icon icon='fluent-mdl2:product-release' />}
                iconPosition="start"
              />
              <Tab
                label="Bulk Upload - ZIP Files"
                icon={<Icon icon='tabler:upload' />}
                iconPosition="start"
              />
              <Tab
                label="Bulk Upload - File Import"
                icon={<Icon icon='tabler:file-import' />}
                iconPosition="start"
              />
            </Tabs>
          </Box>
          {renderTabContent()}
        </CardContent>
      </Card>
    </>
  )
}



export default ProductAdd
