import * as vscode from 'vscode';
import * as path from 'path';
import { config } from './config';
import { output } from './misc/output';
import { CssMinifier } from './files/css';
import { EsMinifier } from './files/js';
import { isInSourceFolder, getOutPath, getSubPath } from './misc/utils';
import { File, createDir } from './misc/fs';
import { existsSync } from "fs";

export function minifyDocument(doc: vscode.TextDocument): void {
    if (!vscode.workspace.workspaceFolders) {
        return;
    }
    if (!isInSourceFolder(doc)) {
        return;
    }
    vscode.window.setStatusBarMessage(`\\${config.publicFolder}${getSubPath(doc)} : Processing`, 2000);
    const text = doc.getText();
    const baseName = path.basename(doc.fileName);
    const outPath = getOutPath(doc);
    const sftp = vscode.extensions.getExtension('Natizyskunk.sftp');
    const afterDone = () => {
        vscode.window.setStatusBarMessage(`\\${config.publicFolder}${getSubPath(doc)} : Minified`, 2000);
        if (config.sftpUpload && sftp && sftp.isActive) {
            vscode.commands.executeCommand('sftp.upload.file', vscode.Uri.file(outPath)).then(() => {
                if (existsSync(outPath + '.map')) {
                    vscode.commands.executeCommand('sftp.upload.file', vscode.Uri.file(outPath + '.map'));
                }
                setTimeout(() => vscode.window.setStatusBarMessage(`\\${config.publicFolder}${getSubPath(doc)} : Uploading`, 1500), 1500);
            });
        }
    };
    // Minify
    switch (doc.languageId) {
        case 'css': {
            const minifier = new CssMinifier(config.css, { use: config.enableAutoprefixer, options: config.autoprefixer });
            const res = minifier.minify({
                file: doc.fileName,
                data: text
            });
            if (res.success) {
                try {
                    createDir(outPath);
                    if (config.genCSSmap === true || config.genCSSmap === null) {
                        const map = JSON.parse(res.output.map);
                        map.sources = [baseName];
                        new File(`${outPath}.map`).write(JSON.stringify(map));
                        res.output.code += `\n/*# sourceMappingURL=${path.basename(outPath)}.map */\n`;
                    }
                    new File(outPath).write(res.output.code);
                    output.printMinifyResult(`${baseName}`, res);
                    if (res.warnings.length && config.showLogOnWarning) {
                        output.show();
                    }
                    afterDone();
                } catch (e) {
                    console.log(e);
                    vscode.window.showErrorMessage('Failed to write to file. Does the output path exist?');
                }
            } else if (config.showLogOnError) {
                output.printMinifyResult(`${baseName}`, res);
                output.show();
            } else {
                output.printMinifyResult(`${baseName}`, res);
            }
            break;
        }
        case 'javascript': {
            const minifier = new EsMinifier(config.js);
            const res = minifier.minify(text, baseName, {
                outFileName: path.basename(outPath),
                jsMapSource: "",
            });
            if (res.success) {
                try {
                    createDir(outPath);
                    if (config.genJSmap === true || config.genJSmap === null) {
                        new File(`${outPath}.map`).write(JSON.stringify(JSON.parse(res.output.map)));
                    }
                    new File(outPath).write(res.output.code);
                    output.printMinifyResult(`${baseName}`, res);
                    if (res.warnings.length && config.showLogOnWarning) {
                        output.show();
                    }
                    afterDone();
                } catch (e) {
                    console.log(e);
                    vscode.window.showErrorMessage('Failed to write to file. Does the output path exist?');
                }
            } else if (config.showLogOnError) {
                output.printMinifyResult(`${baseName}`, res);
                output.show();
            } else {
                output.printMinifyResult(`${baseName}`, res);
            }
            break;
        }
        default: {
            vscode.window.showErrorMessage('Language not supported.');
            break;
        }
    }
}
