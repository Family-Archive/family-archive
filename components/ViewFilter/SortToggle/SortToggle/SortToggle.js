"use client"
import styles from './SortToggle.module.scss'

const SortToggle = (props) => {

    const getSortSettings = () => {
        const settings = {
            option: props.option.toLowerCase(),
            direction: props.settings.direction === 'asc' ? 'desc' : 'asc'
        }

        return settings
    }

    return (
        <button
            onClick={() => props.updateSortSettings(getSortSettings())}
            className={`${styles.SortToggle} secondary`}
        >
            {props.option}
            <span
                className={`
                    material-icons
                    ${styles.arrow}
                    ${props.settings.option == props.option.toLowerCase() ? styles.visible : ""}
                    ${props.settings.direction === 'asc' ? styles.flipped : ''}
                `}
            >
                arrow_drop_down
            </span>
        </button>
    )
}

export default SortToggle