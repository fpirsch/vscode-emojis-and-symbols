import * as vscode from 'vscode'
import { provider } from './provider'

export function activate(context: vscode.ExtensionContext) {
  vscode.languages.registerCompletionItemProvider('*', provider, ':')
}
