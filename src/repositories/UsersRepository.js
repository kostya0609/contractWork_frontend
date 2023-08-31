import {BaseRepository} from "./BaseRepository";

export class UsersRepository extends BaseRepository {
    constructor() {
        super('users');
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