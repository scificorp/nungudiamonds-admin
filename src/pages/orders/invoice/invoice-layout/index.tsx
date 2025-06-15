// ** React Imports
import { useRouter } from 'next/router';
import { ReactNode, useEffect } from 'react'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Components Imports
import PrintPage from 'src/pages/orders/invoice/invoice-print'

const InvoicePrint = () => {
    const router = useRouter();
    const { id } = router.query;

    return <PrintPage orderId={id} />
}

InvoicePrint.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

InvoicePrint.setConfig = () => {
    return {
        mode: 'light'
    }
}

export default InvoicePrint