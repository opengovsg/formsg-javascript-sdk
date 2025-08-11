import { Cache } from '../../src/util/cache'

describe('Cache', () => {
  let now: jest.SpyInstance

  beforeEach(() => {
    const initialTime = 1000
    now = jest.spyOn(Date, 'now').mockImplementation(() => initialTime)
  })

  afterEach(() => {
    now.mockRestore()
  })

  it('should return null for empty cache', () => {
    const cache = new Cache<string>(1000)
    expect(cache.get()).toBeNull()
  })

  it('should return cached value within duration', () => {
    const cache = new Cache<string>(1000)
    cache.set('test-value')

    // Still within cache duration
    now.mockImplementation(() => 1500)
    expect(cache.get()).toBe('test-value')
  })

  it('should return null for expired cache', () => {
    const cache = new Cache<string>(1000)
    cache.set('test-value')

    // Advance time well beyond cache duration
    now.mockImplementation(() => 2002)
    expect(cache.get()).toBeNull()
  })

  it('should update cache value on set', () => {
    const cache = new Cache<string>(1000)
    cache.set('test-value-1')
    expect(cache.get()).toBe('test-value-1')

    cache.set('test-value-2')
    expect(cache.get()).toBe('test-value-2')
  })

  it('should clear cache value', () => {
    const cache = new Cache<string>(1000)
    cache.set('test-value')
    expect(cache.get()).toBe('test-value')

    cache.clear()
    expect(cache.get()).toBeNull()
  })

  it('should work with different data types', () => {
    const numberCache = new Cache<number>(1000)
    numberCache.set(123)
    expect(numberCache.get()).toBe(123)

    const objectCache = new Cache<{ test: string }>(1000)
    objectCache.set({ test: 'value' })
    expect(objectCache.get()).toEqual({ test: 'value' })
  })
})
