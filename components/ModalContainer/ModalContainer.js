import styles from './ModalContainer.module.scss'

import { useContext } from 'react'
import { ModalContext } from '@/app/(contexts)/ModalContext'

/**
 * A container that wraps the entire app, allowing any client component to display modals
 * modals: A list of modals to be displayed
 */

const ModalContainer = ({ modals }) => {
    const _modals = modals
    const modalFunctions = useContext(ModalContext)

    return (
        <div
            className={`
                ${styles.ModalContainer}
                ${modals.length > 0 ? styles.active : ''}
            `}
        >
            {_modals.map(modal =>
                <div
                    className={`${styles.modal} ${modal.styles}`}
                    key={modal.id}
                    id={`modal${modal.id}`}
                >
                    <button type="button" className={`${styles.close} tertiary`} onClick={modalFunctions.popModal}><span className="material-icons">close</span></button>
                    <h1>{modal.title}</h1>
                    {modal.content}
                </div>
            )}
        </div>
    )
}

export default ModalContainer