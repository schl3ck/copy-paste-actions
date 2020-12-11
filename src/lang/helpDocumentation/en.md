# Documentation

## Contents
* [Function syntax](#function-syntax)
* [Counting actions](#counting-actions)
* [Treatment of blocks in selections](#treatment-of-blocks-in-selections)
* [Magic Variables](#magic-variables)

## Function syntax
The overall syntax for the comment actions is
```
:cpa:
function: <function>
name: <snippet name>
```
`:cpa:` is the abbreviation of this shortcuts' name _CopyPaste Actions_ surrounded by colons to differentiate it from normal text.

The colon `:` after the line titles `function` and `name` is optional as well as the line titles `function` and `name` themself. So these are equivalent:
* `function: copy` is the same as `copy`
* `name: my snippet` is the same as `my snippet`

Possible values for `<function>` are
* [`copy`](#copy-function)
* [`cut`](#cut-function)
* [`save`](#save-function)
* [`paste`](#paste-function)
* [`insert`](#insert-function)
* [`end`](#end-function)
* [`pause`](#pause-function)
* [`resume`](#resume-function)

Some functions accept a number of how many actions should be affected by this function. This is called _action count_.

Each of them is described in depth down below.

`<snippet name>` is used to differentiate between multiple snippets and clipboard items. It is optional, but you have to include it with every function, otherwise they are not assigned to the same selection!

::: heads-up
#### Heads up!
To start the name of a snippet/clipboard item with `name` you must specify the line title `name:`. This is case-insensitive.

Example:
* `name this snippet` results in `this snippet`
* `name: name this snippet` results in `name this snippet`
:::

### `copy` function
```
copy [n]
```
Starts a selection for copying actions. Optionally specify a number `n` to copy only that number of actions.

If no number is given, it copies all actions until either the end of the shortcut or until an `end` function is found, whichever comes first.

### `cut` function
```
cut [n]
```
Starts a selection for copying actions and removes them after copying. Optionally specify a number `n` to cut only that number of actions.

If no number is given, it cuts all actions until either the end of the shortcut or until an `end` function is found, whichever comes first.

### `save` function
```
save [remove | replace] [n]
```
Starts a selection for saving actions as a snippet. Optionally specify `remove` or `replace` to remove the actions after saving them. Optionally specify a number `n` to save only that number of actions.

If no number is given, it saves all actions until either the end of the shortcut or until an `end` function is found, whichever comes first.

### `paste` function
```
paste [replace [n]]
```
Pastes a clipboard item at that location. Optionally specify `replace` to start a selection of actions which will be replaced by the pasted actions. Additionally specify a number `n` to replace only that number of actions.

If no number is given but `replace` is specified, it replaces all actions until either the end of the shortcut or until an `end paste` function is found, whichever comes first.

### `insert` function
```
insert [replace [n]]
```
Inserts a snippet at that location. Optionally specify `replace` to start a selection of actions which will be replaced by the inserted actions. Additionally specify a number `n` to replace only that number of actions.

If no number is given but `replace` is specified, it replaces all actions until either the end of the shortcut or until an `end insert` function is found, whichever comes first.

### `end` function
```
end [paste | insert]
```
Marks the end of a selection.

When `paste` is specified it marks the end of a `paste replace` function and when `insert` is specified it marks the end of a `insert replace` function, otherwise it marks the end of a `copy`, `cut` or `save` function.

When a selection was specified with an action count (e.g. `copy 5`) and an `end` function is encountered before the action count has reached 0 by counting down, the selection will then still be finished. This may result in an action count in the snippet which is less than the initially specified count at the start function. If the action count has hit 0 and then an `end`-function is found, it will be treated as an error, because the intention of the user is not clear of how many actions they wanted to copy.

### `pause` function
```
pause [n]
```
Pauses the clipboard item/snippet of "recording" actions so the following actions are not included in the clipboard item/snippet. Any action count from previous functions is paused as well. Optionally specify a number `n` to pause only for that number of actions. If a number is given it overrides the count from any previous `pause` function.

If no number is given, it pauses until the end of the shortcut or until an `end` function is found, whichever comes first.

This function is only supported in selections started with `copy`, `cut` and `save`.

### `resume` function
```
resume [n]
```
Resumes a paused clipboard item/snippet so the following actions are again included in the clipboard item/snippet. Any action count from a previous `pause` function is paused and any action count from all other functions is resumed. Optionally specify a number `n` to resume only for that number of actions and pause afterwards again. If a number is given it overrides the count from any previous `resume` function.

If no number is given, it resumes until the end of the shortcut or until an `end` function is found, whichever comes first.

This function is only supported in selections started with `copy`, `cut` and `save` and valid only after a `pause` function.

## Counting actions
There are some special rules about counting actions.

* comment actions containing functions are never counted for their own selection. Concerning other selections this is dependent on the preference [_Exclude functions_](#){data-pref="excludeAllCPAComments"}.
* actions that are part of a block (e.g. `Otherwise`, `End If`, `End Repeat`, every `Choose from Menu` section) counts also as an action.  
E.g.: a shortcut containing only a `Choose from Menu` block with two options and nothing else contains 4 actions (`Choose from Menu`, the first option, the second option and `End Choose from Menu`). A shortcut containing an empty `If` block contains 3 actions (`If`, `Otherwise` and `End If`).

Counting is influenced by the `pause` and `resume` functions. It works like this:

|            | action copied | `copy` count | `pause` count | `resume` count |
|------------|:-------------:|:------------:|:-------------:|:--------------:|
| action     |               |              |               | 
| `copy 5`   |               |              |               | 
| action     | ✔️           | 1            |               |   {.table-success}
| action     | ✔️           | 2            |               |   {.table-success}
| `pause 2`  |               |              |               | 
| action     | ❌           |              | 1             |   {.table-warning}
| `resume 2` |               |              |               | 
| action     | ✔️           | 3            |               | 1 {.table-success}
| action     | ✔️           | 4            |               | 2 {.table-success}
| action     | ❌           |              | 2             |   {.table-warning}
| action     | ✔️           | 5            |               |   {.table-success}
| action     |               |              |               | 

{.table .table-responsive .table-sm .nowrap-first-column .mb-0}

_action_ is only a placeholder for any other action that is available in Shortcuts except block actions like `If`. {.text-secondary .small}

It is probably easier to just place functions everywhere you need one instead of using a number system like in this example, but since I wanted to be able to specify a number, I also had to handle special cases like this example.

## Treatment of blocks in selections
Action blocks like `If` and `Repeat` are treated specially to not break the shortcut when they are inserted.

Functions that copy actions will include all actions from a block when at least one of them is inside the selection. In the following example the actions `Otherwise` and `End If` are included in the clipboard item.

Functions that remove actions will only remove a block when it is completely within the selection. In the following example the action `If` won't be removed even though it is inside the selection.

|           | copied | removed |
|-----------|:------:|:-------:|
| action    | ❌    | ❌
| `cut`     |        | 
| action    | ✔️    | ✔️
| If        | ✔️    | ❌
| action    | ✔️    | ✔️
| `end`     |        | 
| Otherwise | ✔️    | ❌
| action    | ❌    | ❌
| End If    | ✔️    | ❌
| action    | ❌    | ❌

{.table .table-sm .table-striped .table-responsive}

This also applies to selections that are limited by an action count. Because of this it is possible that a snippet may save more actions than what was specified at the start function.

## Magic variables
In shortcuts you can use the output of an action as a magic variable in other actions. The action producing the result sets the variable and all other actions using it only store a reference to the variable. On insertion of an action the references are kept, but any action saving to a magic variable will be changed so that it doesn't override any existing magic variable. Inside the snippet that is inserted, the references are kept intact, even when they are changed.
