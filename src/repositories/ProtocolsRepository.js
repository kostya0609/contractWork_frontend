import {BaseRepository} from "./BaseRepository";

export class ProtocolsRepository extends BaseRepository {
    constructor() {
        super('protocols');
    }

    /**
     * @param {FormData} payload
     * @return Promise<any>
     */
    async addProtocol(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'add',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }

    /**
     * @param {Object} payload
     * @return Promise<any>
     */
    async deleteProtocol(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'delete',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }

}