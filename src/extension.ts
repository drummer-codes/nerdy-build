import * as vscode from 'vscode';
import { config, reloadConfig } from './config';
import { EXT_ID, onConfigFileChange } from './misc/utils';
import { output } from './misc/output';
import { minifyDocument } from './minify-document';

export function activate(context: vscode.ExtensionContext): void {
    reloadConfig(true);
    context.subscriptions.push(
        // Reload config.
        vscode.commands.registerCommand(`${EXT_ID}.loadConfig`, () => {
            reloadConfig(true);
            vscode.window.showInformationMessage('Configuration reloaded.');
        }),
        // Minify file.
        vscode.commands.registerCommand(`${EXT_ID}.minify`, () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No document open.');
                return;
            }
            if (editor.document.isUntitled) {
                vscode.window.showErrorMessage('File must be saved before it can be minified.');
                return;
            }
            minifyDocument(editor.document);
        }),
        // Minify on save.
        vscode.workspace.onDidSaveTextDocument(doc => {
            if (config.onSaveDelay) {
                setTimeout(() => {
                    minifyDocument(doc);
                }, config.onSaveDelay);
            } else {
                minifyDocument(doc);
            }
        }),
        // Reload minify config if the vscode config is modified
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(EXT_ID)) {
                reloadConfig(true);
                vscode.window.showInformationMessage('Configuration reloaded.');
            }
        })
    );
    const watcher = vscode.workspace.createFileSystemWatcher('**', false, false, false)
    watcher.onDidCreate(onConfigFileChange);
    watcher.onDidChange(onConfigFileChange);
    watcher.onDidDelete(onConfigFileChange);
    context.subscriptions.push(watcher);
    console.log('nerdy-build is now active!');
}

export function deactivate(): void {
    output.dispose();
}
