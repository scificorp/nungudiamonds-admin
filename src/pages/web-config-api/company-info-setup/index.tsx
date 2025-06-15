// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardHeader from '@mui/material/CardHeader'
import { Button, CardContent, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material'
import TccInput from 'src/customComponents/Form-Elements/inputField'
import { ChangeEvent, useEffect, useState } from 'react'
import TccSingleFileUpload from 'src/customComponents/Form-Elements/file-upload/singleFile-upload'
import TccColorPicker from 'src/customComponents/color-picker'
import { EDIT_COMPANY_INFO, GET_COMPANY_INFO } from 'src/services/AdminServices'
import { toast } from 'react-hot-toast'
import { appErrors } from 'src/AppConstants'

const CompanyInfoSetup = () => {

  const [compnayInfoId, setCompanyInfoId] = useState("")

  const [companyName, setCompanyName] = useState("")
  const [companyEmail, setCompanyEmail] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")
  const [companyAbout, setCompanyAbout] = useState("")
  const [companyCopyRight, setCompanyCopyRight] = useState("")

  const [webSiteLink, setWebSiteLink] = useState("")
  const [faceBookLink, setFaceBookLink] = useState("")
  const [instagramLink, setInstagramLink] = useState("")
  const [youTubeLink, setYouTubeLink] = useState("")
  const [linkedInLink, setLinkedInLink] = useState('')
  const [twitterLink, setTwitterLink] = useState('')

  const [primaryThemeColor, setPrimaryThemeColor] = useState('')
  const [secondaryThemeColor, setSecondaryThemeColor] = useState('')

  const [radioButtonStripe, setRadioButtonStripe] = useState('')
  const [backGroundColor, setBackGroundColor] = useState('')
  const [textColor, setTextColor] = useState('')
  const [announcementText, setAnnouncementText] = useState('')
  const [faviconImageFile, setFaviconImageFile] = useState<File>()
  const [darkImageFile, setDarkImageFile] = useState<File>()
  const [lightImageFile, setLightImageFile] = useState<File>()

  console.log("-------", darkImageFile)
  console.log("1111111", lightImageFile)

  const handleRadioChangeStripe = (event: ChangeEvent<HTMLInputElement>) => {

    setRadioButtonStripe((event.target as HTMLInputElement).value)
  }

  const getCompnayInfoDataApi = async () => {
    try {
      const data = await GET_COMPANY_INFO();
      if (data.code === 200 || data.code === "200") {

        console.log(data.data)

        const statusValue = data.data.companyInfo.announce_is_active == "1" ? "checked" : "unchecked"

        // console.log(statusValue);
        setRadioButtonStripe(statusValue)
        setCompanyInfoId(data.data.companyInfo.id)
        setCompanyName(data.data.companyInfo.company_name)
        setCompanyEmail(data.data.companyInfo.company_email)
        setCompanyCopyRight(data.data.companyInfo.copy_right)
        setCompanyPhone(data.data.companyInfo.company_phone)
        setCompanyAbout(data.data.companyInfo.sort_about)
        setWebSiteLink(data.data.companyInfo.web_link)
        setFaceBookLink(data.data.companyInfo.facebook_link)
        setInstagramLink(data.data.companyInfo.insta_link)
        setYouTubeLink(data.data.companyInfo.youtube_link)
        setLinkedInLink(data.data.companyInfo.linkdln_link)
        setTwitterLink(data.data.companyInfo.twitter_link)
        setPrimaryThemeColor(data.data.companyInfo.web_primary_color)
        setSecondaryThemeColor(data.data.companyInfo.web_secondary_color)
        setAnnouncementText(data.data.companyInfo.announce_text)
        setBackGroundColor(data.data.companyInfo.announce_color)
        setTextColor(data.data.companyInfo.announce_text_color)

      } else {
        return toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)

    }
  }

  const editCompanyInfoDataApi = async () => {
    const statusValue = radioButtonStripe === "checked" ? "1" : "0"

    console.log(statusValue)
    const formData = new FormData()
    formData.append("id", compnayInfoId)
    formData.append("dark_image", darkImageFile || "")
    formData.append("light_image", lightImageFile || "")
    formData.append("favicon_image", faviconImageFile || "")
    formData.append("company_name", companyName)
    formData.append("company_email", companyEmail)
    formData.append("company_phone", companyPhone)
    formData.append("copy_right", companyCopyRight)
    formData.append("sort_about", companyAbout)
    formData.append("web_link", webSiteLink)
    formData.append("facebook_link", faceBookLink)
    formData.append("insta_link", instagramLink)
    formData.append("youtube_link", youTubeLink)
    formData.append("linkdln_link", linkedInLink)
    formData.append("twitter_link", twitterLink)
    formData.append("web_primary_color", primaryThemeColor)
    formData.append("web_secondary_color", secondaryThemeColor)
    formData.append("announce_color", backGroundColor)
    formData.append("announce_text", announcementText)
    formData.append("announce_text_color", textColor)
    formData.append("announce_is_active", statusValue)

    try {
      const data = await EDIT_COMPANY_INFO(formData)
      if (data.code === 200 || data.code === "200") {

        getCompnayInfoDataApi()

        return toast.success(data.message)
      } else {
        return toast.error(data.message)
      }
    } catch (e: any) {

      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }

    return false

  }
  useEffect(() => {
    getCompnayInfoDataApi()
  }, []);

  return (
    <form>
      <Grid container gridRow={1} spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Company Info Setup'></CardHeader>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>

          <Card>
            <CardContent>
              <Typography variant='h6' color='black' sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>Company Info</Typography>

              <Typography>Company Info</Typography>

              <TccInput
                sx={{ mt: 10, mb: 2 }}
                label='Name'
                fullWidth
                value={companyName}
                onChange={(e: any) => setCompanyName(e.target.value)}
              />
              <TccInput
                sx={{ mt: 4, mb: 2 }}
                label='Email'
                fullWidth
                value={companyEmail}
                onChange={(e: any) => setCompanyEmail(e.target.value)}
              />
              <TccInput
                sx={{ mt: 4, mb: 2 }}
                label='Phone Number'
                fullWidth
                value={companyPhone}
                onChange={(e: any) => setCompanyPhone(e.target.value)}
              />
              <TccInput
                sx={{ mt: 4, mb: 2 }}
                label='Copyright'
                fullWidth
                value={companyCopyRight}
                onChange={(e: any) => setCompanyCopyRight(e.target.value)}
              />

              <TccInput
                sx={{ mt: 4, mb: 6 }}
                label='Sort About'
                fullWidth
                multiline
                rows={2}
                value={companyAbout}
                onChange={(e: any) => setCompanyAbout(e.target.value)}
              />
              <Grid container spacing={6}>
                <Grid item xs={12} md={6} lg={6}>
                  <Grid item xs={12}>
                    <Typography>Dark Logo</Typography>
                    <TccSingleFileUpload onDrop={setDarkImageFile} />
                  </Grid>
                </Grid>
                <Grid item xs={12} md={6} lg={6}>
                  <Grid item xs={12}>
                    <Typography>Light Logo</Typography>
                    <TccSingleFileUpload onDrop={setLightImageFile} />
                  </Grid>
                </Grid>
              </Grid>
              <Grid sx={{ mt: 5 }}>
                <Typography>Add Favicon</Typography>
                <TccSingleFileUpload onDrop={setFaviconImageFile} />
              </Grid>
              {/* <Button variant='contained' sx={{ mr: 3, mt: 5 }}>
                  Submit
                </Button> */}

            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' color='black' sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>Social Links</Typography>

              <Typography>Social Links</Typography>
              <TccInput
                sx={{ mt: 10, mb: 2 }}
                label='Website Link'
                fullWidth
                value={webSiteLink}
                onChange={(e: any) => setWebSiteLink(e.target.value)}
              />

              <TccInput
                sx={{ mt: 4, mb: 2 }}
                label='Facebook Link'
                fullWidth
                value={faceBookLink}
                onChange={(e: any) => setFaceBookLink(e.target.value)}
              />

              <TccInput
                sx={{ mt: 4, mb: 2 }}
                label='Instagram Link'
                fullWidth
                value={instagramLink}
                onChange={(e: any) => setInstagramLink(e.target.value)}
              />

              <TccInput
                sx={{ mt: 4, mb: 2 }}
                label='youTube Link'
                fullWidth
                value={youTubeLink}
                onChange={(e: any) => setYouTubeLink(e.target.value)}
              />

              <TccInput
                sx={{ mt: 4, mb: 2 }}
                label='linkedIn Link'
                fullWidth
                value={linkedInLink}
                onChange={(e: any) => setLinkedInLink(e.target.value)}
              />

              <TccInput
                sx={{ mt: 4 }}
                label='Twitter Link'
                fullWidth
                value={twitterLink}
                onChange={(e: any) => setTwitterLink(e.target.value)}
              />
              {/* 
                <Button variant='contained' sx={{ mr: 3, mt: 5 }}>
                  Submit
                </Button> */}

            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' color='black' sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>Web Color Setup</Typography>

                <Typography sx={{ mb: 10 }}>Web Color Setup</Typography>

                <Typography variant='body2' sx={{ mb: 4 }}>Primary Color</Typography>
                <TccColorPicker value={primaryThemeColor} onChange={(e: any) => setPrimaryThemeColor(e.target.value)} sx={{ mb: 12 }} />

                <Typography variant='body2' sx={{ mb: 4 }}>Secondary Color</Typography>
                <TccColorPicker value={secondaryThemeColor} onChange={(e: any) => setSecondaryThemeColor(e.target.value)} sx={{ mb: 47 }} />

              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' color='black' sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>Announcement setup</Typography>

                <Typography sx={{ mb: 10 }}>Announcement setup</Typography>
                <RadioGroup value={radioButtonStripe} name='simple-radio' onChange={handleRadioChangeStripe} aria-label='simple-radio'>
                  <FormControlLabel value='checked' control={<Radio />} label='Active' sx={{ mb: 2 }} />
                  <FormControlLabel value='unchecked' control={<Radio />} label='InActive' sx={{ mb: 6 }} />
                </RadioGroup>

                <Typography variant='body2' sx={{ mb: 4 }}>Background Color</Typography>
                <TccColorPicker value={backGroundColor} onChange={(e: any) => setBackGroundColor(e.target.value)} sx={{ mb: 6 }} />

                <Typography variant='body2' sx={{ mb: 4 }}>Text Color</Typography>
                <TccColorPicker value={textColor} onChange={(e: any) => setTextColor(e.target.value)} />

                <TccInput value={announcementText}
                  onChange={(e: any) => setAnnouncementText(e.target.value)}
                  fullWidth
                  label='Announcement Text'
                  sx={{ mb: 6, mt: 4 }}
                />

              </CardContent>

            </Card>

          </Grid>

        </Grid>
        <Button variant='contained' sx={{ ml: 6, mt: 5 }} onClick={editCompanyInfoDataApi}>
          Submit
        </Button>
      </Grid>
    </form>
  )
}

export default CompanyInfoSetup