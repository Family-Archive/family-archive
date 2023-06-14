"use client"
import styles from './LoginForm.module.scss'
import { signIn } from "next-auth/react"

const LoginForm = (props) => {
    return (
        <section className={styles.container}>
            <img src='/logo.svg' />
            <section className={styles.providers}>
                {Object.values(props.providers).map((provider) => (
                    <div key={provider.name}>
                        <button onClick={() => signIn(provider.id)}>
                            Sign in with {provider.name}
                        </button>
                    </div>
                ))}
            </section>
        </section>
    )
}

export default LoginForm
