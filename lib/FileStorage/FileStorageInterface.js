/**
 * This class serves as an interface for the various types
 * of file systems that can be used. All file system classes
 * must extend this interface.
 */
export default class FileStorageInterface {
    /**
     * Return the path to the requested file.
     * 
     * @param {number} fileId 
     * @return {string} File path
     */
    getPath(fileId) {
        throw new Error('File storage type must implement getPath()!');
    }

    /**
     * Store the provided file in the file system.
     * 
     * @param {File} file File object returned from FormData
     */
    store(file) {
        throw new Error('File storage type must implement store()!');
    }
}