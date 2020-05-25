# Song Identifier

A Firefox web extension https://addons.mozilla.org/en-US/firefox/addon/song-identifier/

## Installation

You need node and NPM.

`npm install`

Then get yourself keys (unless you're AMO).

`npm run build`

### Keys

I've hidden away my keys from gitlab... Get your own from www.acrcloud.com.

Then make a `secret.js` file in the base folder (where LICENSE is), like

```javascript
var secret = {
	host: "yourhost",
	key: "yourkey",
	secret: "yoursecret"
}

export default secret
```

### Loading it up

Go to about:debugging and load the manifest.json.
