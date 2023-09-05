import {BaseRepository} from "./BaseRepository";

export class CreditRepository extends BaseRepository {
    constructor() {
        super('credit');
    }

    /**
     * @param {object} payload
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