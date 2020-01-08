# Song Identifier

A Firefox web extension https://addons.mozilla.org/en-US/firefox/addon/song-identifier/

## Installation (from gitlab)

`cd songid-react && npm install && npm run build`

Then get yourself keys (unless you're AMO).

### Keys

I've hidden away my keys from gitlab... Get your own from www.acrcloud.com.

Then make a `secret.js` file in the base folder (where LICENSE is), like

```javascript

var secret = {
	host: "yourhost",
	key: "yourkey",
	secret: "yoursecret"
}

module.exports = secret
```

### Loading it up

Go to about:debugging and load the manifest.json.
