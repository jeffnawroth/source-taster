import chromeWebstoreUpload from 'chrome-webstore-upload'

const client = chromeWebstoreUpload({
  extensionId: process.env.EXTENSION_ID,
  publisherId: process.env.PUBLISHER_ID,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  refreshToken: process.env.REFRESH_TOKEN,
})

try {
  const res = await client.get()
  console.log('STATUS:', JSON.stringify(res, null, 2))
} catch (e) {
  console.log('MESSAGE:', e.message)
  console.log('CAUSE:', JSON.stringify(e.cause, null, 2))
  process.exit(1)
}
