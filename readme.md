# Song Identifier 4

A for of the Firefox web extension https://addons.mozilla.org/en-US/firefox/addon/song-identifier/

## Usage

Setup is explained in the addon's options. Go to `about:addons` and select the addon.

## Installation

You need node and NPM.

1. Install all dependencies and build the frontend:
   `npm install && npm run build`
2. If you want the extension as a .zip file to load it as a temporary extension in `about:debugging`, run `npm run extension`. The extension will be in `artifacts`.
3. If you want to sign the extension:
   1. Get your key and secret from [here](https://addons.mozilla.org/en-US/developers/addon/api/key/).
   2. Create a `.env` file and define `WEB_EXT_API_KEY` (JWT issuer) and `WEB_EXT_API_SECRET` (JWT secret).
   3. Run `npm run sign`. The final .xpi file will be in `artifacts`
