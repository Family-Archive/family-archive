"use client"
import styles from './RegisterForm.module.scss'
import { signIn } from "next-auth/react"
import { ToastContext } from '@/app/(contexts)/ToastContext'
import { useContext } from 'react'

/**
 * Register form component
 * providers - A list of all login providers
 */

const RegisterForm = ({ providers }) => {
    const toastFunctions = useContext(ToastContext)

    return <section className={styles.container}>
        <img src='/logo.svg' />

        <section className={styles.providers}>

            {Object.values(providers).map((provider) => {
                if (provider.name != 'credentialsSignup' && provider.name != 'credentialsLogin') {
                    return <div key={provider.name}>
                        <button className="tertiary" onClick={() => signIn(provider.id)}>
                            <img src={`/icons/logos/${provider.name.toLowerCase()}.svg`} />
                            Sign up with {provider.name}
                        </button>
                    </div>
                }
            })}

            <br /><hr />

            <div className={styles.manualLogin}>
                <div className='formitem'>
                    <label htmlFor='email'>Email</label>
                    <input type='text' name='email' id='email' />
                </div>
                <div className='formitem'>
                    <label htmlFor='name'>Name</label>
                    <input type='text' name='name' id='name' />
                </div>
                <div className='formitem'>
                    <label htmlFor='password'>Password</label>
                    <input type='password' name='password' id='password' />
                </div>
                <button onClick={async () => {
                    const result = await signIn('signup', {
                        redirect: false,
                        email: document.querySelector('#email').value,
                        name: document.querySelector('#name').value,
                        password: document.querySelector('#password').value,
                    })
                    if (result.error) {
                        toastFunctions.createToast(result.error)
                    } else {
                        window.location.href = '/'
                    }
                }}
                >
                    Register
                </button>
            </div>
        </section>
    </section>
}

export default RegisterForm
