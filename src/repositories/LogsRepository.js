import {BaseRepository} from "./BaseRepository";

export class LogsRepository extends BaseRepository {
    constructor() {
        super('logs');
    }

    /**
     * @param {Object} payload
     * @return Promise<any>
     */
    async get(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'get',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }

}