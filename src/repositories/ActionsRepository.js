import {BaseRepository} from "./BaseRepository";

export class ActionsRepository extends BaseRepository {
    constructor() {
        super('actions');
    }

    /**
     * @param {FormData} payload
     * @return Promise<any>
     */
    async update(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'update',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }

    /**
     * @param {FormData} payload
     * @return Promise<any>
     */
    async badge(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'badge',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }

}