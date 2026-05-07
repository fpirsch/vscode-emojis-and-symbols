import * as vscode from 'vscode'
const { Position, Range } = vscode
import { emojis, map } from './emojis'
import { markdownDoc } from './markdownDoc'
import { MRUList } from './mruList'

let memento: vscode.Memento
let mru: MRUList
let items: vscode.CompletionItem[]

const sharedRange = new Range(new Position(0, 0), new Position(0, 0))
const normalize = (ar: string[]) =>
  ar
    .join(' ')
    .toLowerCase()
    .replaceAll(/[^a-z0-9-]/g, '-')

function buildCompletionItems() {
  items = emojis.map((meta) => {
    const item = new vscode.CompletionItem(`${meta.emoji} ${meta.name}`, vscode.CompletionItemKind.Text)
    // Problème : à ce moment là on n'a pas encore la MRU
    item.sortText = mru?.sortText(meta.emoji) ?? meta.name
    item.filterText = `:${normalize([meta.name, ...meta.alt, ...meta.group])}`
    item.documentation = markdownDoc(meta)
    item.insertText = meta.emoji
    item.range = sharedRange // 🧙🪄✨
    item.command = {
      command: 'emojisandsymbols.afterSelect',
      arguments: [item],
    } as vscode.Command
    return item
  })
}

export default {
  setMemento(extensionMemento: vscode.Memento) {
    memento = extensionMemento
    const storedMRU = memento.get('emojisandsymbols.mru')
    mru = new MRUList(Array.isArray(storedMRU) ? storedMRU : [])
    buildCompletionItems()
  },

  async afterSelect(item: vscode.CompletionItem) {
    const meta = map.get(item.insertText as string)
    if (!meta) return
    mru.incrementFreq(meta.emoji)
    item.sortText = mru.sortText(meta.emoji) ?? meta.name
    await memento.update('emojisandsymbols.mru', mru.list) // async
  },

  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionList> {
    // Non-standard word match starting with triggerCharacter
    const range = document.getWordRangeAtPosition(position, /:\w*/)

    // No trigger, no completions
    if (!range || range.isEmpty) return { items: [] }

    // Include trigger character in the search & replace ranges.
    // 🤌 why make it (not that much) immutable ?
    const mutableRange = sharedRange as unknown as {
      _start: vscode.Position
      _end: vscode.Position
    }
    mutableRange._start = range.start
    mutableRange._end = position

    return { items, isIncomplete: false }
  },
}
