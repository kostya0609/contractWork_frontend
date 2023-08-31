import { ref } from "vue";

export const svg = `
<path class="path" d="
  M 30 15
  L 28 17
  M 25.61 25.61
  A 15 15, 0, 0, 1, 15 30
  A 15 15, 0, 1, 1, 27.99 7.5
  L 15 15
" style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
`;

export const domain           = ref( 'https://bitrix.bsi.local' + '/api');

export function req(url, data, type, downloadRequest) {
 
        let body, header = {};

        if (type === 'file') {
            body = data;
            body.append('token', window.token);
        } else {
            body = { ...data, token: window.token };
            header['Content-Type'] = 'application/json;charset=utf-8';
        }

        return fetch(
            domain.value + url,
            {
                method: 'post',
                headers: header,
                body: type === 'file' ? body : JSON.stringify(body, function (key, val) {
                    return (typeof val === 'function') ? '' + val : val;
                })
            }
        ).then(res => {
            return new Promise((resolve, reject) => {
                if (!res.ok)
                    throw new Error('Response server - status code ' + res.status);
                else {

                    if (downloadRequest) {
                        resolve(res)
                    } else {
                        res.json().then(json => {
                            resolve(json)
                        }).catch(err => {
                            reject(err);
                        })
                    }

                }
            })
        }).catch(err => {
            return new Promise((resolve, reject) => {
                reject({ status: 'error', message: 'Некорректный ответ сервера', system: err.message })
            })
        });

  };

export function reqBlob(url, data) {
 
    let body = { ...data, token: window.token };
      
    return fetch(
        domain.value + url,
        {
            method: 'post',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(body, function (key, val) {
                return (typeof val === 'function') ? '' + val : val;
            })
        }
    ).then(res => {
        return new Promise((resolve, reject) => {
            if (!res.ok)
                throw new Error('Response server - status code ' + res.status);
            else {

                res.blob().then(blob => {
                    resolve(blob)
                }).catch(err => {
                    reject(err);
                })
                

            }
        })
    }).catch(err => {
        return new Promise((resolve, reject) => {
            reject({ status: 'error', message: 'Некорректный ответ сервера', system: err.message })
        })
    });

};