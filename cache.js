
function createCache({maxSizeInBytes = -1, flag, launchDarklyUser}) {
  const store = new Map();
  const usedKeyStack = new Set();

  function set (key, value) {
    store.set(key, value);
    evictIfNecessary();
    markUsage(key)
  }

  function get (key) {
    markUsage(key);
    return store.get(key)
  }

  function has(key) {
    return store.has(key);
  }

  function remove(key) {
    if(has(key)) {
      store.delete(key);
      usedKeyStack.delete(key);
      return true;
    } else {
      return false;
    }
  }

  function size() {
    let cacheSize = 0;
    for(const val of store.values()) {
      cacheSize += memorySizeOf(val)
    }
    return cacheSize;
  }

  function purge() {
    store.clear();
    usedKeyStack.clear();
  }

  function markUsage(key) {
    if(!store.has(key)) return;
    // We are using a Set, which only allows unique values.
    // Deleting existing keys and then adding, moves it to the
    // last position. This little trick allows us to keep
    // the MOST recently used keys at the end ensureing that
    // the first key is always the LEAST recently used
    if(usedKeyStack.has(key)) usedKeyStack.delete(key);
    usedKeyStack.add(key);
  }

  function evictIfNecessary() {
    if(maxSizeInBytes <= 0) return;

    while(size() > maxSizeInBytes){
      // set keeps this in inertion order, so the least recently used key is first
      const lruKey = usedKeyStack.values().next().value;
      remove(lruKey)
    }
  }

  async function cache (key, onCacheMiss) {
    if(typeof(onCacheMiss) !== 'function'){
      throw `cache(key, onCacheMiss) is expecting second argument to be a function, you passed ${onCacheMiss}`
    }

    if(has(key)) return get(key);

    // if we missed execute the function, and store that value
    const value = await onCacheMiss();
    set(key, value);
    return value;
  }

  return {set, get, remove, has, cache, purge, size}
}

// from https://gist.github.com/zensh/4975495
function memorySizeOf(obj) {
  let bytes = 0;

  function sizeOf(obj) {
    if(obj !== null && obj !== undefined) {
      switch(typeof obj) {
      case 'number':
          bytes += 8;
          break;
      case 'string':
          bytes += obj.length * 2;
          break;
      case 'boolean':
          bytes += 4;
          break;
      case 'object':
          var objClass = Object.prototype.toString.call(obj).slice(8, -1);
          if(objClass === 'Object' || objClass === 'Array') {
              for(var key in obj) {
                  if(!obj.hasOwnProperty(key)) continue;
                  sizeOf(obj[key]);
              }
          } else bytes += obj.toString().length * 2;
          break;
      }
    }
    return bytes;
  };
  return sizeOf(obj)
}

module.exports = {createCache}
