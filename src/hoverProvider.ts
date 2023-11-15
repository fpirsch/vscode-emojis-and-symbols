import * as vscode from 'vscode'
const { Hover, Position, Range } = vscode
import { emojis } from './emojis'
import { markdownDoc } from './markdownDoc'

// Where each character can appear in each emoji or symbol
const rangesByChar: Record<string, number[]> = {}
emojis.forEach(({ emoji }) => {
  for (let i = 0; i < emoji.length; i++) {
    const c = emoji[i]
    const range = (i << 4) + (emoji.length - i)
    const ranges = rangesByChar[c] ?? (rangesByChar[c] = [])
    if (!ranges.includes(range)) ranges.push(range)
  }
})

// Sort range by decreasing length, to match bigger sequences first.
const rStart = (range: number) => range >> 4
const rEnd = (range: number) => range & 0xf
const rLength = (range: number) => rEnd(range) - rStart(range)
Object.values(rangesByChar).forEach((ranges) => ranges.sort((a, b) => rLength(b) - rLength(a)))

const map = new Map(emojis.map((item) => [item.emoji, item]))

export const hoverProvider = {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const { line, character } = position
    const char = document.getText(new Range(position, new Position(line, character + 1)))
    const ranges = rangesByChar[char]
    if (!ranges) return

    for (let range of ranges) {
      const start = character - (range >> 4)
      if (start < 0) continue
      const end = character + (range & 0xf)

      const vscodeRange = new vscode.Range(new Position(line, start), new Position(line, end))
      const text = document.getText(vscodeRange)
      const match = map.get(text)
      if (match) {
        return new Hover(markdownDoc(match), vscodeRange)
      }
    }
  },
}
