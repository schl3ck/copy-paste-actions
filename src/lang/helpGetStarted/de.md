# Erste Schritte

Wie du wahrscheinlich schon gelesen hast, kann dieser Kurzbefehl Aktionen von einem in einen anderen (oder den gleichen) Kurzbefehl kopieren. Seit iOS 14 ist dies endlich direkt in der App möglich, aber nur mit einzelnen Aktionen. Dieser Kurzbefehl kann auch mehrere Aktionen auf einmal kopieren und wieder einfügen.

:::heads-up
##### Hinweis
Um auf dieser Webseite zu navigieren, verwende den Zurück-Button des Browsers oder die Zurück-Geste (vom linken Bildschirmrand nach rechts wischen in Safari).
:::

## Wie kopiere ich Aktionen?
Das geht sehr einfach. Du fügst eine Kommentaraktion vor der Aktion ein, die du kopieren möchtest und schreibst
```
:cpa:
copy
```
hinein. Die Zeile `:cpa:` markiert diesen Kommentar, sodass er von diesem Kurzbefehl bearbeitet wird. Jeder Kommentar, der bearbeitet werden soll, muss damit auf der ersten Zeile beginnen. Du kannst dir es als Abkürzung des Kurzbefehlnamens _CopyPaste Actions_ merken, wobei die Abkürzung durch Doppelpunkte umgeben ist, damit das ganze leichter von normalem Text unterschieden werden kann.  
Auf der nächsten Zeile gibt `copy` an, dass die nächsten Aktionen kopiert werden sollen. Wie viele? Alle bis zum Ende des Kurzbefehls. Wenn du das nicht möchtest, dann kannst du eine weitere Kommentaraktion nach der letzten Aktion einfügen, die du kopieren möchtest und
```
:cpa:
end
```
hinein schreiben.

Diese Kommentare heißen _Funktionen_. Hier kamen die _Kopierfunktion_ und _Endfunktion_ vor. Die Funktion ist einfach nach dem benannt, was in der zweiten Zeile steht.

## Wie füge ich Aktionen ein?
Das Einfügen von Aktionen geht sehr ähnlich wie das Kopieren. Du fügst eine Kommentaraktion dort ein, wo du die Aktionen einfügen möchtest und schreibst
```
:cpa:
paste
```
hinein. So wie die meisten anderen Zwischenablagen funktionieren, kannst du die Aktionen auch öfters und an verschiedenen Orten einfügen. Füge einfach an jedem Punkt, wo du die Aktionen einfügen möchtest, einen Kommentar mit diesen beiden Zeilen ein.

Dies ist die _Einfügefunktion_.

## Beispiel
Wir möchten zwei Aktionen kopieren, also fügen wir eine Kopierfunktion davor ein und eine Endfunktion danach.

#example1copying

Anschließend fügen wir auch noch eine Einfügefunktion dort ein, wo wir die Aktionen später einsetzen möchten. In diesem Beispiel ist es ein neuer Kurzbefehl, aber das kann auch an jeder anderen Stelle sein, wo ein Kommentar platziert werden kann!

#example1pasting

## Ausführen dieses Kurzbefehls
Nachdem die Funktionen (die Kommentaraktionen) eingesetzt sind, verlässt du den Editiermodus deines Kurzbefehls und startest den Kurzbefehl _CopyPaste Actions_. Es öffnet sich nun dein Browser mit dem Hauptmenü. Tippe auf _Kurzbefehle auswählen_, suche nach deinem Kurzbefehl, wähle ihn aus und tippe auf _Ausgewählte berabeiten_. Du wirst nun wieder zurück zur Kurzbefehle-App geleitet, sodass dein Kurzbefehl geladen wird und du erneut zum Browser zurück gebracht wirst.  
Anschließend wird dein Kurzbefehl analysiert und all die gefundenen Zwischenablagenelemente sowie Ausschnitte werden angezeigt. Hier kannst du zur nächsten Seite gehen, um alle Einsetzpunkte einzusehen. Dabei wird auch angezeigt, welches Zwischenablagenelement oder welcher Ausschnitt wo eingefügt wird. Nach einer Bestätigung wirst du wieder zur Kurzbefehle-App umgeleitet, um den fertigen Kurzbefehl zu imortieren.  
Die Kurzbefehle-App fragt dich, ob du den Kurzbefehl zu iCloud hochladen möchtest, was du bestätigst. Es gibt leider im Moment keine andere Möglichkeit, Kurzbefehle zu importieren. Wenn dies getan ist, wird der erstellte Link geöffnet und die bekannte Ansicht des Importierens eines Kurzbefehls erscheint. Du kannst nun das Ergebnis des Kopierens überprüfen und wenn alles Korrekt ist, den Kurzbefehl importieren und deinen alten dabei ersetzen.

Das ganze noch einmal als einfache Liste:
1. Plaziere alle Funktionen (die Kommentare), wo du sie benötigst
2. Führe diesen Kurzbefehl aus
3. Tippe auf _Kurzbefehle auswählen_
4. Wähle deinen Kurzbefehl und tippe auf _Ausgewählte bearbeiten_
5. Nach einem kurzen Wechsel zur Kurzbefehle-App und wieder zurück zum Browser, wird dein Kurzbefehl analysiert
6. Eine Zusammenfassung all der gefundenen Zwischenablagenelementen (die kopierten Aktionen) wird angezeigt
7. Nachdem du dies gespeichert hast, wird eine Zusammenfassung aller Einfügepositionen angezeigt, sowie die Zwischenablagenelemente, die dort eingefügt werden
8. Mit einer weiteren Bestätigung gelangst du wieder zurück zur Kurzbefehle-App, um den fertigen Kurzbefehl in iCloud hochzuladen und zu importieren.

# Tipps und Tricks

* Du kannst alle Aktionen kopieren, sogar auch _Wenn_- und _Wiederholen_-Blöcke.
* Alle Blöcke werden überprüft, sodass das Zwischenablagenelement eingefügt werden kann, ohne dass der resultierende Kurzbefehl unbrauchbar gemacht wird, weil zum Beispiel _Ende von "Wenn"_ fehlt.
* Um einen gesamten Kurzbefehl in einen anderen einzusetzen, platziere einfach eine Kopierfunktion als die allererste Aktion und ein Einfügefunktion, wo du den Kurzbefehl einsetzen möchtest. Da die Kopierfunktion standardmäßig alles bis zum Ende des Kurzbefehls kopiert, ist nichts weiteres zu tun (natürlich muss man diesen Kurzbefehl hier noch ausführen)!
* Analysiere besser nicht viele, große Kurzbefehle auf einmal. Safari könnte langsamer werden, wenn eine längere URL verwendet wird (diese Webseite und alles darin wird über eine data-URL übertragen). Soweit ich weiß, sollte Safari in der Lage sein, URLs mit einer größe von 50 MB zu laden, aber Safari hat bereits bei 4 MB geruckelt, wenn ich auf einem iPhone 6s gescrollt habe, vorallem wenn die obere Leiste, die die URL-Adresse beinhält, versteckt oder gezeigt wird.
* Die Links, die erstellt werden, wenn ein Kurzbefehl in iCloud hochgeladen wird, werden gespeichert und können im Hauptmenü angezeigt werden.
