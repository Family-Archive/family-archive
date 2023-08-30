import CreateCollectionButton from "./CreateCollectionButton"

const CollectionLayout = async ({ children }) => {
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
