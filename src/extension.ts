import * as vscode from 'vscode';

const EXT_ID = 'nerdy-recolor';

export function activate(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.commands.registerCommand(`${EXT_ID}.onlyColors`, () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No document open.');
                return;
            }
            const document = editor.document;
            if (document.languageId !== 'css') {
                vscode.window.showErrorMessage('Not a CSS file');
                return;
            }
            let lineIndex = 0;
            const newLines : string[] = [];
            const range = new vscode.Range(document.lineAt(0).range.start, document.lineAt(document.lineCount - 1).range.end);
            while(lineIndex < document.lineCount) {
                let line = document.lineAt(lineIndex).text;
                lineIndex++;
                if(!line.startsWith('    ')) {
                    newLines.push(line);
                }
                else if(line.includes(':')) {
                    if(line.split(':')[0].includes('color')) {
                        newLines.push(line);
                    }
                    else if(line.match(/(#(?:[0-9a-f]{2}){2,4}|#[0-9a-f]{3}|(?:rgba?|hsla?)\((?:\d+%?(?:deg|rad|grad|turn)?(?:,|\s)+){2,3}[\s\/]*[\d\.]+%?\))/i)) {
                        newLines.push(line);
                    }
                }
            }
            editor.edit(editBuilder => {
                editBuilder.replace(range, newLines.join("\n"));
            });
        })
    );
    console.log('nerdy-css-recolor is now active!');
}
