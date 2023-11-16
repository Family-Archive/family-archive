import styles from './RegisterPage.module.scss'

import { getProviders } from "next-auth/react"
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import lib from '@/lib/lib';

import RegisterForm from '/components/RegisterForm/RegisterForm.js'

const page = async () => {
    const providers = await getProviders();
    const allowSelfRegistration = await lib.getSetting('allowselfregistration')
    const session = await getServerSession(authOptions);

    if (session || allowSelfRegistration !== "yes") {
        redirect('/')
    }

    return (
        <>
            <main className={styles.loginpage}>
                <RegisterForm providers={providers} />
            </main>
        </>
    )
}

export default page