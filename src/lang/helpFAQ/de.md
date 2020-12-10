# FAQ

### Wie kann ich Aktionen kopieren und einfügen?
Bitte lies die [Ersten Schritte](#){data-page="HelpGetStarted"}

### Wie schalte ich den Quick Mode ein?
Quick Mode ist in mehrere Einstellungen aufgeteilt, um dir die größtmögliche Kontrolle zu geben:

* [Lade spezifische Kurzbefehle jedes mal](#){data-pref="autoLoadShortcuts"}
* [Analysiere autmatisch die geladenen Kurzbefehle](#){data-pref="autoAnalyseShortcuts"}
* [Automatisch die Kurzbefehle-App öffnen](#){data-pref="autoOpenApp"}
* [Automatisch alle Ausschnitte speichern](#){data-pref="autoOverwriteSnippets"}
* [Alle Einsetzpunkte automatisch aktzeptieren](#){data-pref="autoAcceptInserts"}
* [Seite _Gefundene Einsetzpunkte_ überspringen](#){data-pref="skipFoundInsertsOnNoInsert"}

### Nachdem ich einen einzelnen Kurzbefehl importiert habe, läuft der Kurzbefehl _CopyPaste Actions_ weiter.
Dies ist vermutlich ein Fehler der Anzeige in der Kurzbefehle-App auf iOS 14.2. Du kannst wie gewohnt die App verwenden und auch Kurzbefehle ausführen, allerdings wird kein Fortschrittsindikator angezeigt. Um das Problem zu beheben, brauchst du nur die Kurzbefehle-App aus dem Programmumschalter/der Multitasking-Ansicht entfernen und erneut starten. Du kannst auch zur Ordnerübersicht in der Kurzbefehle-App gehen und anschließend einen Kurzbefehl bearbeiten. Nachdem du wieder den Bearbeitungsmodus verlassen hast, sollte alles wieder beim alten sein.

### I habe auf _Link erstellen_ getippt, aber die Kurzbefehlevorschau wurde nicht angezeigt.
Ich habe den Fehler selbst einmal erhalten. Es gab möglicherweise einen Fehler als die Kurzbefehle-App versucht hat, deinen Kurzbefehl zu laden.

When der Ladeindikator angezeigt wurde, dann führe den Kurzbefehl _CopyPaste Actions_ erneut aus, tippe auf _iCloud URLs_ und der letze Eintrag sollte dein Kurzbefehl sein. Tippe darauf um ihn zu öffnen.

Wenn der Ladeindikator nicht angezeigt wurde, dann gab es möglicherweise ein Problem beim Hochladen und Abrufen des Links zu deinem Kurzbefehl. Du kannst die gleichen Schritte wie oben probieren, aber wenn dein Kurzbefehl nicht in der Liste ist (vergleiche auch den Zeitstempel), dann lass ihn nocheinmal analysieren. Wenn dies mit dem selben Kurzbefehl öfters vorkommt, dann kontaktiere mich bitte über die _Einen Fehler melden_-Seite.

### Was ist der Unterschied zwischen einem Ausschnitt und einem Zwischenablagenelement?
Es gibt keinen.

Ich hatte anfangs geplant, dass die Zwischenablagenelemente automatisch überschrieben werden und nur bei den Ausschnitten den Benutzer auswählen zu lassen. Allerdings, wie ich dann dabei war, die Logik dafür zu implementieren, habe ich realisiert, dass ich das autmatische Überschreiben der Zwischenablagenelemente extra programmieren hätte müssen. Ich habe es allerdings besser gefunden, so wie es jetzt ist. Jeder Ausschnitt/jedes Zwischenablagenelement wird angezeigt und bei Bestätigung werden alle ohne spezieller Behandlung gespeichert. Warum ich dann nicht wieder die Ausschnitte entfernt habe? Dafür hätte ich noch mehr verändern müssen, als wenn ich die hier beschriebene Logik eingebaut hätte.

### Warum müssen die fertigen Kurzbefehle in die iCloud hochgeladen werden?
Dies ist eine Limitation der Kurzbefehle-App. Es war bis inklusive iOS 12 möglich, Kurzbefehle als Datei direkt zu importieren, allerdings wurde das mit iOS 13 geändert, sodass es nur mehr über iCloud geht. Die erste Beta-Version von iOS 14 konnte die Dateien direkt importieren, allerdings wurde dies wieder wieder entfernt. Es sieht also so aus, dass das bei Apple so entschieden wurde und nicht aufgrund einer technischen Einschränkung basiert.

Die Links werden in deiner iCloud Drive oder Dropbox gespeichert und du kannst sie jederzeit im Hauptmenü dieses Kurzbefehls anzeigen. Dort kannst du sie erneut öffnen, um den Kurzbefehl von iCloud mit der Kurzbefehle-App zu löschen und dann hier den Link zu löschen. Oder du kannst das auch als eine Art Backupsystem verwenden, allerdings rate ich davon ab.

### Warum sind die importierten Kurzbefehle wie die Originalen benannt, haben aber am Ende noch `.shortcut` stehen?
Dies ist vermutlich ein Fehler in der Kurzbefehle-App. Wenn ein Kurzbefehl in einem Kurzbefehl umbenannt wird, wird er mit `.shortcut` hinten angehängt hochgeladen. Es gibt im Moment leider nichts, was ich dagegen unternehmen kann.

### Warum ist das Interface eine Webseite in Safari und nicht mit Menüs in der Kurzbefehle-App umgesetzt?
Letzteres habe ich versucht.

Die erste Version, aus der Zeit wie Kurzbefehle noch _Workflow_ hieß, funktionierte komplett in der App, allerdings war sie nicht wirklich benutzerfreundlich.  
Die erste Version des geplanten Updates hätte auch komplett in der Kurzbefehle-App laufen sollen. Ich hatte schon das meiste des Analyse-Teils und des Einstellungenmenüs, allerdings war der Kurzbefehl bereits recht lang mit mehr als 1000 Aktionen und es wurde auch immer komplizierter, ihn weiterzuentwickeln. Der größte Dorn in meinem Auge war jedoch die Zeit zwischen den Interaktionen des Benutzers und das auftauchen des nächsten Menüs. Die kürzeste Zeit lag bereits bei rund 0,8 Sekunden und die längste über 2 Sekunden. Mit der weiteren Entwicklung hätte sich das noch weiter verschlimmert. Es klingt nicht nach viel, aber stell dir einmal vor, dass du mehrere Einstellungen auf einmal ändern möchtest. Als erstes musst du warten, dass das Einstellungenmenü erscheint, was bereits bis zu 2 Sekunden dauerte. Danach tippst du auf eine Einstellung, um sie umzuschalten, was rund eine Sekunde dauerte, und so weiter. Es war einfach zu viel Zeit, die verloren ging, vorallem während der Entwicklung.

Ich hab dann versucht, das ganze in einer Webseite zu machen, da bereits ein paar Teile mit JavaScript liefen. Dies wollte ich direkt in der Kurzbefehle-App öffnen, allerdings war leider keine Interaktion möglich, also blieb mir nicht viel anderes über, als die Webseite im Browser zu öffnen.

### Warum muss ich den Tab der Webseite selbst schließen?
Er _sollte_ sich von selbst schließen. In meinen Tests mit Webseiten, die nur die Logik beinhalten, sich selbst zu schließen, funktioniert es einfach. Allerdings funktioniert es ohne ersichtlichen Grund hier nicht. Da ich keinen Mac besitze, kann ich nicht wirklich die Webseite debuggen und hab deswegen aufgehört, nach einer Lösung zu suchen. Ich wollte ja den Rest des Kurzbefehls auch fertig kriegen und habe mich entschieden, das Problem später wieder aufzugreifen. Wenn du helfen möchtest, schau bitte auf [Github Issues](https://github.com/schl3ck/copy-paste-actions/issues/1).

### Wie stehts mit dem Datenschutz?
Dieser Kurzbefehl ladet nur die fertigen Kurzbefehle mit deiner Zustimmung in iCloud hoch, um sie zu Importieren. Dies ist leider wegen der weiter oben beschriebenen Einschränkung notwendig. Die Einstellungen und Ausschnitte, sowie die iCloud URLs der hochgeladenen Kurzbefehle werden in deiner iCloud Drive oder Dropbox gespeichert, je nachdem was du beim Importieren meines Kurzbefehls ausgewählt hast. Wenn du diesen Kurzbefehl ausführst und der Browser geöffnet wird, wird eine Datei aus meinem GitHub Repository geladen, um auf eine neue Version zu überprüfen ([diese Datei](https://github.com/schl3ck/copy-paste-actions/blob/master/version.json)). Dabei speichert GitHub möglicherweise deine IP-Adresse und/oder andere Information. Bitte lies die [Datenschutzrichtlinie von GitHub](https://docs.github.com/de/free-pro-team@latest/github/site-policy/github-privacy-statement) für mehr Informationen.

Außer diesen Information werden keine anderen Informationen gesammelt und irgendwohin gesendet. Damit dieser Kurzbefehl funktioniert, werden deine Kurzbefehle analysiert, die du ausgewählt hast. Dies läuft vollständig auf deinem Gerät. Ich schätze deine Privatsphäre und habe kein Interesse, irgendwelche Daten über dich zu sammeln.

### Wo kann ich den Source Code finden?
Der Source Code für den Webseiten-Teil dieses Kurzbefehls ist auf GitHub verfügbar: https://www.github.com/schl3ck/copy-paste-actions
