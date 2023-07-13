import {BaseRepository} from "./BaseRepository";

export class ContractRepository extends BaseRepository {
    constructor() {
        super('contracts');
    }

    /**
     * @param {Object} payload
     * @returns {Promise<{ data: {companyTypes: array, contractTypes: array, contractDirections:array}, notify: { title:string, message?: string, type:string, duration?: string}, message?: string}>}
     */
    async getAdditionalInfo(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'get-additional-info',
        });

        if(!result.success)
            throw new Error(result.message);

        return result;
    }

    /**
     * @param {FormData} payload
     * @return Promise<any>
     */
    async create(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'create',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }

    /**
     * @param {FormData} payload
     * @return Promise<any>
     */
    async edit(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'edit',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }

    /**
     * @param {FormData} payload
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
     * @param {object} payload
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
     * @param {object} payload
     * @return Promise<any>
     */
    async needActionList(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'need-action-list',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
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

    /**
     * @param {object} payload
     * @return Promise<any>
     */
    async detail(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'detail',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }

    /**
     * @param {object} payload
     * @return Promise<any>
     */
    async changeStatus(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'change-status',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }
}