import dynamic from 'next/dynamic'

/**
 * This page displays all the records in the system
 */

const allRecords = async ({ searchParams }) => {
    const AllRecords = dynamic(() => import("@/components/AllRecords/AllRecords"), {
        ssr: false,
    })

    return (
        <>
            <h1 className='title'>All Records</h1>
            <AllRecords params={searchParams} showOptions={true} />
        </>
    )
}

export default allRecords