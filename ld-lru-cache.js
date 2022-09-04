require('dotenv').config()
const ld = require('launchdarkly-node-server-sdk');
const {createCache} = require('./cache');

async function createLaunchDarklyCache({flag, user, launchDarklyToken = process.env.LAUNCH_DARKLY_TOKEN, launchDarklyClient = null, ...rest}) {
  let flagValue;

  if(!launchDarklyToken && !launchDarklyClient) {
    throw "Did not pass in a launchDarklyClient, launchDarklyToken or set the environment variable LAUNCH_DARKLY_TOKEN"
  }

  if(!flag || !user) {
    throw "Must pass in a flag and user to createLaunchDarklyCache({flag, user})"
  }

  const cache = createCache(rest);

  const client = launchDarklyClient ?? ld.init(launchDarklyToken);
  await client.waitForInitialization();

  function checkAndHandleFlagUpdate() {
    client.variation(flag, {"key": user}, undefined, (value) => {
      if(flagValue != value) cache.purge();
      flagValue = value;
    });
  }

  client.on(`update:${flag}`, checkAndHandleFlagUpdate);
  checkAndHandleFlagUpdate();

  return cache;
}

module.exports = {createLaunchDarklyCache}