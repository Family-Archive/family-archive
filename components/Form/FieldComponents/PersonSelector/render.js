import styles from './render.module.scss'

import { cookies } from 'next/dist/client/components/headers'
import lib from '../../../../lib/lib'
import Link from 'next/link'

/**
 * Fetch data for all people
 * Since only the person ID is stored in the data, we need to make a network call to get other data
 * @returns {object}: A dictionary of people with IDs as keys
 */
const fetchPeopleData = async () => {
    let people = await fetch(`${process.env.NEXTAUTH_URL}/api/people`, {
        headers: {
            Cookie: lib.cookieObjectToString(cookies().getAll())
        }
    })
    people = await people.json()
    people = people.data.people

    let peopleDict = {}
    for (let person of people) {
        peopleDict[person.id] = person
    }
    return peopleDict
}

export async function render(data) {

    const people = await fetchPeopleData()
    data = JSON.parse(data)

    return data.length > 0 ? <div className={styles.people}>
        <span className={`${styles.icon} material-icons`}>boy</span>
        {data.map(person => {
            if (!people[person]) {
                return <button key={person} className={styles.person}>User unavailable</button>
            }

            return <Link href={`/people/${person}`} key={person}>
                <button className={styles.person}>
                    <img src={people[person].profileImageId ? `/api/file/${people[person].profileImageId}` : '/icons/no-user.png'} />
                    {people[person].fullName}
                </button>
            </Link>
        })}
    </div> : ""
}