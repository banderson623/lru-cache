require('dotenv').config()
const ld = require('launchdarkly-node-server-sdk');
const {createCache} = require('./cache');

async function createLaunchDarklyCache({flag, user, launchDarklyToken = process.env.LAUNCH_DARKLY_TOKEN, launchDarklyClient = null, ...rest}) {

  // launchDarklyToken ||= process.env.LAUNCH_DARKLY_TOKEN

  if(!launchDarklyToken) {
    throw "Did not pass launchDarklyToken or find the environment variable LAUNCH_DARKLY_TOKEN"
  }

  // const client = launchDarklyClient ?? ld.init(launchDarklyToken);

  // client.once('ready', () => {
  //   client.variation('static-configs-version', {"key": "defs-api-cache"}, false).then((value) => {
  //     console.log({value})
  //   });
  // });

  const returnObject = createCache(rest);

  const {purge} = returnObject;



  return returnObject;
}

module.exports = {createLaunchDarklyCache}