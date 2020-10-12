# TODO list

* enable checking for updates on RoutineHub
* save generated icloud shortcut urls to enable the user to delete them

## Found snippets/inserts
* move shortcuts with snippets/inserts to top (controllable by preference?)

## Preferences
* add link from each setting to docs/help
* add pref to select shortcuts that should be loaded every time (how to flag if the auto-loaded shouldn't be analysed?)
* add pref to automatically overwrite all snippets (what to do on conflicts?)
* add pref to automatically parse auto-loaded shortcuts
* how to access settings to turn auto-parse off when overwrite = true?  
  solution: display confirmation screen with the loaded shortcuts
* make debounce time of shortcut search a preference?

## Analyser
* modify function "paste"/"insert" to allow inserting multiple copies at once
* new function "merge" to simply replace all non recursive "Run Shortcut" actions with their referenced shortcut (with option to exclude some)

## FAQ
* insert whole shortcut into another (one copy action at the top, nothing else)
* browser history/back function
