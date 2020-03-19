import * as http from 'http';
import * as https from 'https';

export function getUrl(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const get = url.indexOf('https') === -1 ? http.get : https.get;

        get(url, res => {
            res.setEncoding('utf8');
            let data = '';
            res.on('data', function(chunk) {
                data += chunk;
            });
            res.on('end', function() {
                resolve(data);
            }).on('error', err => {
                reject(err);
            });
        });
    });
}
