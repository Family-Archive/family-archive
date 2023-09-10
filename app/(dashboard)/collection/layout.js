import CreateCollectionButton from "./CreateCollectionButton"

const CollectionLayout = async ({ children, params, searchParams }) => {
    return (
        <>
            <div className='pageOptions'>
                <CreateCollectionButton />
            </div>
            {children}
        </>
    )
}

export default CollectionLayout
