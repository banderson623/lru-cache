const {createLaunchDarklyCache} = require('./ld-lru-cache');

function mockLaunchDarklyClient() {
  const flags = new Map();
  const defaultValueForAllFlags = 1
  const callbacks = new Map();

  return {
    waitForInitialization: () => Promise.resolve(),

    on: (event, callback) => {
      callback();
      callbacks.set(event, [...(callbacks.get(event)||[]), callback].filter(cb=>!!cb));
    },

    variation: (flag, user, defaultValue, callback) => {
      if(!flags.has(flag)) flags.set(flag, defaultValueForAllFlags);
      callback(flags.get(flag));
    },

    simulateFlagValueChange: (flag, value) => {
      flags.set(flag, value);
      (callbacks.get('update') || []).map(cb => cb());
      (callbacks.get(`update:${flag}`) || []).map(cb => cb());
    }
  }
}

describe("Clones the API from LRU Cache", () => {
  test('API is known and consistent', async () => {
    const {set, get, has, cache, purge, remove, size, ...rest} = await createLaunchDarklyCache({flag: 'some-feature-flag-name', user: 'bobbobnob', launchDarklyClient: mockLaunchDarklyClient()})
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
    const { set, has, size} = cacheObject = await createLaunchDarklyCache({flag: 'some-feature-flag-name', user: 'bobbobnob', maxSizeInBytes: 50, launchDarklyClient: mockLaunchDarklyClient()})
    expect(size()).toBe(0)
    set('fruits', ['apple', 'banana', 'cucumber'])
    expect(size()).toBe(38)
    expect(has('fruits')).toBe(true)
    set('meats', ['beef', 'pork', 'bacon', 'avocado'])
    expect(size()).toBe(40)
    expect(has('fruits')).toBe(false)
  })
})

describe("Feature Flag Value changes", () => {
  let ldClient;
  let flagName = 'smell-cache';

  beforeEach(() => {ldClient = mockLaunchDarklyClient()});

  test('Purge cache when the flag value changes', async () => {
    ldClient.simulateFlagValueChange(flagName, 1);
    const {get, set, size} = cacheObject = await createLaunchDarklyCache({flag: flagName, user: 'bobbobnob', maxSizeInBytes: 50, launchDarklyClient: ldClient})

    set('smell', 'warm mayo');
    expect(get('smell')).toBe('warm mayo');

    ldClient.simulateFlagValueChange(flagName, 2);

    expect(size()).toBe(0);
    expect(get('smell')).toBe(undefined);
  });

  test('Does not purge cache when the flag receives update but the value is the same', async () => {
    ldClient.simulateFlagValueChange(flagName, 1);

    const {get, set} = cacheObject = await createLaunchDarklyCache({flag: flagName, user: 'bobbobnob', maxSizeInBytes: 50, launchDarklyClient: ldClient})
    set('smell', 'warm mayo');
    expect(get('smell')).toBe('warm mayo');

    ldClient.simulateFlagValueChange(flagName, 1);
    expect(get('smell')).toBe('warm mayo');
  });
});
