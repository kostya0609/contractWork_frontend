import {BaseRepository} from "./BaseRepository";

export class SearchRepository extends BaseRepository {
    constructor() {
        super('search');
    }

    /**
     * @param {string} query
     * @return Promise<any>
     */
    async searchUsers(query) {
        const result = await this._query({
            nestedEndpoint: 'user',
            payload : {q : query},
        });

        if (!result.success)
            throw new Error(result.message);

        return result.data;
    }

    /**
     * @param {string} query
     * @return Promise<any>
     */
    async searchOrganization(query) {
        const result = await this._query({
            nestedEndpoint: 'organization',
            payload : {q : query},
        });

        if (!result.success)
            throw new Error(result.message);

        return result.data;
    }

    /**
     * @param {string} query
     * @return Promise<any>
     */
    async searchContragent(query) {
        const result = await this._query({
            nestedEndpoint: 'contragent',
            payload : {q : query},
        });

        if (!result.success)
            throw new Error(result.message);

        return result.data;
    }

    /**
     * @param {string} query
     * @return Promise<any>
     */
    async searchDepartment(query) {
        const result = await this._query({
            nestedEndpoint: 'department',
            payload : {q : query},
        });

        if (!result.success)
            throw new Error(result.message);

        return result.data;
    }
}