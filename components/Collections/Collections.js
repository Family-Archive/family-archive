import styles from './Collections.module.scss'
import Link from 'next/link'

/**
 * This component displays collections
 */

const Collections = ({ collections }) => {
    return (
        <div className={styles.collections}>
            {collections.map(collection => {
                return <div className={styles.collectionContainer}>
                    <Link href={`/collection/${collection.id}`}>
                        <div className={styles.collection}>
                            <span className={`material-icons ${styles.folderImg}`}>folder</span>
                            <span className={styles.collectionName}>{collection.name}</span>
                        </div>
                    </Link>
                </div>
            })}
        </div>
    )
}

export default Collections