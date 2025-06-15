// ** Type import
import path from 'path'
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: 'tabler:smart-home'
    },
    {
      sectionTitle: 'ORDERS MANAGEMENT'
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
      sectionTitle: 'PRODUCT MANAGEMENT'
    },
    {
      title: 'Product',
      icon: 'fluent-mdl2:product-variant',
      children: [
        {
          title: 'Add product',
          path: '/product/add-products'
        },
        {
          title: 'All products',
          path: '/product/all-products'
        },
        {
          title: 'Bulk Upload',
          path: '/product/product-bulk-upload/file-import'
        },
        {
          title: 'Gift Sets',
          path: '/product/gift-set/gift-list'
        },
        {
          title: 'product Stocks',
          path: '/product/product-stocks'
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
      icon: 'tabler:collection',
      children: [
        {
          title: 'All Collections',
          path: '/collections/collections-list'
        },
        {
          title: 'Add Collection',
          path: '/collections/add-collection'
        }
      ]
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
      sectionTitle: 'CUSTOMER MANAGEMENT'
    },
    {
      title: 'Customers',
      path: '/customer/customers-list',
      icon: 'tabler:users'
    },
    {
      sectionTitle: 'BUSINESS SECTION'
    },
    {
      title: 'Customer Review',
      path: '/business-section/customer-review',
      icon: 'material-symbols:reviews-outline-sharp'
    },
    {
      title: 'Order Transactions',
      path: '/business-section/order-transactions',
      icon: 'tabler:id'
    },
    {
      title: 'Wishlist Products',
      path: '/business-section/wishlist-product',
      icon: 'mdi:cart-heart'
    },
    {
      title: 'Cart Products',
      path: '/business-section/cart-product',
      icon: 'mdi:cart-variant'
    },
    {
      sectionTitle: 'PAYMENT MANAGEMENT'
    },
    {
      title: 'Payments',
      path: '/payments/payment',
      icon: 'fluent-mdl2:payment-card'
    },
    {
      sectionTitle: 'ENQUIRY MANAGEMENT'
    },
    {
      title: 'Enquiry',
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
      sectionTitle: 'FRONTEND MANAGEMENT'
    },

    {
      title: 'Hero Content',
      path: '/frontend/hero-content',
      icon: 'tabler:video'
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
      sectionTitle: 'ROLES & PERMISSION'
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
      sectionTitle: 'WEB CONFIG & API MANAGEMENT'
    },
    {
      title: 'Email Set-UP',
      icon: 'tabler:mail',
      path: '/web-config-api/email-setup'
    },
    {
      title: 'Instagram ID',
      path: '/web-config-api/instagram-ID',
      icon: 'tabler:brand-instagram'
    },
    {
      title: 'Company Info setup',
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
