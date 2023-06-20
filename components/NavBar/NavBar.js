"use client"
import styles from './NavBar.module.scss'

import { useContext, useEffect, useState } from 'react'
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import Link from 'next/link'

import { ModalContext } from '@/app/(contexts)/ModalContext'
import { FamilyContext } from '@/app/(contexts)/FamilyContext'
import RecordSelector from '../RecordSelector/RecordSelector'
import SelectorInput from '../SelectorInput/SelectorInput'

const NavBar = () => {
    const { data: session, status } = useSession()
    const modalFunctions = useContext(ModalContext)
    const familyContext = useContext(FamilyContext)

    let familySelectOptions
    if (session) {
        familySelectOptions = session.user.families.map(family => { return { value: family.id, name: `${family.name} family` } })
        familySelectOptions.unshift({ value: 'addFamily', name: 'Add new family' })
    }

    return (
        <nav className={styles.navbar}>
            <section className={styles.top}>
                <section className={styles.header}>
                    <Link href='/'><img src='/logo.svg' /></Link>
                    {session ?
                        <button className={styles.addRecord} onClick={() => modalFunctions.addModal("Choose record type", <RecordSelector />)}><span className="material-icons">add_circle</span> Add Record</button>
                        : <Link href="/auth/login"><button>Log In</button></Link>
                    }
                </section>

                <section className={styles.navLinks}>
                    <Link className={styles.button} href='/records/all'><span className="material-icons">inventory</span>All records</Link>
                    <button><span className="material-icons">watch_later</span>Timeline</button>
                    <button><span className="material-icons">public</span>Map</button>
                    <button><span className="material-icons">account_tree</span>Family tree</button>
                </section>
            </section>

            <section className={styles.bottom}>

                {session ? <SelectorInput
                    default={familyContext.family}
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

                {session ? <a className="secondary" href="#" onClick={signOut}>Log Out</a> : ""}

            </section>
        </nav>
    )
}

export default NavBar