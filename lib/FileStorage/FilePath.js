export default class FilePath {
    hash;
    firstDirectory;
    secondDirectory;
    fileName;
    directories;
    path;

    /**
     * Constructor
     * 
     * @param {string} hash Hash of file contents as a
     * hex-encoded string
     */
    constructor(hash) {
        this.hash = hash;
        this.firstDirectory = hash.substring(0, 2);
        this.secondDirectory = hash.substring(2, 4);
        this.fileName = hash.substring(4);
        this.directories = `${process.env.FILESTORAGE_PATH}/${this.firstDirectory}/${this.secondDirectory}`;

        this.path = `${process.env.FILESTORAGE_PATH}/${this.firstDirectory}/${this.secondDirectory}/${this.fileName}`;
    }
}