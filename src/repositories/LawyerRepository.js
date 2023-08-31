import {BaseRepository} from "./BaseRepository";

export class LawyerRepository extends BaseRepository {
    constructor() {
        super('lawyer');
    }

    /**
     * @param {FormData} payload
     * @return Promise<any>
     */
    async addComment(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'add-comment',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }

    /**
     * @param {Object} payload
     * @return Promise<any>
     */
    async deleteComment(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint: 'delete-comment',
        });

        if (!result.success)
            throw new Error(result.message);

        return result;
    }

}