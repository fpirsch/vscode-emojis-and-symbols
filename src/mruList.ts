const CAPACITY = 64
const KEY_LENGTH = 2
const MAX_FREQ = 36 ** KEY_LENGTH - 1 // 35, 1295, 46655

type MRUItem = { e: string; f: number }

export class MRUList {
  list: MRUItem[]
  constructor(list: any[]) {
    this.list = list as MRUItem[]
    if (this.list.length > CAPACITY) this.list.length = CAPACITY
    // reset if invalid format
    if (!this.list.every((item) => item.e && item.f)) {
      this.list = []
    }
    this.list.forEach((item) => {
      if (item.f >= MAX_FREQ) item.f = MAX_FREQ
    })
  }

  private find(emoji: string) {
    return this.list.find(({ e }) => e === emoji)
  }

  sortText(emoji: string) {
    const item = this.find(emoji)
    if (!item) return
    return '\x00' + (MAX_FREQ - item.f).toString(36).padStart(KEY_LENGTH, '0')
  }

  private scaleFreq() {
    this.list.forEach((item) => (item.f >>= 1))
  }

  incrementFreq(emoji: string) {
    let item = this.find(emoji)
    if (item) {
      item.f++
    } else {
      if (this.list.length === CAPACITY) this.list.pop()
      this.list.push((item = { e: emoji, f: 1 }))
    }
    if (item.f >= MAX_FREQ) this.scaleFreq()
    this.list.sort((a, b) => b.f - a.f)
  }
}
