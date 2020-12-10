# copy-paste-actions

This is the repository for the JavaScript website part of the iOS shortcut [CopyPaste Actions](https://www.routinehub.co/shortcut/7742).

In the issues section all issues regarding the shortcut are handled, not only the ones regarding the website.

If you want to help me improve the shortcut, you can help me fix any open issue or translate it into a new language (or fix existing ones) by creating a pull request.

## Development
To develop locally you can use any Editor/IDE. I personally use [Visual Studio Code](https://code.visualstudio.com/), but any other editor that can handle Unix line feed characters on Windows (instead of the Windows default carrige return-line feed) is also fine.

### Install all dependencies
```
npm run install
```

### Preview the page in your browser
```
npm run serve
```
Note: To see an update after changing any language file you need to refresh your browser. If this doesn't work, just restart this command.

### Build the page to include it in the shortcut
```
npm run build:main
```
and the decompress "page"
```
npm run build:targz
```

### Build them both at the same time
```
npm run build
```

### Generate the language file
```
npm run generateLanguageFile
```

### Run all tests (only analyser and merger scripts for now)
```
npm run test -- --all
```

## Use the remote console to debug
On macOS you can easily debug a webpage on iOS with Safari on the Mac, but on Windows that is not possible. There are some workarounds like [this one](https://washamdev.com/debug-a-website-in-ios-safari-on-windows/), but they are not guarnteed to work, so I added a simple script that sends all console messages to a local server.

### Setup
1. Make sure your Mac/PC and iOS device is in the same network.
2. Open a console and type `npm run remoteConsoleServer`
3. Create a file `remoteConsoleUrl.local` in the root of this repo with the URL shown after startup of the previous step (no final line feed character!)
4. Start the webpack-dev-server with `npm run serve`
5. Use the website on your iOS device and all custom console messages are send to your Mac/PC
