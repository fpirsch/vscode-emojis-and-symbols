import * as vscode from 'vscode'
import { emojis } from './emojis'
import { markdownDoc } from './markdownDoc'

const sharedRange = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0))
const normalize = (ar: string[]) =>
  ar
    .join(' ')
    .toLowerCase()
    .replaceAll(/[^a-z0-9 ]/g, ' ')

const items = emojis.map((meta) => {
  const item = new vscode.CompletionItem(`${meta.emoji} ${meta.name}`, vscode.CompletionItemKind.Text)
  item.filterText = `:${normalize([meta.name, ...meta.alt, ...meta.group])}`
  item.documentation = markdownDoc(meta)
  item.insertText = meta.emoji
  item.range = sharedRange
  return item
})

export const completionProvider = {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    // Non-standard word match starting with triggerCharacter
    const range = document.getWordRangeAtPosition(position, /:\w*/)
    const word = document.getText(range)

    // No trigger, no completions
    if (!range || !word) return []

    // Include trigger character in the search & replace ranges.
    // 🤌 why make it (not that much) immutable ?
    const mutableRange = sharedRange as unknown as {
      _start: vscode.Position
      _end: vscode.Position
    }
    mutableRange._start = range.start
    mutableRange._end = position

    return items
  },
}
