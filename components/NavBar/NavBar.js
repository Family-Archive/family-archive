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
            <Link href='/'><img src='/logo1.svg' /></Link>
            {
                session ? <section className={styles.right}>
                    <button onClick={() => modalFunctions.addModal("Choose record type", <RecordSelector />)}>+ Add Record</button>
                    <button onClick={signOut}>Log Out</button>
                </section> : <Link href="/auth/login"><button>Log In</button></Link>
            }
        </nav>
    )
}

export default NavBar