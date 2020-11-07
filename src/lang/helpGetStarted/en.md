# Getting started

As you've probably already read, this shortcut is used to copy actions from one shortcut and paste them in the same shortcut or a different one. Since iOS 14 this is finally possible in Shortcuts itself, but only with one single action. This shortcut helps with copying and pasting multiple actions.

## How do I copy actions?
That's really simple. You insert a comment action before the action you want to copy and write
```
:cpa:
copy
```
in it. The line with `:cpa:` tells the shortcut to process this comment. Every comment which should be picked up by this shortcut starts with this on the first line. You can remember it as the abbreviation of this shortcuts' name _CopyPaste Actions_ surrounded by colons to differentiate it from normal text.  
The following line `copy` tells the shortcut to copy the next actions. How many? All of them until the end of the shortcut. If you don't want that, then you insert another comment after the last action you want to copy and write
```
:cpa:
end
```
in it.

Let's call these comment actions _functions_. Here we got to know the _copy function_ and _end function_. It's simply the phrase on the second line that names the function.

## How do I paste actions?
Pasting actions is done similar to copying them. You insert a comment action where you want to paste the actions and write
```
:cpa:
paste
```
in it. Like with most other clipboards, you can paste the actions multiple times at different locations. For every location you want to paste at simply insert a comment action with these two lines.

This is the _paste function_.

## Example
We want to copy two actions, so we put a copy function before them and an end function after them. Then we insert a paste function where we want to paste the actions.

#example1screenshot

## Running this shortcut
After placing the functions (the comment actions) you exit the editing screen of your shortcut and run this shortcut. It will open your default browser with the main menu of this shortcut. Tap on _Select Shortcuts_, search and select your shortcut and click _Process_. You will be taken back to the Shortcuts app, running this shortcut again and after a few moments again back to your browser.  
This shortcut will then analyse your shortcut and show you all found clipboard items and snippets. There you can proceed to then view all found paste locations. It will also show which clipboard item or snippet will be inserted at which location. Proceed further and the shortcut will take you back to the Shortcuts app to import the finished shortcut.  
There you have to tap _Create Link_ on the prompt asking if the shortcut should be uploaded to iCloud, because the only way to import shortcuts currently is by uploading them to iCloud. After that it will open that link presenting you the familiar screen of importing a shortcut. Here you can examine the result and when it has done everything correct, you can import the shortcut, replacing your old one.

The whole thing again in a simple list:
1. Place all functions (the comment actions) where you like them
2. Run this shortcut
3. Tap _Select Shortcuts_
4. Select your shortcut and tap _Proceed_
5. After a short hop to the Shortcuts app and back to the browser, your shortcut will be analysed
6. A summary of all found clipboard items (the copied actions) is shown
7. After proceeding further, a summary with all paste locations and the clipboard items that will be pasted there is shown
8. After proceeding again, you are taken back to the Shortcuts app to upload the finished shortcut to iCloud and import it.

To navigate in the webpage of this shortcut use the browsers' back button or the back gesture (a swipe from the left edge of the screen to the right in Safari for example).

# Tips and tricks

* You can copy any action, even _If_ and _Repeat_ blocks.
* All blocks are _validated_ so that the clipboard item can be pasted without breaking the resulting shortcut e.g. because of a missing _End If_ action.
* To insert a whole shortcut into another, just place a copy function as the very first action and a paste function where you want to paste it. Since the copy function copies everything until the end of the shortcut by default there is nothing more to do (apart from running this shortcut of course)!
* Don't analyse many big shortcuts at once. Safari might slow down when it has to handle a longer URL. As far as I know it should be able to load URLs up to a size of 50 MB, but Safari already slowed down at around 4 MB on an iPhone 6s.
