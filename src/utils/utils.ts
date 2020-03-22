import { write } from './ls/write';
import * as path from 'path';
import { clear } from './ls/rm';
export function genId() {
    return Math.random()
        .toString()
        .replace('0.', '');
}

export function saveToFile(name: string, content: string) {
    const file_path = path.resolve(__dirname, `../../dist/${name}`);
    return write(file_path, content);
}
export function clearDist() {
    const file_path = path.resolve(__dirname, `../../dist/`);
    return clear(file_path);
}

export function genTab(n: number, withBr = true) {
    let result = withBr ? '\n' : '';
    for (let i = 0; i < n; i++) {
        result += '    ';
    }
    return result;
}
