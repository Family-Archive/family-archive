"use client"
import Link from 'next/link'
import styles from './LoginForm.module.scss'
import { signIn } from "next-auth/react"
import { ToastContext } from '@/app/(contexts)/ToastContext'
import { useContext } from 'react'

/**
 * Login form component
 * providers - A list of all login providers
 * allowSelfRegistration - is self-reg allowed?
 */

const LoginForm = ({ providers, allowSelfRegistration }) => {
    const toastFunctions = useContext(ToastContext)

    return (
        <section className={styles.container}>
            <img src='/logo.svg' />
            <section className={styles.providers}>

                <div className={styles.manualLogin}>
                    <formitem>
                        <label htmlFor='email'>Email</label>
                        <input type='text' name='email' id='email' />
                    </formitem>
                    <formitem>
                        <label htmlFor='password'>Password</label>
                        <input type='password' name='password' id='password' />
                    </formitem>
                    <button onClick={async e => {
                        const result = await signIn('login', {
                            redirect: false,
                            email: document.querySelector('#email').value,
                            password: document.querySelector('#password').value,
                        })
                        if (result.error) {
                            toastFunctions.createToast(result.error)
                        } else {
                            window.location.href = '/'
                        }
                    }}
                    >
                        Sign in with email and password
                    </button>
                </div>

                <hr />

                {Object.values(providers).map((provider) => {
                    if (provider.name != 'credentialsLogin' && provider.name != 'credentialsSignup') {
                        return <div key={provider.name}>
                            <button className="tertiary" onClick={() => signIn(provider.id)}>
                                <img src={`/icons/logos/${provider.name.toLowerCase()}.svg`} />
                                Sign in with {provider.name}
                            </button>
                        </div>
                    }
                })}

                {allowSelfRegistration && allowSelfRegistration === 'yes' ? <div className={styles.selfReg}>
                    <Link href='/auth/register'>No account? Sign up here</Link>
                </div> : ""
                }
            </section>
        </section>
    )
}

export default LoginForm
