import AllRecords from "../../../../components/AllRecords/AllRecords"

/**
 * This page displays all the records in the system
 */

const allRecords = async ({ searchParams }) => {
    return (
        <>
            <h1 className='title'>All Records</h1>
            <AllRecords params={searchParams} showOptions={true} />
        </>
    )
}

export default allRecords