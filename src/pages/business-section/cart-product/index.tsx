import CustomerProductInterestPage from 'src/components/business/CustomerProductInterestPage'
import { GET_ALL_CART_PRODUCT } from 'src/services/AdminServices'

const CartProduct = () => (
  <CustomerProductInterestPage
    title='Cart Products'
    subtitle='Review products customers have placed in their carts, grouped by customer for quicker sales follow-up.'
    drawerTitle='Customer Cart'
    emptyMessage='No customer carts match the current filters'
    emptyApiMessage='No cart products were returned by the API for the current filters.'
    fetchRecords={GET_ALL_CART_PRODUCT}
  />
)

export default CartProduct
