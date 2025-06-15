// ** React Imports
import { useRouter } from 'next/router';
import { ReactNode, useEffect } from 'react'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Components Imports
import GiftsetPrintPage from 'src/pages/orders/invoice/giftset-invoice-print'

const GiftsetInvoicePrint = () => {
    const router = useRouter();
    const { id } = router.query;

    return <GiftsetPrintPage orderId={id} />
}

GiftsetInvoicePrint.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

GiftsetInvoicePrint.setConfig = () => {
    return {
        mode: 'light'
    }
}

export default GiftsetInvoicePrint