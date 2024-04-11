import styles from './FamiliesPage.module.scss'
import { prisma } from "@/app/db/prisma"
import Link from 'next/link'

const FamiliesPage = async () => {

    const families = await prisma.Family.findMany()

    return <div className="column">
        <div className="topBar">
            <h1 className='title'>All Families</h1>
            <div className='pageOptions'>
                <button><span className="material-icons">add</span>Add family</button>
            </div>
        </div>
        <div className={styles.families}>
            {families.map(family => {
                return <Link href={`/families/${family.id}`}>
                    <div className={styles.family}>{family.name} Family</div>
                </Link>
            })}
        </div>
    </div >
}

export default FamiliesPage