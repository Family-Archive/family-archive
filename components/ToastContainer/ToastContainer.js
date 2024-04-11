"use client"

import styles from './ToastContainer.module.scss'

const ToastContainer = ({ toasts }) => {
    return <div className={styles.ToastContainer}>
        <div className={styles.toasts}>
            {Object.keys(toasts).map(id => {
                return <div
                    key={id}
                    className={styles.toast}
                    style={{
                        animation: `toast ${toasts[id]['duration']}s ease forwards`
                    }}
                >
                    <span>{toasts[id].message}</span>
                </div>
            })}
        </div>
    </div>
}

export default ToastContainer