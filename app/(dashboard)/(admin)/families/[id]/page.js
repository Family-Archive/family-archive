import styles from './FamilyPage.module.scss'
import { prisma } from "@/app/db/prisma"
import Link from 'next/link'
import RenameComponent from './RenameComponent'
import DeleteButton from './DeleteButton'

const FamilyPage = async ({ params }) => {

    const family = await prisma.Family.findUnique({
        where: { id: params.id },
        include: { users: true, records: true, collections: true, people: true }
    })

    return <div className={`${styles.FamilyPage} column`}>
        <RenameComponent family={family} />
        <DeleteButton id={family.id} />

        <div>
            <div className={styles.info}>
                <span>{family.records.length} record(s)</span>
                <span>{family.collections.length} collection(s)</span>
                <span>{family.people.length} people</span>
            </div>

            <div className={styles.users}>
                <h2>Users</h2>
                {family.users.map(user => {
                    return <Link href={`/users/${user.id}`}>
                        <div className={styles.user}>{user.name}</div>
                    </Link>
                })}
            </div>
        </div>
    </div>
}

export default FamilyPage