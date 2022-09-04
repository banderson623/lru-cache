const {createCache} = require('./cache');

describe("Basic API", () => {
  test('API is known and consistent', () => {
    const {set, get, has, cache, purge, remove, size, ...rest} = createCache()
    expect(typeof(cache)).toBe('function')
    expect(typeof(has)).toBe('function')
    expect(typeof(get)).toBe('function')
    expect(typeof(set)).toBe('function')
    expect(typeof(purge)).toBe('function')
    expect(typeof(size)).toBe('function')
    expect(typeof(remove)).toBe('function')
    expect(rest).toEqual({})
  })

  test('can get() and set() a cache value', () => {
    const {set, get} = createCache()
    expect(get('flavor')).toBeUndefined()
    set('flavor', 'sidewalk');
    expect(get('flavor')).toBe('sidewalk')
  })

  test('has() reports of the cache key is present', () => {
    const {set, has} = createCache()
    expect(has('flavor')).toBe(false)
    set('flavor', 'sidewalk');
    expect(has('flavor')).toBe(true)
  })

  test('remove() works to remove a cache valye', () => {
    const {set, has, remove} = createCache()
    expect(has('flavor')).toBe(false)
    set('flavor', 'sidewalk');
    expect(has('flavor')).toBe(true)
    remove('flavor')
    expect(has('flavor')).toBe(false)
  })

  test('purge() removes all of the cache', () => {
    const {set, has, purge, get} = createCache()
    expect(has('flavor')).toBe(false)
    set('flavor', 'sidewalk');
    expect(has('flavor')).toBe(true)
    purge();
    expect(has('flavor')).toBe(false)
    expect(get('flavor')).toBeUndefined()
  })

  test("cache() will execute the callback function on miss", async () => {
    let callCount = 0;
    const {cache, has, get} = createCache()
    expect(has('flavor')).toBe(false)

    const value = await cache('flavor', () => {callCount++; return 'toothpaste'})
    expect(get('flavor')).toBe('toothpaste')
    expect(callCount).toBe(1)

    // it should not call again
    const nextCacheCallValue = await cache('flavor', () => {callCount++; return 'toothpaste'})
    expect(get('flavor')).toBe('toothpaste')
    expect(callCount).toBe(1)
  })

  test("size() returns the number of bytes in the cache", () => {
    const {set, size, remove} = createCache()
    expect(size()).toBe(0);
    set('flavor', 'feet');
    expect(size()).toBeGreaterThan(0)
    remove('flavor');
    expect(size()).toBe(0);

    set('flavor', 'tiny fig')
    expect(size()).toBe(16);
    set('flavor', 'large apple')
    expect(size()).toBe(22);
  })
})

describe("Least Recently Used is working", () => {
  let get, set, has, size;
  beforeEach(() => {
    cacheObject = createCache({maxSizeInBytes: 50})
    get = cacheObject.get
    set = cacheObject.set
    has = cacheObject.has
    size = cacheObject.size
  })

  test('it will drop keys when it goes too large', () => {
    expect(size()).toBe(0)
    set('fruits', ['apple', 'banana', 'cucumber'])
    expect(size()).toBe(38)
    expect(has('fruits')).toBe(true)
    set('meats', ['beef', 'pork', 'bacon', 'avocado'])
    expect(size()).toBe(40)
    expect(has('fruits')).toBe(false)
  })

  test('it will drop the least recently used key', () => {
    set('fruits', ['banana'])
    set('meats', ['pork'])
    get('fruits');
    set('breads', ['meatloaf', 'whole wheat'])
    expect(has('meats')).toBe(false)
  })
});
