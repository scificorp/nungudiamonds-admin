// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Badge from '@mui/material/Badge'
import { Direction } from '@mui/material'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Components
import clsx from 'clsx'
import { useKeenSlider } from 'keen-slider/react'
import KeenSliderWrapper from '../wapper'
import { IMG_ENDPOINT } from 'src/AppConfig'

const TccSwiperControls = (props: { direction: { direction: Direction }, imageArray: any[] }) => {
  // ** States
  const [loaded, setLoaded] = useState<boolean>(false)
  const [currentSlide, setCurrentSlide] = useState<number>(0)

  // ** Hook
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    rtl: props.direction.direction === 'rtl',
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel)
      // console.log(slider);

    },
    created() {
      setLoaded(true)
    }
  })

  return (
    <KeenSliderWrapper>

      <Box className='navigation-wrapper'>
        <Box ref={sliderRef} className='keen-slider'>
          {
            props.imageArray.map((input: any, index: any) => {
              return (
                <Box key={index} className='keen-slider__slide'>
                  <img key={index} src={`${IMG_ENDPOINT}/${input.image_path}`} alt={index} />
                </Box>
              )
            })
          }
          {/* <Box className='keen-slider__slide'>
              <img src={props.imageArray[0] ? `${IMG_ENDPOINT}/${props.imageArray[1].image_path}` : '/images/banners/banner-2.jpg'} />
            </Box> */}
        </Box>
        {loaded && instanceRef.current && instanceRef.current.track.details && (
          <>
            <Icon
              icon='tabler:chevron-left'
              className={clsx('arrow arrow-left', {
                'arrow-disabled': currentSlide === 0
              })}
              onClick={(e: any) => e.stopPropagation() || instanceRef.current?.prev()}
            />

            <Icon
              icon='tabler:chevron-right'
              className={clsx('arrow arrow-right', {
                'arrow-disabled': currentSlide === instanceRef.current.track.details.slides.length - 1
              })}
              onClick={(e: any) => e.stopPropagation() || instanceRef.current?.next()}
            />

          </>
        )}
      </Box>
      {loaded && instanceRef.current && instanceRef.current.track.details && (
        <Box className='swiper-dots'>

          {[...Array(instanceRef.current.track.details.slides.length).keys()].map(idx => {
            return (
              <Badge
                key={idx}
                variant='dot'
                component='div'
                className={clsx({
                  active: currentSlide === idx
                })}
                onClick={() => {
                  instanceRef.current?.moveToIdx(idx)
                }}
              ></Badge>
            )
          })}
        </Box>
      )}

    </KeenSliderWrapper>
  )
}

export default TccSwiperControls
