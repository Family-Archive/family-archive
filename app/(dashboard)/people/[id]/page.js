import styles from './personView.module.scss'

import { cookies } from 'next/dist/client/components/headers'
import lib from '@/lib/lib'
import clientLib from '@/lib/client/lib'
import Link from 'next/link'
import Dropdown from '@/components/Dropdown/Dropdown'
import BreadcrumbTrail from '@/components/BreadcrumbTrail/BreadcrumbTrail'
import DeleteUserButton from './DeleteUserButton'

const personView = async ({ params }) => {
    const getPerson = async () => {
        let person = await fetch(`${process.env.NEXTAUTH_URL}/api/people/${params.id}`,
            {
                headers: {
                    Cookie: lib.cookieObjectToString(cookies().getAll())
                }
            }
        )
        person = await person.json()
        return person.data.person
    }

    const person = await getPerson()

    return (
        <div className={styles.personView}>
            <div className="topBar">
                <h1 className='title'>{person.fullName}</h1>
                <div className='pageOptions'>
                    <Link href={`/people/${params.id}/edit${person.profileImageId ? `?files=${person.profileImageId}` : ""}`}>
                        <button><span className="material-icons">edit</span>Edit person</button>
                    </Link>
                    <Dropdown
                        title="Options"
                        options={[
                            <DeleteUserButton id={person.id} />
                        ]}
                    />
                </div>
            </div>

            <BreadcrumbTrail name={person.fullName} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
                <div style={{ display: 'flex', gap: '4rem' }}>
                    <div className={styles.profileImage}>
                        <img src={person.profileImageId ? `/api/file/${person.profileImageId}` : '/icons/no-user.png'} />
                        <h2 className={styles.dates}>
                            {person.born ? clientLib.renderSingleDate(person.born) : ""}
                            {person.died ? `–${clientLib.renderSingleDate(person.died)}` : ""}
                        </h2>
                    </div>
                    <div>
                        <div className={styles.info}>
                            <span><b>Full name</b>{person.fullName}</span>
                            <span><b>Short name</b>{person.shortName}</span>
                            <span><b>Pronouns</b>{person.pronouns.subject} / {person.pronouns.object} / {person.pronouns.possessive}</span>
                            {person.born ? <span><b>Birth date</b>{clientLib.renderSingleDate(person.born)}</span> : ""}
                            {person.died ? <span><b>Death date</b>{clientLib.renderSingleDate(person.died)}</span> : ""}
                        </div>
                        <Link href={`/records/all?people=${person.id}`}>
                            <button className='secondary'>See records connected to this person <span className="material-icons">arrow_right_alt</span></button>
                        </Link>
                    </div>

                </div>
                <div className={styles.extraInfo}>
                    <h2>More details</h2>
                    <span><b>Created on</b>{person.createdAt}</span>
                    <span><b>Last updated</b>{person.updatedAt}</span>
                    <span><b>User ID</b>{person.id}</span>
                    <span><b>Family ID</b>{person.familyId}</span>
                </div>
            </div>

        </div>
    )
}

export default personView