# Hypercatcher Extension

The Hypercatcher Extension unifies the chapter creation experience across all major podcasting platforms. Create your podcast chapters using any tool like [studio.hypercatcher.com](https://studio.hypercatcher.com/) to create your chapters and drop them into any supported podcast hosting platform

## Supported Podcast Hosts

This list will grow, but is limited by the hosting platform's chapter creation tools and how easy they are to automate. Please open an issue to request podcast host support or open a PR to add it 🥷

- https://rssblue.com/
- https://blubrry.com/
- https://buzzsprout.com/
- https://podcasters.spotify.com/

## How it works

- Create a [Podcasting 2.0 compliant chapters file](https://github.com/Podcastindex-org/podcast-namespace/blob/main/chapters/jsonChapters.md)
- Drag and drop the chapters file into the Hypercatcher Extension
- Navigate to your supported podcasting host of choice's chapter upload page for your podcast episode
- Click the "Update Chapters" button in the extension to insert your podcast chapters.

## Installing for use
(Google Chrome store link in progress)

## Installing for development

1. Check if your `Node.js` version is >= **14**.
2. Change or configurate the name of your extension on `src/manifest`.
3. Run `npm install` to install the dependencies.

## Developing

run the command

```shell
$ cd hypercatcher-extension

$ npm run watch
```

### Chrome Extension Developer Mode

1. set your Chrome browser 'Developer mode' up
2. click 'Load unpacked', and select `hypercatcher-extension/build` folder

### Nomal FrontEnd Developer Mode

1. access `http://0.0.0.0:3000/`
2. when debugging popup page, open `http://0.0.0.0:3000//popup.html`
3. when debugging options page, open `http://0.0.0.0:3000//options.html`

## Packing

After the development of your extension run the command

```shell
$ npm run build
```

Now, the content of `build` folder will be the extension ready to be submitted to the Chrome Web Store. Just take a look at the [official guide](https://developer.chrome.com/webstore/publish) to more infos about publishing.


## Special Thanks To:
---
- [create-chrome-ext](https://github.com/guocaoyi/create-chrome-ext)
- [Podcasting 2.0](https://github.com/Podcastindex-org/podcast-namespace)