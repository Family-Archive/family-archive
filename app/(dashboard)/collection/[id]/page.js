import lib from '@/lib/lib'
import { cookies } from 'next/dist/client/components/headers'
import BreadcrumbTrail from '@/components/BreadcrumbTrail/BreadcrumbTrail'
import Collections from '../../../../components/Collections/Collections'

const collection = async ({ params }) => {
    let data = await fetch(`${process.env.NEXTAUTH_URL}/api/collection/${params.id}`, {
        headers: {
            Cookie: lib.cookieObjectToString(cookies().getAll())
        }
    })
    data = await data.json()

    const thisCollection = data.data.collections[0]
    const children = thisCollection.children ? thisCollection.children : []

    return (
        <>
            <h1 className='title'>{thisCollection.name}</h1>
            <BreadcrumbTrail /><br />
            <Collections collections={children} />
        </>
    )
}

export default collection