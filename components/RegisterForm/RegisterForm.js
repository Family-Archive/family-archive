"use client"
import styles from './RegisterForm.module.scss'
import { signIn } from "next-auth/react"

/**
 * Register form component
 * providers - A list of all login providers
 */

const RegisterForm = ({ providers }) => {
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
                <formitem>
                    <label htmlFor='email'>Email</label>
                    <input type='text' name='email' id='email' />
                </formitem>
                <formitem>
                    <label htmlFor='name'>Name</label>
                    <input type='text' name='name' id='name' />
                </formitem>
                <formitem>
                    <label htmlFor='password'>Password</label>
                    <input type='password' name='password' id='password' />
                </formitem>
                <button onClick={() => signIn('signup', {
                    email: document.querySelector('#email').value,
                    name: document.querySelector('#name').value,
                    password: document.querySelector('#password').value,
                })}>Register</button>
            </div>
        </section>
    </section>
}

export default RegisterForm
