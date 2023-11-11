"use client"
import styles from './LoginForm.module.scss'
import { signIn } from "next-auth/react"

const LoginForm = (props) => {
    return (
        <section className={styles.container}>
            <img src='/logo.svg' />
            <section className={styles.providers}>

                <input type='text' name='email' id='email' />
                <input type='password' name='password' id='password' />
                <button onClick={() => signIn('credentials', {
                    email: document.querySelector('#email').value,
                    password: document.querySelector('#password').value,
                })}>Sign in with email and password</button>

                {Object.values(props.providers).map((provider) => {
                    if (provider.name != 'credentials') {
                        return <div key={provider.name}>
                            <button onClick={() => signIn(provider.id)}>
                                Sign in with {provider.name}
                            </button>
                        </div>
                    }
                })}
            </section>
        </section>
    )
}

export default LoginForm
