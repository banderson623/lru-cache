# LRU (Last Recently Used) Cache (in vanilla node)

This is a small sample library that implements a very simple LRU cache in Node. It's tiny and trivial -- it should be used for code reference, not for including as a dependency.

**A note on Least Recently Used** the implementation is pretty trivial, it stores a list of keys in usage order. When memory eviction needs to take place, it will delete the last used key, and continue on until it's under the memory pressure.

So it's possible to briefly exceed the memory limit, as eviction happens _after_ storage.

## Basic Usage

The basic interface is simple, create a cache object and interact with it.

```js
const {get, set} = createCache()
set('some key', 42);
get('some key');
// => 42
```

I found that a lot of times you want to do something on a cache miss, so you can also do this sort of mechanic, where on a cache miss you do something and then store that value:

```js
const {cache} = createCache()

await cache('some key', async () => {
  // do a lot of big slow computations in this space;
  // and it only runs on a cache miss
  return 42
});
// => 42
```

So far this doesn't enforce any memory constraints, so adding a new parameter to the create function will ensure you never exceed some value:

```js
// lets give it a megabyte of cache
const {get, set, size} = createCache({maxSizeInBytes: 1024 * 1024})
set('some key', 42);
get('some key');
// => 42

size()
// => 8
// (this is in bytes)
```

For complete usage see `cache.test.js`

## Launch Darkly Usage

The real motivation for this code was to cache values based on a launch darkly flag, and when that flag value changes, clear the cache.

The basic interface is the same, but it includes new options in the creation function.

**Note:** the create function is now async, as creation requires Launch Darkly network interactions.

```js
const ld = require('launchdarkly-node-server-sdk');
ld.init(YOUR_LAUNCH_DARKLY_SDK_API_KEY);

const {get, set} = await createLaunchDarklyCache({
  flag: 'some-feature-flag-name',
  user: 'auth0|1234',
  launchDarklyClient: ld
})

set('some key' 42);
get('some key')
// => 42

// ...
// sometime later the flag value changes in launch darkly
get('some key')
// => undefined
```

## Gotchas
Unfortunately it's all test driven.