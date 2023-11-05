import styles from './FIleSelector.module.scss'

/**
 * Helper component for the overall viewer that gives us a little file selector bar
 * files: The list of files in the viewer
 * setFile: A callback function to call when a file is selected
 */

const FileSelector = ({ files, setFile }) => {
    return (
        <div className={styles.FileSelector}>
            {files.map(file => {
                return <button
                    key={file.id}
                    onClick={() => setFile(file.id)}
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