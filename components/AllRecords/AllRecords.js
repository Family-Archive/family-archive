import lib from '../../lib/lib'
import ViewFilter from '../ViewFilter/ViewFilter'
import PageSelector from '../PageSelector/PageSelector'
import styles from './AllRecords.module.scss'

/**
 * Hit the API endpoint to get a list of records
 * @param {searchParams} params: The searchParams object from the page this component is hosted on
 * @returns The JSON response containing the records
 */
const fetchRecords = async (params) => {
    let queryString = lib.buildQueryString(params)
    let records = await fetch(`${process.env.NEXTAUTH_URL}/api/records${queryString}`, { next: { tags: ['records'] } })
    if (!records.ok) {
        throw new Error('Failed to fetch data')
    }

    return await records.json()
}

const AllRecords = async (props) => {
    const records = await fetchRecords(props.params)

    return (
        <div className={styles.AllRecords}>
            <section className={styles.recordsGrid}>
                {records.map(record => {
                    return <div className={styles.record} key={record.id}>
                        <div className={styles.image} />
                        <span className={styles.recordName}>{record.name}</span>
                        <span className={styles.recordType}>{record.type}</span>
                        {/* Right now this displays the created date, but once we have a date selector on records we'll use that value */}
                        <span className={styles.recordDate}>{new Date(Date.parse(record.createdAt)).toLocaleDateString()}</span>
                    </div>
                })}
            </section>

            <section className={styles.viewOptions}>
                <ViewFilter params={props.params} />
                <PageSelector page={props.params.page} />
            </section>
        </div>
    )
}

export default AllRecords