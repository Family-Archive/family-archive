import AllRecords from "../../../../components/AllRecords/AllRecords"

const allRecords = async ({ searchParams }) => {
    return (
        <>
            <h1 className='title'>All Records</h1>
            <AllRecords params={searchParams} records={[]} showOptions={true} />
        </>
    )
}

export default allRecords