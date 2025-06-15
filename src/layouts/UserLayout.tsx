// ** React Imports
import { ReactNode, useEffect, useState } from 'react'

// ** MUI Imports
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Layout Imports
// !Do not remove this Layout import
import Layout from 'src/@core/layouts/Layout'

// ** Navigation Imports
import VerticalNavItems from 'src/navigation/vertical'
import HorizontalNavItems from 'src/navigation/horizontal'

// ** Component Import
// Uncomment the below line (according to the layout type) when using server-side menu
// import ServerSideVerticalNavItems from './components/vertical/ServerSideNavItems'
// import ServerSideHorizontalNavItems from './components/horizontal/ServerSideNavItems'

import VerticalAppBarContent from './components/vertical/AppBarContent'
import HorizontalAppBarContent from './components/horizontal/AppBarContent'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'
import { toast } from 'react-hot-toast'
import { GET_ACCESS_MENU_ITEMS } from 'src/services/AppServices'
import { DEFAULT_STATUS_CODE_SUCCESS } from 'src/AppConstants'
import { IUserAccessMenuItems } from 'src/data/interface'
import { NavGroup, NavLink, VerticalNavItemsType } from 'src/@core/layouts/types'

interface Props {
  children: ReactNode
  contentHeightFixed?: boolean
}

const UserLayout = ({ children, contentHeightFixed }: Props) => {
  // ** Hooks
  const { settings, saveSettings } = useSettings()
  const [verticalNavItems, setVerticalNavItems] = useState<VerticalNavItemsType>([]);
  useEffect(() => {
    fetchNavItems();
  }, []);

  const fetchNavItems = async () => {

    try {
      const data = await GET_ACCESS_MENU_ITEMS()
      if (data.code === DEFAULT_STATUS_CODE_SUCCESS) {

        const parentMenuItems: IUserAccessMenuItems[] = [];
        data.data.forEach((item: IUserAccessMenuItems) => {
          if (item.id_parent_menu === null)
            parentMenuItems.push(item)

        });
        const tempVerticalNavItems = [];
        let findChildItem: NavLink[] = [];
        for (const parentMenu of parentMenuItems) {
          findChildItem = findChildrenByParentId(parentMenu.id, data.data);
          if (parentMenu.menu_location == 3) {

            console.log(parentMenu.nav_path)
            tempVerticalNavItems.push({ sectionTitle: parentMenu.name })

          }
          if (!parentMenu.nav_path) {
            tempVerticalNavItems.push({
              title: parentMenu.name, path: parentMenu.nav_path, children: findChildItem, ...(parentMenu.icon ? { icon: parentMenu.icon } : {})
            });
          } else {

            // if (parentMenu.menu_location == 3) {

            //   tempVerticalNavItems.push({ sectionTitle: parentMenu.name })

            // } else {
            tempVerticalNavItems.push({ title: parentMenu.name, path: parentMenu.nav_path, ...(parentMenu.icon ? { icon: parentMenu.icon } : {}) })

            // }
          }

        }
        setVerticalNavItems(tempVerticalNavItems);
      } else {
        toast.error(data?.message)
      }
    } catch (e: any) {
      toast.error(e?.data?.message)
    }
  }

  const findChildrenByParentId = (idParent: number, menuItems: IUserAccessMenuItems[]) => {
    const findChildItem: NavLink[] | NavGroup[] = [];
    let findInnerChildItem: NavLink[] | NavGroup[] = [];
    menuItems.forEach((item: IUserAccessMenuItems) => {
      if (item.id_parent_menu === idParent) {
        if (item.nav_path) {
          findChildItem.push({ title: item.name, path: item.nav_path, ...(item.icon ? { icon: item.icon } : {}) })

        } else {
          findInnerChildItem = findChildrenByParentId(item.id, menuItems);
          findChildItem.push({ title: item.name, children: findInnerChildItem, ...(item.icon ? { icon: item.icon } : {}) })

        }

      }
    });

    return findChildItem;
  }


  // ** Vars for server side navigation
  // const { menuItems: verticalMenuItems } = ServerSideVerticalNavItems()
  // const { menuItems: horizontalMenuItems } = ServerSideHorizontalNavItems()

  /**
   *  The below variable will hide the current layout menu at given screen size.
   *  The menu will be accessible from the Hamburger icon only (Vertical Overlay Menu).
   *  You can change the screen size from which you want to hide the current layout menu.
   *  Please refer useMediaQuery() hook: https://mui.com/material-ui/react-use-media-query/,
   *  to know more about what values can be passed to this hook.
   *  ! Do not change this value unless you know what you are doing. It can break the template.
   */
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))

  if (hidden && settings.layout === 'horizontal') {
    settings.layout = 'vertical'
  }

  return (
    <Layout
      hidden={hidden}
      settings={settings}
      saveSettings={saveSettings}
      contentHeightFixed={contentHeightFixed}
      verticalLayoutProps={{
        navMenu: {
          navItems: VerticalNavItems()

          // Temporarily using static navigation to see changes immediately
          // navItems: verticalNavItems

          // Uncomment the below line when using server-side menu in vertical layout and comment the above line
          // navItems: verticalMenuItems
        },
        appBar: {
          content: props => (
            <VerticalAppBarContent
              hidden={hidden}
              settings={settings}
              saveSettings={saveSettings}
              toggleNavVisibility={props.toggleNavVisibility}
            />
          )
        }
      }}
      {...(settings.layout === 'horizontal' && {
        horizontalLayoutProps: {
          navMenu: {
            navItems: HorizontalNavItems()

            // Uncomment the below line when using server-side menu in horizontal layout and comment the above line
            // navItems: horizontalMenuItems
          },
          appBar: {
            content: () => <HorizontalAppBarContent settings={settings} saveSettings={saveSettings} />
          }
        }
      })}
    >
      {children}

    </Layout>
  )
}

export default UserLayout
