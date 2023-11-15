import * as vscode from 'vscode'
import { completionProvider } from './completionProvider'
import { hoverProvider } from './hoverProvider'

export function activate(context: vscode.ExtensionContext) {
  const completionDisposable = vscode.languages.registerCompletionItemProvider('*', completionProvider, ':')
  const hoverDisposable = vscode.languages.registerHoverProvider('*', hoverProvider)
  context.subscriptions.push(completionDisposable, hoverDisposable)
}
