# FAQ

### How do I copy and paste actions?
Please refer to [Get Started](#){data-page="HelpGetStarted"}

### What is the difference between a clipboard item and a snippet?
There is no difference.

I originally planned to automatically override any clipboard items and let the user choose the behavior of snippets, but when I got to that part in the development phase I realized that I had to implement this auto-override specifically for clipboard items and I also felt more comfortable like it is now. Every snippet/clipboard item is presented and on confirmation it saves everything with no special treatment.

### Why do the finshed shortcuts need to get uploaded to iCloud?
This is a limitation of the Shortcuts app. It was possible to import shortcut files directly up to iOS 12, but that changed in iOS 13 to only allow the import through iCloud. The first beta of iOS 14 had the ability to import the files directly, but that again got removed so it looks like it is a design decision from Apple and not a technical limitation.

The links are saved to your iCloud Drive/Dropbox though and you can view them anytime in the main menu of this shortcut. There you can open them again to remove the shortcut from iCloud via the Shortcuts app and then delete the link here. Or you can use it as some sort of a backup system, but I wouldn't recommend that.

### Why is the interface a webpage in Safari and not made with menus in shortcuts?
I tried.

The first version from the days where Shortcuts was called _Workflow_ worked completly in the app, but was not really userfriendly. The first version of the planned update was also going to run completely in Shortcuts. I had done most of the analysation flow and the preferences menu, but the shortcut was already quite long with over 1000 actions and got more and more difficult to develop. The biggest issue with that was the time between a user interaction and the next menu. The fastest time was already at around 0.8 seconds and the slowest over 2 seconds and with further development would have gotten even worse. It isn't that much, but imagine that you want to change multiple preferences. First you need to wait for the preferences menu to open, which took up to 2 seconds, then tap a preference to toggle it, again taking close to a second, and so on. It was just too much time wasted.

I then tried to make a webpage since some parts already ran with JavaScript and open it in Shortcuts, but no user interaction was possible, so I ended up opening it in the browser.

### Why do I have to close the page/tab myself?
It _should_ close itself. In my tests with websites containing only the logic to close themself it just works, but for no apparent reason it doesn't work here. Since I don't own a Mac, I can't really debug the website and have stopped investigating the problem to finish the rest of the shortcut and deal with it later. If you want to help, please check out the [GitHub issue](https://github.com/schl3ck/copy-paste-actions/issues/1).

### What about privacy?
This shortcut only uploads the finished shortcuts to iCloud to import them, because of the limitation described above. Preferences and snippets as well as the iCloud URLs of the uploaded shortcuts are stored in your iCloud Drive/Dropbox. When running the shortcut and it opens your browser, it loads a file from the GitHub repository to check for a new version ([this file](https://github.com/schl3ck/copy-paste-actions/blob/master/version.json)). In this process, GitHub may store your IP address. Please look up the [privacy policy from GitHub](https://docs.github.com/en/free-pro-team@latest/github/site-policy/github-privacy-statement) for more information.

Other than that, no information is collected and send anywhere. I value your privacy and I have no interest in collecting any form of data about you.

### Where can I find the source code?
The source code for the website part of this shortcut is available on GitHub: https://www.github.com/schl3ck/copy-paste-actions
