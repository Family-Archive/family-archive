import styles from './FamilyPage.module.scss'
import { prisma } from "@/app/db/prisma"
import Link from 'next/link'

const FamilyPage = async ({ params }) => {

    const family = await prisma.Family.findUnique({
        where: { id: params.id },
        include: { users: true }
    })

    console.log(family)

    return <div className={`${styles.FamilyPage} column`}>
        <a href='#'><h1 className='title'>{family.name} Family</h1></a>
        <span className={styles.clickToRename}>Click to rename</span>

        <h2>Users</h2>
        <div className={styles.users}>
            {family.users.map(user => {
                return <Link href={`/users/${user.id}`}>
                    <div className={styles.user}>{user.name}</div>
                </Link>
            })}
        </div>
    </div>
}

export default FamilyPage