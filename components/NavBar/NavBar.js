"use client"
import styles from './NavBar.module.scss'

import { useContext } from 'react'
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import Link from 'next/link'

import { ModalContext } from '@/app/(contexts)/ModalContext'
import RecordSelector from '../RecordSelector/RecordSelector'

const NavBar = () => {
    const { data: session, status } = useSession()
    const modalFunctions = useContext(ModalContext)

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

            {session ? <a className="secondary" href="#" onClick={signOut}>Log Out</a> : ""}
        </nav>
    )
}

export default NavBar