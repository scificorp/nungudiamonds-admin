// ** MUI Imports
import { Icon } from '@iconify/react'
import { Accordion, AccordionDetails, AccordionSummary, CardContent, Divider, Grid, Card, Drawer, Typography, IconButton, Button, Box, FormControl, TextField, FormHelperText, MenuItem, Select, InputLabel, Chip, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import TCCTableHeader from 'src/customComponents/data-table/header'
import AdminPageHeader from 'src/components/common/AdminPageHeader'
import TccDataTable from 'src/customComponents/data-table/table'
import TccInput from 'src/customComponents/Form-Elements/inputField'
import TccEditor from 'src/customComponents/Form-Elements/editor'
import DrawerHeader from 'src/customComponents/components/drawer-header'
import { ICommonPagination } from 'src/data/interface'
import { createPagination } from 'src/utils/sharedFunction'
import { toast } from 'react-hot-toast'
import { appErrors, FIELD_REQUIRED, SEARCH_DELAY_TIME } from 'src/AppConstants'
import { ADD_STATIC_PAGE, ADD_STATIC_PAGE_SECTION, DELETE_STATIC_PAGE, DELETE_STATIC_PAGE_SECTION, EDIT_STATIC_PAGE, EDIT_STATIC_PAGE_SECTION, GET_ALL_STATIC_PAGE, GET_STATIC_PAGE_SECTIONS, REORDER_STATIC_PAGE_SECTIONS, STATUS_UPDATE_STATIC_PAGE } from 'src/services/AdminServices'
import DeleteDataModel from 'src/customComponents/delete-model'
import { Controller, useForm } from 'react-hook-form'

const StaticPageList = () => {

  let timer: any
  const [searchFilter, setSearchFilter] = useState()
  const [drawerAction, setDrawerAction] = useState(false)
  const [showModel, setShowModel] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [pageType, setPageType] = useState("standard")
  const [heroEyebrow, setHeroEyebrow] = useState("")
  const [heroTitle, setHeroTitle] = useState("")
  const [heroSubtitle, setHeroSubtitle] = useState("")
  const [heroMediaDesktopUrl, setHeroMediaDesktopUrl] = useState("")
  const [heroMediaMobileUrl, setHeroMediaMobileUrl] = useState("")
  const [heroCtaLabel, setHeroCtaLabel] = useState("")
  const [heroCtaType, setHeroCtaType] = useState("booking_modal")
  const [heroCtaTarget, setHeroCtaTarget] = useState("")
  const [ogImageUrl, setOgImageUrl] = useState("")
  const [canonicalUrl, setCanonicalUrl] = useState("")
  const [publishStatus, setPublishStatus] = useState("published")
  const [staticPageId, setStaticPageId] = useState("")
  const [editerData, setEditerData] = useState("")
  const [edit, setEdit] = useState<string>('<p></p>')
  const [staticPageData, setStaticPageData] = useState([])
  const [sections, setSections] = useState<any[]>([])
  const [sectionDraft, setSectionDraft] = useState<any>({
    id: "",
    section_type: "process_steps",
    sort_order: 10,
    title: "",
    eyebrow: "",
    body: "",
    cta_label: "",
    cta_type: "booking_modal",
    cta_target: "",
    media_url: "",
    media_mobile_url: "",
    settings_json: JSON.stringify({
      steps: [
        {
          number: "01",
          title: "The Consultation",
          eyebrow: "By appointment",
          copy: "Every piece begins with a private conversation."
        }
      ]
    }, null, 2)
  })
  const [called, setCalled] = useState(true)
  const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" });

  const toggleAddStaticPageDrawer = () => {
    if (drawerAction == true) {
      setCalled(false)
    }
    if (drawerAction == false) {
      setCalled(true)
    }
    setDrawerAction(!drawerAction)
  }

  const defaultValues = {
    name: name,
    slug: slug,
    meta_title: metaTitle,
    meta_description: metaDescription
  }

  const {
    control,
    setValue,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues
  })

  const [dialogTitle, setDialogTitle] = useState<'Add' | 'Edit'>('Add')

  const clearFormData = () => {
    reset()
    setName("")
    setSlug("")
    setMetaTitle("")
    setMetaDescription("")
    setPageType("standard")
    setHeroEyebrow("")
    setHeroTitle("")
    setHeroSubtitle("")
    setHeroMediaDesktopUrl("")
    setHeroMediaMobileUrl("")
    setHeroCtaLabel("")
    setHeroCtaType("booking_modal")
    setHeroCtaTarget("")
    setOgImageUrl("")
    setCanonicalUrl("")
    setPublishStatus("published")
    setSections([])
    resetSectionDraft()
    setEdit('<p><p>')
  }
  const resetSectionDraft = () => {
    setSectionDraft({
      id: "",
      section_type: "process_steps",
      sort_order: 10,
      title: "",
      eyebrow: "",
      body: "",
      cta_label: "",
      cta_type: "booking_modal",
      cta_target: "",
      media_url: "",
      media_mobile_url: "",
      settings_json: JSON.stringify({
        steps: [
          {
            number: "01",
            title: "The Consultation",
            eyebrow: "By appointment",
            copy: "Every piece begins with a private conversation."
          }
        ]
      }, null, 2)
    })
  }
  const editOnClickHandler = async (data: any) => {
    setValue("name", data.page_title)
    setValue("slug", data.slug)
    setValue("meta_title", data.meta_title || "")
    setValue("meta_description", data.meta_description || "")
    setMetaTitle(data.meta_title || "")
    setMetaDescription(data.meta_description || "")
    setPageType(data.page_type || "standard")
    setHeroEyebrow(data.hero_eyebrow || "")
    setHeroTitle(data.hero_title || "")
    setHeroSubtitle(data.hero_subtitle || "")
    setHeroMediaDesktopUrl(data.hero_media_desktop_url || "")
    setHeroMediaMobileUrl(data.hero_media_mobile_url || "")
    setHeroCtaLabel(data.hero_cta_label || "")
    setHeroCtaType(data.hero_cta_type || "booking_modal")
    setHeroCtaTarget(data.hero_cta_target || "")
    setOgImageUrl(data.og_image_url || "")
    setCanonicalUrl(data.canonical_url || "")
    setPublishStatus(data.status || "published")
    setEdit(data.content)
    setStaticPageId(data.id)
    setDialogTitle('Edit')
    await getStaticPageSectionsApi(data.id)
    toggleAddStaticPageDrawer()
  }

  const deleteOnClickHandler = (data: any) => {
    setStaticPageId(data.id)
    setShowModel(!showModel)
  }

  const getAllstaticDataApi = async (mbPagination: ICommonPagination) => {
    try {
      const data = await GET_ALL_STATIC_PAGE(mbPagination);
      if (data.code === 200 || data.code === "200") {

        setStaticPageData(data.data.result);
        setPagination(data.data.pagination)

      } else {
        return toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }

  useEffect(() => {

    getAllstaticDataApi(pagination);

  }, []);

  const handleChangePerPageRows = (perPageRows: number) => {
    getAllstaticDataApi({ ...pagination, per_page_rows: perPageRows, current_page: 1 })
  }

  const handleOnPageChange = (page: number) => {
    getAllstaticDataApi({ ...pagination, current_page: page + 1 })
  }

  const handleChangeSortBy = (orderSort: any) => {
    getAllstaticDataApi({ ...pagination, sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field), order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort) })
  }

  const searchBusinessUser = async () => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      getAllstaticDataApi({ ...pagination, current_page: 1, search_text: searchFilter });
    }, SEARCH_DELAY_TIME);
  }

  useEffect(() => {

    searchBusinessUser();

  }, [searchFilter]);

  const getEnrichmentPayload = () => ({
    page_type: pageType,
    hero_eyebrow: heroEyebrow,
    hero_title: heroTitle,
    hero_subtitle: heroSubtitle,
    hero_media_desktop_url: heroMediaDesktopUrl,
    hero_media_mobile_url: heroMediaMobileUrl,
    hero_cta_label: heroCtaLabel,
    hero_cta_type: heroCtaType,
    hero_cta_target: heroCtaTarget,
    og_image_url: ogImageUrl,
    canonical_url: canonicalUrl,
    status: publishStatus
  })

  const normalizeSectionPayload = () => {
    let settingsJson = null

    if (sectionDraft.settings_json) {
      try {
        settingsJson = JSON.parse(sectionDraft.settings_json)
      } catch (error) {
        toast.error("Section settings must be valid JSON")

        return null
      }
    }

    return {
      section_type: sectionDraft.section_type,
      sort_order: Number(sectionDraft.sort_order || 0),
      title: sectionDraft.title,
      eyebrow: sectionDraft.eyebrow,
      body: sectionDraft.body,
      cta_label: sectionDraft.cta_label,
      cta_type: sectionDraft.cta_type,
      cta_target: sectionDraft.cta_target,
      media_url: sectionDraft.media_url,
      media_mobile_url: sectionDraft.media_mobile_url,
      settings_json: settingsJson
    }
  }

  const getStaticPageSectionsApi = async (pageId: string | number) => {
    try {
      const data = await GET_STATIC_PAGE_SECTIONS(pageId)
      if (data.code === 200 || data.code === "200") {
        setSections(data.data || [])
      } else {
        toast.error(data.message)
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }

  const saveSectionApi = async () => {
    if (!staticPageId) {
      toast.error("Save the page before adding sections")

      return
    }

    const payload = normalizeSectionPayload()
    if (!payload) return

    try {
      const data = sectionDraft.id
        ? await EDIT_STATIC_PAGE_SECTION(sectionDraft.id, payload)
        : await ADD_STATIC_PAGE_SECTION(staticPageId, payload)

      if (data.code === 200 || data.code === "200") {
        toast.success(sectionDraft.id ? "Section updated" : "Section added")
        resetSectionDraft()
        getStaticPageSectionsApi(staticPageId)
      } else {
        toast.error(data.message)
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }

  const editSectionHandler = (section: any) => {
    setSectionDraft({
      ...section,
      settings_json: JSON.stringify(section.settings_json || {}, null, 2)
    })
  }

  const deleteSectionApi = async (sectionId: string | number) => {
    try {
      const data = await DELETE_STATIC_PAGE_SECTION(sectionId)
      if (data.code === 200 || data.code === "200") {
        toast.success("Section removed")
        getStaticPageSectionsApi(staticPageId)
      } else {
        toast.error(data.message)
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }

  const moveSectionApi = async (section: any, direction: -1 | 1) => {
    const orderedSections = [...sections].sort((left: any, right: any) => left.sort_order - right.sort_order || left.id - right.id)
    const currentIndex = orderedSections.findIndex((item: any) => item.id === section.id)
    const targetIndex = currentIndex + direction

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= orderedSections.length) return

    const current = orderedSections[currentIndex]
    const target = orderedSections[targetIndex]
    orderedSections[currentIndex] = { ...target, sort_order: current.sort_order }
    orderedSections[targetIndex] = { ...current, sort_order: target.sort_order }

    try {
      const data = await REORDER_STATIC_PAGE_SECTIONS(staticPageId, {
        sections: orderedSections.map((item: any, index: number) => ({
          id: item.id,
          sort_order: item.sort_order || (index + 1) * 10
        }))
      })

      if (data.code === 200 || data.code === "200") {
        setSections(data.data || [])
      } else {
        toast.error(data.message)
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }

  const addStaticPageApi = async (data: any) => {
    const payload = {
      "name": data.name,
      "slug": data.slug,
      "content": editerData,
      "meta_title": data.meta_title,
      "meta_description": data.meta_description,
      ...getEnrichmentPayload()
    }
    try {
      const data = await ADD_STATIC_PAGE(payload)
      if (data.code === 200 || data.code === "200") {

        toggleAddStaticPageDrawer();
        clearFormData();
        toast.success(data.message)
        getAllstaticDataApi(pagination)

      } else {
        toast.error(data.message)
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }

    return false
  }
  const editStaticPageDataApi = async (data: any) => {

    const payload = {
      "id": staticPageId,
      "name": data.name,
      "slug": data.slug,
      "content": editerData,
      "meta_title": data.meta_title,
      "meta_description": data.meta_description,
      ...getEnrichmentPayload()
    }
    try {
      const data = await EDIT_STATIC_PAGE(payload)
      if (data.code === 200 || data.code === "200") {

        toggleAddStaticPageDrawer();
        clearFormData();
        toast.success(data.message)
        getAllstaticDataApi(pagination)
      } else {
        toast.error(data.message)
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }

    return false

  }


  const deleteStaticPageDataApi = async () => {

    const payload = {
      "id": staticPageId
    }

    try {
      const data = await DELETE_STATIC_PAGE(payload);
      if (data.code === 200 || data.code === "200") {
        toast.success(data.message);
        setShowModel(!showModel)
        getAllstaticDataApi(pagination)
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
      const datas = await STATUS_UPDATE_STATIC_PAGE(payload)

      if (datas.code === 200 || datas.code === "200") {
        toast.success("Successfully updated")
        getAllstaticDataApi(pagination)

        return true
      } else {

      }
    } catch (error) {

      return toast.error(appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }
  const column = [
    {
      flex: 1,
      value: 'page_title',
      headerName: 'title',
      field: 'page_title',
      text: 'text'
    },
    {
      flex: 1,
      value: 'slug',
      headerName: 'slug',
      field: 'slug',
      text: 'text'
    },
    {
      flex: 1,
      headerName: 'Status',
      field: 'Status',
      chips: 'chips',
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
      deleted: 'deleted',
      editOnClick: editOnClickHandler,
      deletedOnClick: deleteOnClickHandler,

    },
  ]

  const onSubmit = (data: any) => {
    if (dialogTitle === 'Add') {
      addStaticPageApi(data)
    } else {
      editStaticPageDataApi(data)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <AdminPageHeader title='Static Page' />
          <Divider />
          <Box>
            <TCCTableHeader isButton value={searchFilter}
              onChange={(e: any) => setSearchFilter(e.target.value)}
              toggle={(e: any) => {
                e.preventDefault()
                clearFormData()
                toggleAddStaticPageDrawer()
                setDialogTitle('Add')
              }}
              ButtonName='Add Static Page'
            />

          </Box>
          <TccDataTable
            column={column}
            rows={staticPageData}
            handleSortChanges={handleChangeSortBy}
            pageSize={parseInt(pagination.per_page_rows.toString())}
            onChangepage={handleChangePerPageRows}
            rowCount={pagination.total_items}
            page={pagination.current_page - 1}
            onPageChange={handleOnPageChange}
            iconTitle='Page'
          />
        </Card>
      </Grid>
      <Drawer
        open={drawerAction}
        anchor='right'
        variant='temporary'
        onClose={toggleAddStaticPageDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 960 } } }}
      >
        <DrawerHeader
          title={`${dialogTitle} Static Page`}
          onClick={() => {
            toggleAddStaticPageDrawer()
            clearFormData()
          }}
        />

        <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <Controller
                name='name'
                control={control}
                rules={{ required: true }}
                render={({ field }: any) => (
                  <TextField
                    autoFocus
                    size='small'
                    label='Static Page Name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={Boolean(errors.name)}
                    {...field}
                  />
                )}
              />
              {errors.name && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <Controller
                name='slug'
                control={control}
                rules={{ required: true }}
                render={({ field }: any) => (
                  <TextField
                    autoFocus
                    size='small'
                    value={slug}
                    label='Static Page Slug'
                    onChange={(e) => setSlug(e.target.value)}
                    error={Boolean(errors.slug)}
                    {...field}
                  />
                )}
              />
              {errors.slug && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <Controller
                name='meta_title'
                control={control}
                render={({ field }: any) => (
                  <TextField
                    size='small'
                    label='Meta Title'
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    {...field}
                  />
                )}
              />
            </FormControl>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <Controller
                name='meta_description'
                control={control}
                render={({ field }: any) => (
                  <TextField
                    size='small'
                    multiline
                    minRows={3}
                    label='Meta Description'
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    {...field}
                  />
                )}
              />
            </FormControl>

            <Accordion defaultExpanded sx={{ mb: 4 }}>
              <AccordionSummary expandIcon={<Icon icon='tabler:chevron-down' />}>
                <Typography variant='h6'>Page type and publishing</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size='small'>
                      <InputLabel>Page Type</InputLabel>
                      <Select label='Page Type' value={pageType} onChange={(e) => setPageType(e.target.value)}>
                        <MenuItem value='standard'>Standard</MenuItem>
                        <MenuItem value='bespoke_experience'>Bespoke experience</MenuItem>
                        <MenuItem value='landing_page'>Landing page</MenuItem>
                        <MenuItem value='legal'>Legal</MenuItem>
                        <MenuItem value='special_project'>Special project</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size='small'>
                      <InputLabel>Status</InputLabel>
                      <Select label='Status' value={publishStatus} onChange={(e) => setPublishStatus(e.target.value)}>
                        <MenuItem value='draft'>Draft</MenuItem>
                        <MenuItem value='published'>Published</MenuItem>
                        <MenuItem value='scheduled'>Scheduled</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      size='small'
                      label='Canonical URL'
                      value={canonicalUrl}
                      onChange={(e) => setCanonicalUrl(e.target.value)}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ mb: 4 }}>
              <AccordionSummary expandIcon={<Icon icon='tabler:chevron-down' />}>
                <Typography variant='h6'>Hero and sharing</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth size='small' label='Hero Eyebrow' value={heroEyebrow} onChange={(e) => setHeroEyebrow(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth size='small' label='Hero Title' value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth size='small' multiline minRows={2} label='Hero Subtitle' value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth size='small' label='Desktop Hero Media URL' value={heroMediaDesktopUrl} onChange={(e) => setHeroMediaDesktopUrl(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth size='small' label='Mobile Hero Media URL' value={heroMediaMobileUrl} onChange={(e) => setHeroMediaMobileUrl(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField fullWidth size='small' label='Hero CTA Label' value={heroCtaLabel} onChange={(e) => setHeroCtaLabel(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size='small'>
                      <InputLabel>Hero CTA Type</InputLabel>
                      <Select label='Hero CTA Type' value={heroCtaType} onChange={(e) => setHeroCtaType(e.target.value)}>
                        <MenuItem value='booking_modal'>Booking modal</MenuItem>
                        <MenuItem value='route'>Route</MenuItem>
                        <MenuItem value='cms_page'>CMS page</MenuItem>
                        <MenuItem value='external_url'>External URL</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField fullWidth size='small' label='Hero CTA Target' value={heroCtaTarget} onChange={(e) => setHeroCtaTarget(e.target.value)} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth size='small' label='Open Graph Image URL' value={ogImageUrl} onChange={(e) => setOgImageUrl(e.target.value)} />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <TccEditor getHtmlData={setEditerData} data={edit} called={called} />

            {dialogTitle === 'Edit' && (
              <Accordion defaultExpanded sx={{ mt: 4, mb: 4 }}>
                <AccordionSummary expandIcon={<Icon icon='tabler:chevron-down' />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant='h6'>Structured Sections</Typography>
                    <Chip size='small' label={`${sections.length} sections`} />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{ mb: 3 }} color='text.secondary'>
                    These sections render on the storefront before falling back to the legacy rich-text content.
                  </Typography>

                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size='small'>
                        <InputLabel>Section Type</InputLabel>
                        <Select
                          label='Section Type'
                          value={sectionDraft.section_type}
                          onChange={(e) => setSectionDraft({ ...sectionDraft, section_type: e.target.value })}
                        >
                          <MenuItem value='rich_text'>Rich text</MenuItem>
                          <MenuItem value='process_steps'>Process steps</MenuItem>
                          <MenuItem value='feature_cards'>Feature cards</MenuItem>
                          <MenuItem value='cta_band'>CTA band</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        size='small'
                        type='number'
                        label='Sort Order'
                        value={sectionDraft.sort_order}
                        onChange={(e) => setSectionDraft({ ...sectionDraft, sort_order: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size='small'
                        label='Title'
                        value={sectionDraft.title}
                        onChange={(e) => setSectionDraft({ ...sectionDraft, title: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size='small'
                        label='Eyebrow'
                        value={sectionDraft.eyebrow}
                        onChange={(e) => setSectionDraft({ ...sectionDraft, eyebrow: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size='small'
                        label='CTA Label'
                        value={sectionDraft.cta_label}
                        onChange={(e) => setSectionDraft({ ...sectionDraft, cta_label: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size='small'
                        multiline
                        minRows={3}
                        label='Body'
                        value={sectionDraft.body}
                        onChange={(e) => setSectionDraft({ ...sectionDraft, body: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size='small'>
                        <InputLabel>CTA Type</InputLabel>
                        <Select
                          label='CTA Type'
                          value={sectionDraft.cta_type}
                          onChange={(e) => setSectionDraft({ ...sectionDraft, cta_type: e.target.value })}
                        >
                          <MenuItem value='booking_modal'>Booking modal</MenuItem>
                          <MenuItem value='route'>Route</MenuItem>
                          <MenuItem value='cms_page'>CMS page</MenuItem>
                          <MenuItem value='external_url'>External URL</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <TextField
                        fullWidth
                        size='small'
                        label='CTA Target'
                        value={sectionDraft.cta_target}
                        onChange={(e) => setSectionDraft({ ...sectionDraft, cta_target: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size='small'
                        label='Media URL'
                        value={sectionDraft.media_url}
                        onChange={(e) => setSectionDraft({ ...sectionDraft, media_url: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size='small'
                        label='Mobile Media URL'
                        value={sectionDraft.media_mobile_url}
                        onChange={(e) => setSectionDraft({ ...sectionDraft, media_mobile_url: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size='small'
                        multiline
                        minRows={8}
                        label='Settings JSON'
                        value={sectionDraft.settings_json}
                        onChange={(e) => setSectionDraft({ ...sectionDraft, settings_json: e.target.value })}
                        helperText='Use steps for process_steps or cards for feature_cards.'
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                    <Button variant='contained' type='button' onClick={saveSectionApi}>
                      {sectionDraft.id ? 'Save Section' : 'Add Section'}
                    </Button>
                    <Button variant='outlined' type='button' onClick={resetSectionDraft}>
                      Clear Section
                    </Button>
                  </Box>

                  <Stack spacing={2}>
                    {[...sections]
                      .sort((left: any, right: any) => left.sort_order - right.sort_order || left.id - right.id)
                      .map((section: any) => (
                        <Card key={section.id} variant='outlined'>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-start' }}>
                              <Box>
                                <Typography variant='subtitle1'>{section.title || 'Untitled section'}</Typography>
                                <Typography variant='body2' color='text.secondary'>
                                  {section.section_type} · order {section.sort_order}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton size='small' onClick={() => moveSectionApi(section, -1)}>
                                  <Icon icon='tabler:arrow-up' />
                                </IconButton>
                                <IconButton size='small' onClick={() => moveSectionApi(section, 1)}>
                                  <Icon icon='tabler:arrow-down' />
                                </IconButton>
                                <IconButton size='small' onClick={() => editSectionHandler(section)}>
                                  <Icon icon='tabler:pencil' />
                                </IconButton>
                                <IconButton size='small' color='error' onClick={() => deleteSectionApi(section.id)}>
                                  <Icon icon='tabler:trash' />
                                </IconButton>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
              <Button variant='contained' sx={{ mr: 3 }} type="submit">
                {dialogTitle === 'Add' ? "SUBMIT" : "EDIT"}
              </Button>

              <Button variant='outlined' color='secondary' onClick={() => {
                toggleAddStaticPageDrawer()
                clearFormData()
              }}>
                Cancel
              </Button>
            </Box>
          </form>
        </Box>
      </Drawer>
      <DeleteDataModel showModel={showModel} toggle={(show: any) => setShowModel(show)} onClick={deleteStaticPageDataApi} />

    </Grid>
  )
}

export default StaticPageList
