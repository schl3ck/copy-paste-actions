# copy-paste-actions

This is the repository for the JavaScript website part of the iOS shortcut [CopyPaste Actions](#). (TODO: add link)

In the issues section all issues regarding the shortcut are handled, not only the ones regarding the website.

If you want to help me improve the shortcut, you can help me fix any open issue or translate it into a new language (or fix existing ones) by creating a pull request.

## Development
To develop locally you can use any IDE. I personally use [Visual Studio Code](https://code.visualstudio.com/), but any other editor that can handle Unix line feed characters on Windows (instead of the Windows default carrige return-line feed) is also fine.

### Install all dependencies
```
npm run install
```

### Preview the page in your browser
```
npm run serve
```
Note: To see an update after changing any language file you need to either cancel the command with Ctrl+C (Cmd+C on Mac) and run it again or change any other file in `src/`.

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
