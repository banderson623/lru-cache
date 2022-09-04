const {createLaunchDarklyCache} = require('./ld-lru-cache');

describe("Clones the API from LRU Cache", () => {
  test('API is known and consistent', async () => {
    const {set, get, has, cache, purge, remove, size, ...rest} = await createLaunchDarklyCache({flag: 'config-version', user: 'brian@brian.com'})
    expect(typeof(cache)).toBe('function')
    expect(typeof(has)).toBe('function')
    expect(typeof(get)).toBe('function')
    expect(typeof(set)).toBe('function')
    expect(typeof(purge)).toBe('function')
    expect(typeof(size)).toBe('function')
    expect(typeof(remove)).toBe('function')
    expect(rest).toEqual({})
  })
})

describe("Least Recently Used is working, and all these methods proxy okay", () => {
  test('it will drop keys when it goes too large', async () => {
    const { set, has, size} = cacheObject = await createLaunchDarklyCache({maxSizeInBytes: 50})
    expect(size()).toBe(0)
    set('fruits', ['apple', 'banana', 'cucumber'])
    expect(size()).toBe(38)
    expect(has('fruits')).toBe(true)
    set('meats', ['beef', 'pork', 'bacon', 'avocado'])
    expect(size()).toBe(40)
    expect(has('fruits')).toBe(false)
  })

})