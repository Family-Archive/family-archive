"use client"
import styles from './NavBar.module.scss'

import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import Link from 'next/link'

const NavBar = () => {
    const { data: session, status } = useSession()

    return (
        <nav className={styles.navbar}>
            <img src='/logo1.svg' />
            {
                session ? <section className={styles.right}>
                    <h1>Welcome, {session.user.name}!</h1>
                    <button onClick={signOut}>Log Out</button>
                </section> : <Link href="/auth/login"><button>Log In</button></Link>
            }
        </nav>
    )
}

export default NavBar