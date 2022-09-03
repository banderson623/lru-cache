require('dotenv').config()

if(!process.env.LAUNCH_DARKLY_TOKEN) {
  console.log("Did not find the environment variable LAUNCH_DARKLY_TOKEN. Exiting.")
  process.exit();
}

const ld = require('launchdarkly-node-server-sdk');
const client = ld.init(process.env.LAUNCH_DARKLY_TOKEN);

client.once('ready', () => {
  client.variation('static-configs-version', {"key": "defs-api-cache"}, false).then((value) => {
    console.log({value})
  });

  client.on('update:static-configs-version', (e) => {
    console.log('static-configs-version flag changed', e)
  })

  client.on('update', (e) => {
    console.log('some flag changed', e)
  })
});
