import {BaseRepository} from "./BaseRepository";

export class ProcessRepository extends BaseRepository {
    constructor() {
        super('document','v2');
        this._url = 'https://bitrix.bsi.local/api/process';
    }

    /**
     * @param {Object} payload
     * @return Promise<any>
     */
    async getProcessDoc(payload){
        const result = await this._query({
            payload,
            nestedEndpoint: 'get',
        });

        if (result.status !== 'success')
            throw new Error(result.message);

        return result;
    }

    /**
     * @param {Object} payload
     * @return Promise<any>
     */
    async deleteProcessDoc(payload){
        const result = await this._query({
            payload,
            nestedEndpoint: 'delete',
        });

        if (result.status !== 'success')
            throw new Error(result.message);

        return result;
    }

}