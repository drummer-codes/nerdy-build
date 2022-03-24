import * as vscode from 'vscode';
import { config, reloadConfig } from '../config';
import * as path from 'path';

export const EXT_ID = 'nerdy-build';
export const SUPPORTED_FILES = [
    'javascript',
    'css'
];

export function efficiency(original: number, minified: number): number {
    return original === 0 ? 0 : Number((100 - ((minified / original) * 100)).toFixed(2));
}

export function isInSourceFolder(doc: vscode.TextDocument): boolean {
    if (!vscode.workspace.workspaceFolders) return false;
    const sourceFullPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, config.sourceFolder);
    return path.dirname(doc.uri.fsPath).startsWith(sourceFullPath);
}

export function getSubPath(doc: vscode.TextDocument): string {
    if (!vscode.workspace.workspaceFolders) {
        console.log('Not in a workspace');
        return '';
    }
    const sourceFullPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, config.sourceFolder);
    const fullPath = path.resolve(doc.uri.fsPath);
    return fullPath.substring(sourceFullPath.length);
}

export function getOutPath(doc: vscode.TextDocument): string {
    if (!vscode.workspace.workspaceFolders) {
        console.log('Not in a workspace');
        return '';
    }

    const publicFullPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, config.publicFolder);
    const sourceFullPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, config.sourceFolder);
    const inSource = isInSourceFolder(doc);
    const fullPath = path.resolve(doc.uri.fsPath);
    const subPath = fullPath.substring(sourceFullPath.length);
    const finalPath = path.join(publicFullPath, subPath);

    console.log({
        rawPath: doc.uri.fsPath,
        fullPath,
        subPath,
        publicFullPath,
        sourceFullPath,
        inSource,
        finalPath,
    });

    return finalPath;
}

function isConfigFile(path: string): boolean {

    return path.endsWith(config.uglifyConfigFile) || path.endsWith(config.cleancssConfigFile) || path.endsWith(config.autoprefixerConfigFile);

}

export function onConfigFileChange(uri: vscode.Uri) {

    if (isConfigFile(uri.path)) {

        reloadConfig(true);
        vscode.window.showInformationMessage('Minify configuration reloaded.');

    }

}



