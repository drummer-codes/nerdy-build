import * as fs from 'fs';
import * as path from 'path';
// import * as vscode from 'vscode';

export enum DataFormat {
    json = 'JSON'
}

export function createDir(dirOrFilePath: string): void {
    const dir = path.dirname(dirOrFilePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

export class File {

    constructor(private path: string) { }

    exists(): boolean {

        return fs.existsSync(this.path);

    }

    write(data: string): void {

        return fs.writeFileSync(this.path, data, { encoding: 'utf8' });

    }

    read(): string {

        return fs.readFileSync(this.path, {
            encoding: 'utf8',
            flag: 'r'
        }).toString();

    }

    parse(type: DataFormat): any {

        if (type === DataFormat.json) {

            try {

                return JSON.parse(this.read());

            } catch (e) {

                console.error('fs.ts', e);
                return null;

            }

        } else {

            return null;

        }

    }

}