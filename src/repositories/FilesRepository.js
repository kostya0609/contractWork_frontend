import {BaseRepository} from "./BaseRepository";

export class FilesRepository extends BaseRepository {
    constructor() {
        super('files');
    }

    /**
     * @param {object} payload
     * @return Promise<any>
     */
    async downloadFile(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'download',
            options : {download_file : true}
        });

         if (!result)
             throw new Error(result.message);

        return result;
    }


}