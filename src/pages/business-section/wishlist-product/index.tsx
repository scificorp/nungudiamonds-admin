import CustomerProductInterestPage from 'src/components/business/CustomerProductInterestPage'
import { GET_ALL_WISHLIST } from 'src/services/AdminServices'

const WishlistProduct = () => (
  <CustomerProductInterestPage
    title='Wishlist Products'
    subtitle='Review products customers have saved, grouped by customer so sales staff can understand intent quickly.'
    drawerTitle='Customer Wishlist'
    emptyMessage='No customer wishlists match the current filters'
    emptyApiMessage='No wishlist products were returned by the API for the current filters.'
    fetchRecords={GET_ALL_WISHLIST}
  />
)

export default WishlistProduct
