import styles from './FIleSelector.module.scss'

const FileSelector = (props) => {
    return (
        <div className={styles.FileSelector}>
            {props.files.map(file => {
                return <button
                    key={file.id}
                    onClick={() => props.setFile(file.id)}
                    className={styles.file}
                >
                    {file.mimeType.includes("image") ?
                        <img src={`/api/file/${file.id}`} /> :
                        <span className="material-icons">description</span>}
                    {file.name}
                </button>
            })}
        </div>
    )
}

export default FileSelector