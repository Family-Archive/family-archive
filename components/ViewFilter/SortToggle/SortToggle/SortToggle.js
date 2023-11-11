"use client"
import styles from './SortToggle.module.scss'

const SortToggle = (props) => {

    const getSortSettings = () => {
        let newDirection
        if (props.settings.direction) {
            newDirection = props.settings.direction === 'asc' ? 'desc' : 'asc'
        } else {
            newDirection = 'desc'
        }

        const settings = {
            option: props.option,
            direction: newDirection
        }

        return settings
    }

    return (


        <button
            onClick={() => props.updateSortSettings(getSortSettings())}
            className={`${styles.SortToggle} secondary`}
        >
            {props.label || props.option}
            <span
                className={`
                    material-icons
                    ${styles.arrow}
                    ${props.settings.direction === 'asc' && props.settings.option == props.option ? styles.flipped : ''}
                `}
            >
                {props.settings.direction && props.settings.option == props.option ? "arrow_drop_down" : ""}
            </span>
        </button>
    )
}

export default SortToggle