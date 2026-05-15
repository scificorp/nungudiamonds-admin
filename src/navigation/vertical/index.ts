// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: 'tabler:smart-home'
    },
    {
      sectionTitle: 'OPERATIONS'
    },
    {
      title: 'Orders',
      icon: 'grommet-icons:cart',
      children: [
        {
          title: 'Product order',
          path: '/orders/orders-list'
        },
        {
          title: 'Giftset order',
          path: '/orders/giftset-orders-list'
        }
      ]
    },
    {
      title: 'Customers',
      path: '/customer/customers-list',
      icon: 'tabler:users'
    },
    {
      title: 'Business Activity',
      icon: 'tabler:briefcase',
      children: [
        {
          title: 'Customer Reviews',
          path: '/business-section/customer-review'
        },
        {
          title: 'Order Transactions',
          path: '/business-section/order-transactions'
        },
        {
          title: 'Wishlist Products',
          path: '/business-section/wishlist-product'
        },
        {
          title: 'Cart Products',
          path: '/business-section/cart-product'
        },
        {
          title: 'Payments',
          path: '/payments/payment'
        }
      ]
    },
    {
      title: 'Enquiries',
      icon: 'material-symbols:record-voice-over-rounded',
      children: [
        {
          title: 'Product Enquiries',
          path: '/enquiries/product-enquiries'
        },
        {
          title: 'General Enquiries',
          path: '/enquiries/general-enquiries'
        }
      ]
    },
    {
      sectionTitle: 'CATALOG OPERATIONS'
    },
    {
      title: 'Catalog',
      icon: 'fluent-mdl2:product-variant',
      children: [
        {
          title: 'All Products',
          path: '/product/all-products'
        },
        {
          title: 'Quick Add Product',
          path: '/product/simplified-add'
        },
        {
          title: 'Bulk Upload',
          path: '/product/product-bulk-upload/file-import'
        },
        {
          title: 'Legacy Gift Products',
          path: '/product/gift-set/gift-list'
        },
        {
          title: 'Legacy Product Workspace',
          path: '/product/add-products'
        }
      ]
    },
    {
      title: 'Category',
      path: '/category/category-master',
      icon: 'tabler:category'
    },
    {
      title: 'Collections',
      path: '/collections/collections-list',
      icon: 'tabler:collection',
    },
    {
      title: 'Attribute',
      icon: 'mdi:message-reply-outline',
      children: [
        {
          title: 'Diamond Shape',
          path: '/attribute/diamond-shape'
        },
        {
          title: 'Gemstone',
          path: '/attribute/gemstone'
        },
        {
          title: 'Carat Size',
          path: '/attribute/carat-size'
        },
        {
          title: 'Color',
          path: '/attribute/color'
        },
        {
          title: 'Clarity',
          path: '/attribute/clarity'
        },
        {
          title: 'Cut',
          path: '/attribute/cut'
        },
        {
          title: 'MM Size',
          path: '/attribute/mm-size'
        },
        {
          title: 'Diamond Group Master',
          path: '/attribute/diamond-group-master'
        },
        {
          title: 'Head',
          path: '/attribute/head'
        },
        {
          title: 'Shank',
          path: '/attribute/shank'
        },
        {
          title: 'Item Size Master',
          path: '/attribute/Item-Size-Master'
        },
        {
          title: 'Item Length Master',
          path: '/attribute/Item-Length-Master'
        },
        {
          title: 'Setting Type/Style',
          path: '/attribute/setting-style'
        },
        {
          title: 'Metal',
          children: [
            {
              title: 'Carat Master',
              path: '/attribute/Metal/Carat-Master'
            },
            {
              title: 'Metal Tone',
              path: '/attribute/Metal/metal-tone'
            },
            {
              title: 'Metal Master',
              path: '/attribute/Metal/Metal-Master'
            },
            {
              title: 'Metal Group Master',
              path: '/attribute/Metal/Metal-Group-Master'
            }
          ]
        },
        {
          title: 'setting carat weight',
          path: '/attribute/setting-carat-weight'
        },
        {
          title: 'Gender for filter',
          path: '/attribute/gender-for-filter'
        },
        {
          title: 'Tags',
          path: '/attribute/tags'
        }
      ]
    },
    {
      title: 'Rates',
      icon: 'tabler:currency-exchange',
      children: [
        {
          title: 'FX Rate',
          path: '/rates/fx-rate'
        },
        {
          title: 'Diamond Rates',
          path: '/rates/diamond-rates'
        }
      ]
    },
    {
      sectionTitle: 'MERCHANDISING & CONTENT'
    },

    {
      title: 'Hero Content',
      path: '/frontend/hero-content',
      icon: 'tabler:video'
    },
    {
      title: 'Image Upload Utility',
      path: '/frontend/bulk-image-upload',
      icon: 'tabler:cloud-upload'
    },
    {
      title: 'Banner',
      path: '/frontend/banner',
      icon: 'tabler:album'
    },
    {
      title: '3 Marketing Banner',
      path: '/frontend/3-marketing-banner',
      icon: 'tabler:box-multiple-3'
    },
    {
      title: 'Home About Section',
      path: '/frontend/home-about-section',
      icon: 'tabler:home'
    },
    {
      title: 'Features Sections',
      path: '/frontend/features-sections',
      icon: 'tabler:brand-tabler'
    },
    {
      title: 'Our Stories Sections',
      icon: 'material-symbols:auto-stories-outline-rounded',
      children: [
        {
          title: 'All Our Stories',
          path: '/frontend/our-stories-sections/our-stories-list'
        },
      ]
    },
    {
      title: 'Testimonials',
      path: '/frontend/testimonials',
      icon: 'tabler:brand-mastercard'
    },
    {
      title: 'Trending/Marketing Popup',
      path: '/frontend/trending-marketing-popup',
      icon: 'carbon:popup'
    },
    {
      title: 'Blog',
      path: '/frontend/blog/blog-list',
      icon: 'carbon:blog'
    },
    {
      sectionTitle: 'STATIC PAGES MANAGEMENT'
    },
    {
      title: 'Static Pages',
      path: '/static-pages/static-page-list',
      icon: 'tabler:file'
    },
    {
      sectionTitle: 'CONFIGURATION'
    },
    {
      title: 'Roles & Permissions',
      icon: 'tabler:settings-2',
      children: [
        {
          title: 'Roles',
          path: '/roles-permission/roles'
        },
        {
          title: 'User Management',
          path: '/roles-permission/permission'
        }
      ]
    },
    {
      title: 'Email Setup',
      icon: 'tabler:mail',
      path: '/web-config-api/email-setup'
    },
    {
      title: 'Company Info',
      path: '/web-config-api/company-info-setup',
      icon: 'tabler:settings'
    },
    {
      sectionTitle: 'Settings'
    },
    {
      title: 'Tax-Master',
      path: '/settings/tax-master',
      icon: 'la:percentage'
    },
    {
      title: 'Metal Rate Setting',
      path: '/settings/metal-rate-setting',
      icon: 'tabler:currency-rupee'
    },
    {
      title: 'Country-Master',
      icon: 'tabler:category',
      children: [
        {
          title: 'Country',
          path: '/country-master/Country'
        },
        {
          title: 'State',
          path: '/country-master/State'
        },
        {
          title: 'City',
          path: '/country-master/City'
        }
      ]
    },
    {
      title: 'Currency Master',
      path: '/settings/currency-master',
      icon: 'tabler:currency-dollar'
    }
  ]
}

export default navigation
