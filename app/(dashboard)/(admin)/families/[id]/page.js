import styles from './FamilyPage.module.scss'
import { prisma } from "@/app/db/prisma"
import Link from 'next/link'
import RenameComponent from './RenameComponent'
import DeleteButton from './DeleteButton'

const FamilyPage = async ({ params }) => {

    const family = await prisma.Family.findUnique({
        where: { id: params.id },
        include: { users: true }
    })

    return <div className={`${styles.FamilyPage} column`}>
        <RenameComponent family={family} />
        <DeleteButton id={family.id} />

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