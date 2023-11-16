import LocalFileSystem from './FileStorageTypes/LocalFileSystem'

export default class FileStorageFactory {
    /**
     * Return an instance of the currently configured
     * file storage type for the site.
     * 
     * @return {FileStorageInterface}
     */
    static instance() {
        switch (process.env.FILESTORAGE_TYPE) {
            case 'local':
                return new LocalFileSystem();
        }

        throw new Error('The configured file system type could not be found.');
    }
}