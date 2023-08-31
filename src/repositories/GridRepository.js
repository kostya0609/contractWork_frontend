import {BaseRepository} from "./BaseRepository";

export class GridRepository extends BaseRepository {
    constructor() {
        super('add','default');
        this._url = 'https://bitrix.bsi.local/api/grid/filter/preset';
    }

    /**
     * @param {Object} payload
     * @return Promise<any>
     */
    async loadFilter(payload) {
        const result = await this._query({
            payload,
        });

        if (result.status !== 'success')
            throw new Error(result.message);

        return result;
    }

}