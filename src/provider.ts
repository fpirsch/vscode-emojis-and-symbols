import * as vscode from 'vscode'
import { emojis } from './emojis'

const sharedRange = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0))
const normalize = (ar: string[]) =>
  ar
    .join(' ')
    .toLowerCase()
    .replaceAll(/[^a-z0-9 ]/g, ' ')

const items = emojis.map((meta) => {
  // https://code.visualstudio.com/api/references/vscode-api#CompletionItem
  const item = new vscode.CompletionItem(`${meta.emoji} ${meta.name}`, vscode.CompletionItemKind.Text)
  item.filterText = `:${normalize([meta.name, ...meta.alt, ...meta.group])}`
  item.documentation = new vscode.MarkdownString(`# ${meta.emoji} ${meta.name}\n\n`)
  item.documentation.appendMarkdown(`**Group**: ${meta.group.join(', ')}\n\n`)
  if (meta.alt?.length) item.documentation.appendMarkdown(`**Alt:** ${meta.alt.join(', ')}`)
  item.insertText = meta.emoji
  item.range = sharedRange
  return item
})

export const provider = {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    // Non-standard word match starting with triggerCharacter
    const range = document.getWordRangeAtPosition(position, /:\w*/)
    const word = document.getText(range)

    // No trigger, no completions
    if (!range || !word) return []

    // Include trigger character in the search & replace ranges.
    // 🤌 why make it (vaguely) immutable ?
    const mutableRange = sharedRange as unknown as {
      _start: vscode.Position
      _end: vscode.Position
    }
    mutableRange._start = range.start
    mutableRange._end = range.end

    return items
  },
}
