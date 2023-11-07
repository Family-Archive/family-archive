import CreateCollectionButton from "./CreateCollectionButton"

// Pages under the collection parent always have a "Create Collection" Button

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
