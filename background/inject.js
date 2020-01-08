browser.browserAction.onClicked.addListener( () => {
	// Basically injects into the attention-bar iframes too.
	// Guess this is not great, but it's not life-threatening either..
	browser.tabs.executeScript({
		file: "/songid-react/dist/index.js",
		allFrames: true
	})

})
