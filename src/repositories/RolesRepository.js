import {BaseRepository} from "./BaseRepository";

export class RolesRepository extends BaseRepository {
    constructor() {
        super('roles');
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

    /**
     * @param {Object} payload
     * @return Promise<any>
     */
    async add(payload) {
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
    async list(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'list',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }

    /**
     * @param {Object} payload
     * @return Promise<any>
     */
    async delete(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'delete',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }

    /**
     * @param {Object} payload
     * @return Promise<any>
     */
    async additionalGet(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'additional/get',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }

    /**
     * @param {Object} payload
     * @return Promise<any>
     */
    async additionalSet(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'additional/set',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }

    /**
     * @param {Object} payload
     * @return Promise<any>
     */
    async additionalList(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'additional/list',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }

}