import { MarkdownString } from 'vscode'

type Meta = {
  emoji: string
  name: string
  group: string[]
  alt?: string[]
}

export function markdownDoc(meta: Meta) {
  const doc = new MarkdownString(`# ${meta.emoji} ${meta.name}\n\n`)
  doc.appendMarkdown(`**Group**: ${meta.group.join(', ')}\n\n`)
  if (meta.alt?.length) doc.appendMarkdown(`**Alt:** ${meta.alt.join(', ')}`)
  return doc
}
