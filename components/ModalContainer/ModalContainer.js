import styles from './ModalContainer.module.scss'

import { useContext } from 'react'
import { ModalContext } from '@/app/(contexts)/ModalContext'

const ModalContainer = (props) => {
    const modals = props.modals
    const modalFunctions = useContext(ModalContext)

    return (
        <div
            className={`
                ${styles.ModalContainer}
                ${props.modals.length > 0 ? styles.active : ''}
            `}
        >
            {modals.map(modal =>
                <div
                    className={`${styles.modal} ${modal.styles}`}
                    key={modal.id}
                    id={`modal${modal.id}`}
                >
                    <button className={styles.close} onClick={modalFunctions.popModal}>X</button>
                    <h1>{modal.title}</h1>
                    {modal.content}
                </div>
            )}
        </div>
    )
}

export default ModalContainer