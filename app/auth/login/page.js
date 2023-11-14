import styles from './login.module.scss'

import { getProviders } from "next-auth/react"
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import lib from '@/lib/lib';

import LoginForm from '/components/LoginForm/LoginForm.js'

const page = async () => {
    const providers = await getProviders();
    const session = await getServerSession(authOptions);

    if (session) {
        redirect('/')
    }

    const allowSelfRegistration = await lib.getSetting('allowselfregistration')

    return (
        <>
            <main className={styles.loginpage}>
                <LoginForm providers={providers} allowSelfRegistration={allowSelfRegistration} />
            </main>
        </>
    )
}

export default page