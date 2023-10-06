"use client"
import styles from './NavBar.module.scss'

import { useContext } from 'react'
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import Link from 'next/link'

import { ModalContext } from '@/app/(contexts)/ModalContext'
import { FamilyContext } from '@/app/(contexts)/FamilyContext'
import { DraftContext } from '@/app/(contexts)/DraftContext'
import RecordSelector from '../RecordSelector/RecordSelector'
import SelectorInput from '../SelectorInput/SelectorInput'
import Dropdown from '../Dropdown/Dropdown'

const NavBar = () => {
    const { data: session, status } = useSession()
    const modalFunctions = useContext(ModalContext)
    const familyContext = useContext(FamilyContext)
    const draftContext = useContext(DraftContext)

    // Build set of options that will be passed to family selector
    let familySelectOptions
    if (session) {
        familySelectOptions = session.user.families.map(family => { return { value: family.id, name: `${family.name} family` } })
        familySelectOptions.unshift({ value: 'addFamily', name: '<span class="material-icons">add_circle</span>  Add new family', settable: false })
    }

    return (
        <nav className={styles.navbar}>
            <section className={styles.top}>
                <section className={styles.header}>
                    <Link href='/'><img src='/logo.svg' /></Link>
                    {session ?
                        <Dropdown
                            icon="account_circle"
                            title=""
                            options={[
                                <button onClick={signOut}>Log Out</button>,
                            ]}
                        />
                        : <Link href="/auth/login"><button>Log In</button></Link>
                    }
                </section>

                {session ?
                    <section className={styles.mainButtons}>
                        <button className={styles.addRecord} onClick={() => modalFunctions.addModal("Choose record type", <RecordSelector />)}><span className="material-icons">add_circle</span> Add Record</button>
                        <Link className={styles.drafts} href='/drafts'>
                            {draftContext.count > 0 ? <span className={styles.draftCount}>{draftContext.count}</span> : ""}
                            <button className={`${draftContext.count > 0 ? 'secondary' : 'tertiary'}`}><span className="material-icons">design_services</span>Drafts</button>
                        </Link>
                    </section>
                    : ""
                }

                <section className={styles.navLinks}>
                    <Link className={styles.button} href='/records/all'><span className="material-icons">inventory</span>All records</Link>
                    <Link className={styles.button} href='/collection'><span className="material-icons">collections_bookmark</span>Collections</Link>
                    <button><span className="material-icons">watch_later</span>Timeline</button>
                    <button><span className="material-icons">public</span>Map</button>
                    <button><span className="material-icons">account_tree</span>Family tree</button>
                </section>
            </section>

            <section className={styles.bottom}>

                {/* If we're logged in, display the family selector */}
                {/* Set as default whatever is in the family context; if this isn't anything, use the defaultfamily from the session */}
                {/* When changed, set the family, unless the value is "addFamily" -- then display the modal */}
                {session ? <SelectorInput
                    default={familyContext.family ? familyContext.family : session.user.defaultFamily.id}
                    options={familySelectOptions}
                    onChange={(valueToSet) => {
                        if (valueToSet === "addFamily") {
                            modalFunctions.addModal(
                                "Add new family",
                                <form action='/api/family' method='POST'>
                                    <div>
                                        <label htmlFor="name">Family Name</label>
                                        <input type='text' id='name' name='name' />
                                    </div>
                                    <input type='submit' value="Add family" className="button primary" />
                                </form>
                            )
                            return
                        }
                        familyContext.setFamily(valueToSet)
                    }}
                /> : ""}

                {session ? <span className={`material-icons ${styles.settings}`}>settings</span> : ""}
            </section>
        </nav>
    )
}

export default NavBar