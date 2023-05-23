import styles from './login.module.scss'

import { getProviders } from "next-auth/react"
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

import LoginForm from '/components/LoginForm/LoginForm.js'

const page = async () => {
    const providers = await getProviders();
    const session = await getServerSession(authOptions);

    if (session) {
        redirect('/')
    }

    return (
        <>
            <main className={styles.loginpage}>
                <LoginForm providers={providers} />
            </main>
        </>
    )
}

export default page