export type CacheData<T> = {
  value: T
  timestamp: number
}

export class Cache<T> {
  private data: CacheData<T> | null = null
  private readonly duration: number

  constructor(cacheDurationMs: number) {
    this.duration = cacheDurationMs
  }

  get(): T | null {
    if (!this.data) return null
    if (Date.now() - this.data.timestamp > this.duration) return null
    return this.data.value
  }

  set(value: T): void {
    this.data = {
      value,
      timestamp: Date.now(),
    }
  }

  clear(): void {
    this.data = null
  }
}
