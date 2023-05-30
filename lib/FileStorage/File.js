import FilePath from './FilePath'

/**
 * Represents a file in the file system.
 */
export default class File {
    file;
    name;
    size;
    type;
    hash = null;
    path = null;
    buffer = null;

    /**
     * Do not call this constructor directly; use create() instead!
     * 
     * Expects to receive the generic object representing a
     * row in the Files table from the Prisma Client.
     * 
     * @param {object} properties
     */
    constructor(file) {
        this.file = file;
        this.name = file.name;
        this.size = file.size;
        this.type = file.type;
        this.hash = file.hash !== undefined ? file.hash : null;
    }

    /**
     * Create a new instance of this class based on an
     * uploaded file. 
     * 
     * @param {object} file
     * @return {File}
     */
    static async create(uploadedFile) {
        const file = new this(uploadedFile);

        // We can't call async functions in the constructor so we do it here.
        await file.loadHash();
        file.loadPath();

        return file;
    }

    /**
     * Create an instance of this class from a file record
     * already in the database.
     * 
     * @param {object} fileRow A row from the Files table of 
     * the database 
     * @return {File}
     */
    static load(fileRow) {
        const file = new this(fileRow);

        file.loadPath();

        return file;
    }

    loadPath() {
        if (!this.hash) {
            throw new Error('Cannot load path until after loadHash() has been called!');
        }

        this.path = new FilePath(this.hash);
    }

    getPath() {
        return this.path.path;
    }

    /**
     * Get a hash of the file's contents as a hexadecimal string.
     * For more details: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API/Non-cryptographic_uses_of_subtle_crypto#hashing_a_file
     * 
     * @returns string
     */
    async loadHash() {
        const arrayBuffer = await this.getArrayBuffer();
        const hashAsArrayBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const uint8ViewOfHash = new Uint8Array(hashAsArrayBuffer);
        const hashAsString = Array.from(uint8ViewOfHash)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');

        this.hash = hashAsString;
    }

    async getArrayBuffer() {
        if (!this.arrayBuffer) {
            this.arrayBuffer = await this.file.arrayBuffer();
        }

        return this.arrayBuffer;
    }
}