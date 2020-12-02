# Dokumentation

* [Funktionssyntax](#funktionssyntax)
* [Zählenweise von Aktionen](#zählweise-von-aktionen)
* [Behandlung von Blöcken in einer Auswahl](#behandlung-von-blöcken-in-einer-auswahl)
* [Magische Variablen](#magische-variablen)

## Funktionssyntax
Die generelle Syntax für die Kommentaraktionen ist
```
:cpa:
function: <Funktion>
name: <Ausschnitname>
```
`:cpa:` ist die Abkürzung des Kurzbefehlnamens _CopyPaste Actions_, umschlossen von Doppelpunkten, um es vom normalen Text zu unterscheiden.

Der Doppelpunkt `:` nach den Zeilentitel `function` und `name` ist optional, sowie die Zeilentitel `function` und `name` selbst. Ein paar Beispiele:
* `function: copy` ist das gleiche wie `copy`
* `name: my snippet` ist das gleiche wie `my snippet`

Mögliche Werte für `<Funktion>` sind
* [`copy`](#copy-funktion)
* [`cut`](#cut-funktion)
* [`save`](#save-funktion)
* [`paste`](#paste-funktion)
* [`insert`](#insert-funktion)
* [`end`](#end-funktion)
* [`pause`](#pause-funktion)
* [`resume`](#resume-funktion)

Bei manchen Funktionen kann eine Zahl angegeben werden, wieviele Aktionen davon betroffen sein sollen. Dies ist der _Aktionenzähler_.

Jeder Wert ist weiter unten genauer beschrieben.

`<Ausschnittname>` wird verwendet, um zwischen mehreren Zwischenablagenelementen/Ausschnitten zu unterscheiden. Die Angabe ist optional.

::: heads-up
#### Achtung!
Um einen Namen eines Ausschnitts oder Zwischenablagenelement mit dem Wort `name` anzufangen, muss der Zeilentitel `name:` angegeben werden. Dabei wird nicht zwischen Groß- und Kleinschreibung unterschieden.

Beispiel:
* `Name des Ausschnitts` ergibt `des Ausschnitts`
* `name: Name des Ausschnitts` ergibt `Name des Ausschnitts`
:::

### `copy`-Funktion
```
copy [n]
```
Beginnt eine Auswahl zum Kopieren von Aktionen. Optional kann auch eine Zahl `n` angegeben werden, um nur diese Anzahl an Aktionen zu kopieren.

Wenn keine Anzahl angegeben ist, werden alle Aktionen kopiert, bis entweder das Ende des Kurzbefehls oder eine `end`-Funktion erreicht wurde, was auch immer zuerst der Fall ist.

### `cut`-Funktion
```
cut [n]
```
Beginnt eine Auswahl zum Kopieren von Aktionen und entfernt sie danach. Optional kann auch eine Zahl `n` angegeben werden, um nur diese Anzahl an Aktionen zu auszuschneiden.

Wenn keine Anzahl angegeben ist, werden alle Aktionen kopiert, bis entweder das Ende des Kurzbefehls oder eine `end`-Funktion erreicht wurde, was auch immer zuerst der Fall ist.

### `save`-Funktion
```
save [remove | replace] [n]
```
Beginnt ein Auswahl zum Speichern von Aktionen als Ausschnitt. Optional kann `remove` oder `replace` angegeben werden, um die Aktionen zu entfernen, nachdem sie gespeichert wurden. Ebenfalls optional kann auch eine Zahl `n` angegeben werden, um nur diese Anzahl an Aktionen zu speichern.


Wenn keine Anzahl angegeben ist, werden alle Aktionen kopiert, bis entweder das Ende des Kurzbefehls oder eine `end`-Funktion erreicht wurde, was auch immer zuerst der Fall ist.

### `paste`-Funktion
```
paste [replace [n]]
```
Fügt ein Zwischenablagenelement an dieser Position ein. Optional kann `replace` angegeben werden, um die nachfolgenden Aktionen mit den einzusetzenden Aktionen zu ersetzen. Zustätzlich kann eine Zahl `n` angegeben werden, um diese Anzahl an Aktionen zu ersetzen.

Wenn `replace` angegeben ist, aber keine Anzahl, werden alle Aktionen ersetzt, bis entweder das Ende des Kurzbefehls oder eine `end paste`-Funktion erreicht wurde, was auch immer zuerst der Fall ist.

### `insert`-Funktion
```
insert [replace [n]]
```
Fügt einen Ausschnitt an dieser Position ein. Optional kann `replace` angegeben werden, um die nachfolgenden Aktionen mit den einzusetzenden Aktionen zu ersetzen. Zustätzlich kann eine Zahl `n` angegeben werden, um diese Anzahl an Aktionen zu ersetzen.

Wenn `replace` angegeben ist, aber keine Anzahl, werden alle Aktionen ersetzt, bis entweder das Ende des Kurzbefehls oder eine `end insert`-Funktion erreicht wurde, was auch immer zuerst der Fall ist.

### `end`-Funktion
```
end [paste | insert]
```
Markiert das Ende einer Auswahl.

Wenn `paste` angegeben ist, markiert dies das Ende einer `paste replace`-Funktion und wenn `insert` angegeben ist, markiert dies das Ende einer `insert replace`-Funktion. Andernfalls markiert dies das Ende einer `copy`-, `cut`- oder `save`-Funktion.

Wenn eine Auswahl durch eine Anzahl an Aktionen begrenzt wurde (z.B.: `copy 5`) und eine `end`-Funktion erreicht wird, bevor der Aktionenzähler durch herunterzählen 0 erreicht hat (in diesem Beispiel von 5 herunter zu 0), wird die Auswahl trotzdem beendet. Dadurch können auch weniger Aktionen in der Auswahl sein, als ursprünglich bei der Startfunktion angegeben. Wenn aber der Aktionenzähler 0 erreicht hat und danach eine `end`-Funktion gefunden wird, so wird dies als Fehler gewertet, da die Absicht des Benutzers nicht ersichtlich ist, wieviele Aktionen er nun kopieren wollte.

### `pause`-Funktion
```
pause [n]
```
Pausiert eine Zwischenablagenelement- oder Ausschnittauswahl, sodass die nachfolgenden Aktionen ignoriert werden. Alle Aktionenzähler werden ebenfalls pausiert. Optional kann auch eine Zahl `n` angegeben werden, um nur diese Anzahl an Aktionen zu pausieren. Wenn eine Zahl gegeben ist, überschreibt diese den Aktionenzähler einer früheren `pause`-Funktion.

Wenn keine Anzahl angegeben ist, wird pausiert, bis entweder das Ende des Kurzbefehls, eine `resume`-Funktion oder eine `end`-Funktion erreicht wurde, was auch immer zuerst der Fall ist.

Diese Funktion ist nur in einer Auswahl gültig, die durch `copy`, `cut` oder `save` begonnen wurde.

### `resume`-Funktion
```
resume [n]
```
Setzt eine Zwischenablagenelement- oder Ausschnittauswahl fort, sodass die nachfolgenden Aktionen wieder inkludiert werden. Alle Aktionenzähler werden ebenfalls fortgesetzt. Optional kann auch eine Zahl `n` angegeben werden, um nur diese Anzahl an Aktionen fortzusetzen und danach wieder zu pausieren. Wenn eine Zahl gegeben ist, überschreibt diese den Aktionenzähler einer früheren `resume`-Funktion.

Wenn keine Anzahl angegeben ist, wird fortgesetzt, bis entweder das Ende des Kurzbefehls, eine `pause`-Funktion oder eine `end`-Funktion erreicht wurde, was auch immer zuerst der Fall ist.

Diese Funktion ist nur in einer Auswahl gültig, die durch `copy`, `cut` oder `save` begonnen wurde und wenn sie nach einer `pause`-Funktion eingesetzt wird.

## Zählweise von Aktionen
Es gibt einige spezielle Regeln betreffend dem Zählen von Aktionen

* Kommentare, die Funktionen beinhalten, werden niemals für die aktuelle Auswahl mitgezählt. Für andere Auswahlen hängt dies von der Einstellung [_Funktionen ausschließen_](#){data-pref="excludeAllCPAComments"} ab.
* Aktionen, die Teil eines Blocks sind (z.B.: `Sonst`, `Ende von "Wenn"` (beide gehören zum Block `Wenn`), `Beenden` (gehört zum Block `Wiederholen`), jede Sektion von `Aus Menü auswählen`), zählen ebenfalls als eine Aktion.  
Beispiel: Ein Kurzbefehl, der nur eine Aktion `Aus Menü auswählen` mit zwei Auswahlmöglichkeiten beinhält, hat bereits 4 Aktionen (`Aus Menü auswählen`, die erste Option, die zweite Option und `Menü "Ende"`). Ein Kurzbefehl, der einen leeren `Wenn`-Block beinhält, zählt 3 Aktionen (`Wenn`, `Sonst` und `Ende von "Wenn"`).

Die Zählweise wird auch durch die Funktionen `pause` und `resume` beeinflusst. Es funktioniert wie in dieser Tabelle gezeigt:

|            | Aktion kopiert | `copy`-Zähler | `pause`-Zähler | `resume`-Zähler |
|------------|:--------------:|:-------------:|:--------------:|:---------------:|
| Aktion     |                |               |                | 
| `copy 5`   |                |               |                | 
| Aktion     | ✔️            | 1             |                |   {.table-success}
| Aktion     | ✔️            | 2             |                |   {.table-success}
| `pause 2`  |                |               |                | 
| Aktion     | ❌            |               | 1              |   {.table-warning}
| `resume 2` |                |               |                | 
| Aktion     | ✔️            | 3             |                | 1 {.table-success}
| Aktion     | ✔️            | 4             |                | 2 {.table-success}
| Aktion     | ❌            |               | 2              |   {.table-warning}
| Aktion     | ✔️            | 5             |                |   {.table-success}
| Aktion     |                |               |                | 

{.table .table-responsive .table-sm .nowrap-first-column .mb-0}

_Aktion_ ist nur ein Platzhalter für jede andere Aktion, die in der Kurzbefehle-App verfügbar ist. {.text-secondary .small}

Es ist wahrscheinlich einfacher, die entsprechenden Funktionen an den richtigen Stellen zu platzieren, als ein Zählsystem wie hier zu verwenden. Allerdings wollte ich es ermöglichen, dass man eine Anzahl an Aktionen angeben kann, also musste der Kurzbefehl auch solch spezielle Fälle, wie in diesem Beispiel, verarbeiten können.

## Behandlung von Blöcken in einer Auswahl
Blöcke wie `Wenn` und `Wiederholen` werden eigens verarbeitet, um nicht den Kurzbefehl unbrauchbar zu machen, wenn sie wieder eingesetzt werden.

Funktionen, die Aktionen kopieren, inkludieren automatisch alle Aktionen, die zu einem Block gehören, sobald zumindest eine davon inkludiert wird. Im folgenden Beispiel werden die Aktionen `Sonst` und `Ende von "Wenn"` im Zwischenablagenelement inkludiert.

Funktionen, die Aktionen entfernen, entfernen nur dann einen Block, wenn alle Aktionen des Blocks in der Auswahl enthalten sind. Im folgeden Beispiel wird `Wenn` nicht entfernt, obwohl die Aktion innerhalb der Auswahl ist.

|                 | Kopiert | Entfernt |
|-----------------|:-------:|:--------:|
| Aktion          | ❌     | ❌
| `cut`           |         | 
| Aktion          | ✔️     | ✔️
| Wenn            | ✔️     | ❌
| Aktion          | ✔️     | ✔️
| `end`           |         | 
| Sonst           | ✔️     | ❌
| Aktion          | ❌     | ❌
| Ende von "Wenn" | ✔️     | ❌
| Aktion          | ❌     | ❌

{.table .table-sm .table-striped .table-responsive}

Dies trifft auch auf Auswahlen zu, die durch einen Aktionenzähler begrenzt sind. Dadurch kann es vorkommen, dass mehr Aktionen im Ausschnitt gespeichert werden, als bei der Startfunktion angegeben wurde.

## Magische Variablen
In Kurzbefehlen kann das Ergebnis einer Aktion als _magische Variable_ in anderen Aktionen verwendet werden. Die Aktion, die das Ergebnis liefert, setzt die Variable, und alle anderen Aktionen, die diese Variable verwenden, speichern nur eine Referenz zu dieser Variable. Wenn nun eine Aktion eingefügt wird, die eine Variable verwendet, so wird dies nicht verändert. Wenn allerdings eine Aktion eingesetzt wird, die eine _magische Variable_ speichert, so wird diese geändert, wenn sie eine andere Variable überschreiben würde. Im Ausschnitt, der eingefügt wird, bleiben die Referenzen erhalten, selbst wenn sie geändert werden.
