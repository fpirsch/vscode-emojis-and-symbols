import * as vscode from 'vscode'
import completionProvider from './completionProvider'
import hoverProvider from './hoverProvider'

export function activate(context: vscode.ExtensionContext) {
  completionProvider.setMemento(context.globalState)
  const command = vscode.commands.registerCommand('emojisandsymbols.afterSelect', completionProvider.afterSelect)
  const completionDisposable = vscode.languages.registerCompletionItemProvider('*', completionProvider, ':')
  const hoverDisposable = vscode.languages.registerHoverProvider('*', hoverProvider)
  context.subscriptions.push(completionDisposable, hoverDisposable, command)
}
