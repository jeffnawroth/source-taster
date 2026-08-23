<!-- image -->

Fakultät III Master Wirtschaftsinformatik

## Masterarbeit

Entwicklung und Evaluation einer Browser-Erweiterung zur Verifikation wissenschaftlicher Quellen unter Berücksichtigung von KI-generierten Inhalten im Kontext der Hochschullehre

Gutachter:

Univ.-Prof. Dr. Thomas Ludwig Univ.-Prof. Dr. Claudia Müller

Betreuer:

Kevin Krings Nino Bohn

Vorgelegt von:

Jeff Nawroth, 1498019 Ernstweg 31, 57072, Siegen jeff.nawroth@student.uni-siegen.de Master Wirtschaftsinformatik

Eren Cicek, 1514355 Parkstraße 14, 57072 Siegen eren.cicek@student.uni-siegen.de Master Wirtschaftsinformatik

## Zusammenfassung

Die zunehmende Nutzung generativer künstlicher Intelligenz in der Wissenschaft führt vermehrt zu 'halluzinierten', also formal korrekt wirkenden, jedoch nicht existenten Quellenangaben, welche die wissenschaftliche Integrität gefährden. Eine empirische Vorstudie bestätigte den hohen praktischen Bedarf an einer automatisierten Prüflösung. Daher entwickelt und evaluiert diese Arbeit eine Browser-Erweiterung zur automatisierten, formalen Verifikation bibliografischer Quellenangaben. Der konzeptionelle Kern basiert auf einer adaptierten Entity-Resolution-Pipeline, die unstrukturierte Referenzen extrahiert, normalisiert und deterministisch gegen autoritative Metadatenquellen abgleicht.

Aufbauend auf den Nutzeranforderungen wurde die Erweiterung als Vue.js-basierte WebExtension mit einer modularen Programmierschnittstelle implementiert. Das System kombiniert sprachmodellbasierte und statistisch trainierte Extraktionsverfahren mit einer konfigurierbaren Such- und Matching-Strategie. Die quantitative Evaluation anhand kuratierter Datensätze belegt eine hohe Verifikationsgenauigkeit: Bei echten APA-Referenzen wurden 93 % als exakte Treffer identifiziert (Ø-Score: 99 , 11 %). Das System erwies sich als robust gegenüber Formatierungsfehlern (Ø-Score modifizierter Referenzen: 96 , 22 %) und erkannte sämtliche synthetische, nicht existierende Quellen zuverlässig (100 % Korrekterkennung). Die durchschnittliche Verarbeitungszeit pro Referenz lag bei unter 3 s.

Die Arbeit demonstriert damit eine praktikable und effiziente Methode zur automatisierten Verifikation bibliografischer Quellenangaben. Die Lösung trägt dazu bei, Qualitätsrisiken durch halluzinierte Referenzen in wissenschaftlichen Arbeitsprozessen zu minimieren und bildet zugleich eine Grundlage für die weitere Erforschung skalierbarer Integritätssicherung im wissenschaftlichen Publikationswesen.

Stichwörter: referenzverifikation, halluzination, browser-erweiterung, wissenschaftliche integrität, entity resolution, large language models

## Inhaltsverzeichnis

| Zusammenfassung       | Zusammenfassung                               | Zusammenfassung                                                        | Zusammenfassung                                                                                                              | II   |
|-----------------------|-----------------------------------------------|------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|------|
| Abbildungsverzeichnis | Abbildungsverzeichnis                         | Abbildungsverzeichnis                                                  | Abbildungsverzeichnis                                                                                                        | VI   |
| Tabellenverzeichnis   | Tabellenverzeichnis                           | Tabellenverzeichnis                                                    | Tabellenverzeichnis                                                                                                          | VII  |
| Abkürzungsverzeichnis | Abkürzungsverzeichnis                         | Abkürzungsverzeichnis                                                  | Abkürzungsverzeichnis                                                                                                        | IX   |
| 1 Einleitung          | 1 Einleitung                                  | 1 Einleitung                                                           | 1 Einleitung                                                                                                                 | 1    |
|                       | 1.1                                           | Ausgangslage . . . . . . . . . . . . . . . . . . . . . . . . . . .     | . .                                                                                                                          | . 1  |
|                       | 1.2                                           | Motivation . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . | .                                                                                                                            | . 1  |
|                       | 1.3                                           | Ziele der Arbeit . . . . . . . . . . . . . . . . . . . . . . . . .     | . . .                                                                                                                        | . 2  |
|                       | 1.4                                           | Aufbau der Arbeit . . . . . . . . . . . . . .                          | . . . . . . . . . . . .                                                                                                      | . 3  |
| 2                     | Theoretische Grundlagen und Stand der Technik | Theoretische Grundlagen und Stand der Technik                          | Theoretische Grundlagen und Stand der Technik                                                                                | 4    |
|                       | 2.1                                           | KI-Halluzination als Bedrohung der wissenschaftlichen Integrität       | .                                                                                                                            | . 4  |
|                       | 2.2                                           | Ein Prozessmodell der Referenzverifikation . . . . . . . . . . . .     | .                                                                                                                            | . 6  |
|                       |                                               | 2.2.1                                                                  | Das Problem der Referenzverifikation als Anwendungsfall von ER . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . | . 6  |
|                       |                                               | 2.2.2                                                                  | Abstraktion einer generischen Verifikationspipeline . . . . . .                                                              | . 8  |
|                       |                                               | 2.2.3                                                                  | Ableitung wissenschaftlicher Bewertungskriterien . . .                                                                       | . 9  |
|                       | 2.3                                           | Stand der Technik: Methoden und Systeme zur Referenzverifikation       | Stand der Technik: Methoden und Systeme zur Referenzverifikation                                                             | . 10 |
|                       |                                               | 2.3.1                                                                  | Extraktion und Normalisierung . . . . . . . . . . . . . . .                                                                  | . 11 |
|                       |                                               | 2.3.2                                                                  | CSL-Ökosystem: Datenformat, Stile und Prozessoren . . .                                                                      | . 13 |
|                       |                                               | 2.3.3                                                                  | Matching und Auflösung gegen Metadatenquellen . . . . .                                                                      | . 14 |
|                       |                                               | 2.3.4                                                                  | Bewertung der Performanz: Metriken und Qualitätssicherung                                                                    | . 17 |
|                       | 2.4                                           | Zusammenfassung . . . . . . . . . . . . . . . . . . . . . . . . . .    | .                                                                                                                            | . 19 |
| 3                     | Methodik                                      | Methodik                                                               | Methodik                                                                                                                     | 21   |
|                       | 3.1                                           | Integratives Forschungsdesign                                          | . . . . . . . . . . . . . . . . . . . .                                                                                      | . 21 |
|                       | 3.2                                           | Operationalisierung der Forschungsfragen . . . . .                     | . . . . . . . . .                                                                                                            | . 22 |
| 4                     | Vorstudie: Umfrage zur Referenzverifikation   | Vorstudie: Umfrage zur Referenzverifikation                            | Vorstudie: Umfrage zur Referenzverifikation                                                                                  | 24   |
|                       | 4.1                                           | Methodik . . . .                                                       | . . . . . . . . . . . . . . . . . . . . . . . . . . .                                                                        | . 24 |
|                       | 4.2                                           | Ergebnisse . . . . . . . .                                             | . . . . . . . . . . . . . . . . . . . . . . .                                                                                | . 25 |
|                       |                                               | 4.2.1                                                                  | Demografische und fachliche Merkmale . . . . . . . . . . .                                                                   | . 25 |
|                       |                                               | 4.2.2                                                                  | Nutzung und Wahrnehmung von KI-Tools . . . . . . . . .                                                                       | . 27 |
|                       |                                               | 4.2.3                                                                  | Aktuelle Praxis der Überprüfung von Quellenangaben . . .                                                                     | . 30 |
|                       |                                               | 4.2.4                                                                  | Anforderungen an Tools zur Quellenangabenüberprüfung .                                                                       | . 34 |
|                       |                                               | 4.2.5                                                                  | Risiken des KI-Einsatzes in der wissenschaftlichen Literaturre-                                                              |      |

cherche .

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

37

4.3

Diskussion der Befunde .

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

38

| . . . . . . . .                    | . . . . . . . .                                                     | . . . . . . . .                                                                                                                |       |
|------------------------------------|---------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|-------|
|                                    | 4.3.1                                                               | Einordnung zentraler Ergebnisse . . . . . . . . .                                                                              | 39    |
|                                    | 4.3.2                                                               | Beantwortung der Forschungsfrage: Nutzerzentrierte Anforde- rungen und Hebel . . . . . . . . . . . . . . . . . . . . . . . . . | 39    |
|                                    | 4.3.3                                                               | Grenzen und Validität . . . . . . . . . . . . . . . . . . . . . .                                                              | 40    |
| 4.4                                | Fazit                                                               | und Zusammenfassung . . . . . . . . . . . . . . . . . . . . . . .                                                              | 40    |
| Konzeptionierung                   | Konzeptionierung                                                    | Konzeptionierung                                                                                                               | 42    |
| 5.1 Zielbild, Scope und Abgrenzung | 5.1 Zielbild, Scope und Abgrenzung                                  | . . . . . . . . . . . . . . . . . . . . .                                                                                      | 42    |
| 5.2                                | Anforderungen .                                                     | . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                                                                      | 44    |
|                                    | 5.2.1                                                               | Funktionale Anforderungen . . . . . . . . . . . . . . . . . . .                                                                | 44    |
|                                    | 5.2.2                                                               | Nicht-funktionale Anforderungen . . . . . . . . . . . . . . . .                                                                | 47    |
| 5.3                                | Use Cases . . . . . . . . . . .                                     | . . . . . . . . . . . . . . . . . . . . . .                                                                                    | 48    |
| 5.4                                | Verifikationsprozess . . . .                                        | . . . . . . . . . . . . . . . . . . . . . . . .                                                                                | 50    |
|                                    | 5.4.1                                                               | Grundlegende Designentscheidungen . . . . . . . . . . . . . .                                                                  | 51    |
|                                    | 5.4.2                                                               | Prozessphasen und Methoden . . . . . . . . . . . . . . . . . .                                                                 | 53    |
|                                    | 5.4.3                                                               | Fallbeispiel: Vollständige Verifikation einer Referenz . . . . . .                                                             | 55    |
| 5.5                                | Systemarchitektur . . . . . . . . . . . . . . . . . . .             | . . . . . . . . . .                                                                                                            | 56    |
| 5.6                                | Zusammenfassung . . . . . . . . . . . . . . .                       | . . . . . . . . . . . . . .                                                                                                    | 58    |
| Implementierung                    | Implementierung                                                     | Implementierung                                                                                                                | 60    |
| 6.1                                | Implementierungsstrategie . .                                       | . . . . . . . . . . . . . . . . . . . . . .                                                                                    | 60    |
| 6.2                                | Umsetzung der Browser-Erweiterung . . . .                           | . . . . . . . . . . . . . .                                                                                                    | 61    |
|                                    | 6.2.1                                                               | Benutzeroberfläche und Workflow . . . . . . . . . . . . . . . .                                                                | 62    |
|                                    | 6.2.2                                                               | Konfiguration und Anpassbarkeit . . . . . . . . . . . . . . . .                                                                | 67    |
| 6.3                                | Implementierung der Hono-API-Services . . . . . . . . . . . . . . . | .                                                                                                                              | 72    |
| 6.4                                | Integration externer Dienste . . . . . . . .                        | . . . . . . . . . . . . . . .                                                                                                  | 74    |
| 6.5                                | Zusammenfassung . . . .                                             | . . . . . . . . . . . . . . . . . . . . . . . . .                                                                              | 76    |
| Evaluation                         | Evaluation                                                          | Evaluation                                                                                                                     | 77    |
| 7.1                                | Evaluationsziele und Kriterien . . . . . .                          | . . . . . . . . . . . . . . . .                                                                                                | 77    |
| 7.2                                | Methodisches Vorgehen . . . .                                       | . . . . . . . . . . . . . . . . . . . . . .                                                                                    | 78    |
| 7.3                                | Ergebnisse . . . . . . .                                            | . . . . . . . . . . . . . . . . . . . . . . . . . .                                                                            | 81    |
|                                    | 7.3.1                                                               | Verifikationsgenauigkeit . . . . . . . . . . . . . . . . . . . . .                                                             | 82    |
|                                    | 7.3.2                                                               | Robustheit gegenüber Störungen . . . . . . . . . . . . . . . .                                                                 | 87    |
|                                    | 7.3.3                                                               | Erkennung nicht-existenter Quellen . . . . . . . . . . . . . . .                                                               | 89    |
| 7.4                                | 7.3.4 Systemperformance . Fazit und Zusammenfassung                 | . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                                    | 91 96 |
| Diskussion                         | Diskussion                                                          | Diskussion                                                                                                                     | 98    |
| 8.1                                | Zusammenfassung und Interpretation der zentralen Ergebnisse         | . . . .                                                                                                                        | 98    |
| 8.2                                | Einordnung in den Stand der Technik und theoretischen               | Rahmen . .                                                                                                                     | 99    |

8.3

Kritische Würdigung von Stärken und Limitationen

.

.

.

.

.

.

.

.

.

. 100

|                      | 8.4 Implikationen für Forschung und Praxis . . . . . . . . . . . . . . .        | 8.4 Implikationen für Forschung und Praxis . . . . . . . . . . . . . . .   |           |
|----------------------|---------------------------------------------------------------------------------|----------------------------------------------------------------------------|-----------|
| 9                    | Fazit                                                                           | Fazit                                                                      | 103       |
| Literaturverzeichnis | Literaturverzeichnis                                                            | Literaturverzeichnis                                                       | 105       |
| A                    | Vorstudie                                                                       | Vorstudie                                                                  | 111       |
|                      | A.1                                                                             | Beispielhafte Kodierungen . . . . . . . . . . . . . . . . . . . . . . .    | . 111     |
|                      | A.1.1                                                                           | Fachrichtungen . . . . . . . . . . . . . . . . . . . . . . . . .           | . 111     |
|                      | A.1.2                                                                           | Rollen . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .         | . 111     |
|                      | A.1.3                                                                           | Methoden der Quellenüberprüfung . . . . . . . . . . . . . .                | . 112     |
|                      | A.1.4                                                                           | Probleme bei der Quellenüberprüfung . . . . . . . . . . . . .              | . 113     |
|                      | A.1.5                                                                           | Arbeitsschritte mit Relevanz für die Quellenüberprüfung . .                | . 114     |
|                      | A.1.6                                                                           | Wünsche an ein Tool zur Überprüfung von Quellenangaben . .                 | 114       |
|                      | A.1.7                                                                           | Risiken durch den Einsatz von KI-Systemen . . . . . . . . .                | . 116     |
|                      | A.2 Rekodierung der Freitextangaben . . . . . . . . . . . . . . .               | A.2 Rekodierung der Freitextangaben . . . . . . . . . . . . . . .          |           |
| B                    | Evaluation B.1 Beispielhafte Referenzen je Datensatztyp . . . . . . . . . . . . | . . .                                                                      | 121 . 121 |
|                      |                                                                                 | B.1.1 Echter Datensatz . . . . . . . . . . . . . . . . . . . . . . . .     | . 121     |
|                      | B.1.2                                                                           | Modifizierter Datensatz . . . . . . . . . . . . . . . . . . . . .          | . 122     |
|                      | B.1.3                                                                           | Synthetischer Datensatz . . . . . . . . . . . . . . . . . . . .            | . 123     |
|                      | B.2                                                                             | Beispielhafte Evaluationsdaten . . . . . . . . . . . . . . . . . . . . .   | . 125     |
|                      |                                                                                 |                                                                            | 125       |
|                      | B.2.1                                                                           | Matching mit DOI . . . . . . . . . . . . . . . . . . . . . . .             | .         |
|                      | B.2.2                                                                           | Matching ohne DOI . . . . . . . . . . . . . . . . . . . . . . .            | . 126     |
|                      | B.2.3                                                                           | Systemperformance . . . . . . . . . . . . . . . . . . . . . . .            | . 127     |

## Abbildungsverzeichnis

1

Vier-Phasen-Modell der Referenzverifikation

|    | . . . . . . . . . .                                                                                                                              |    |
|----|--------------------------------------------------------------------------------------------------------------------------------------------------|----|
|  2 | Verteilung der Fachrichtungen der Befragten . . . .                                                                                              | 26 |
|  3 | Rollenverteilung der Befragten . . . . . . . . . . . . . . . . . . . . . .                                                                       | 26 |
|  4 | Nutzung von KI-Tools in zwei Arbeitsschritten . . . . . . . . . . . . .                                                                          | 27 |
|  5 | Beobachtung halluzinierter Quellenangaben bei KI-Tools . . . . . . .                                                                             | 28 |
|  6 | Einschätzung der zukünftigen Häufigkeit halluzinierter KI-Quellenangaben                                                                         |    |
|  7 | Aktuell genutzte Methoden zur Überprüfung von Quellenangaben . .                                                                                 | 31 |
|  8 | Selbsteingeschätzter Zeitaufwand pro Quellenangabe . . . . . . . . .                                                                             | 31 |
|  9 | Verzicht auf vollständige Überprüfung von Quellenangaben aufgrund von Zeitmangel . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .     | 32 |
| 10 | Häufig auftretende Probleme bei der Überprüfung von Quellenangaben                                                                               | 33 |
| 11 | Einschätzung der Beeinträchtigung der Qualität wissenschaftlicher Arbeiten durch ungeprüfte Quellenangaben . . . . . . . . . . . . . . .         | 34 |
| 12 | Einschätzung des Nutzens einer Überprüfung von Quellenangaben in verschiedenen Arbeitsschritten . . . . . . . . . . . . . . . . . . . . . .      | 35 |
| 13 | Einschätzung der Wichtigkeit zentraler Funktionen eines Tools zur Überprüfung von Quellenangaben . . . . . . . . . . . . . . . . . . . .         | 36 |
| 14 | Genannte Wünsche an ein Tool zur Überprüfung von Quellenangaben                                                                                  | 36 |
| 15 | Genannte Risiken des KI-Einsatzes bei der Literaturrecherche . . . .                                                                             | 38 |
| 16 | Systemarchitektur des Referenzverifikationssystems . . . . . . . . . .                                                                           | 57 |
| 17 | Hauptansicht der Benutzeroberfläche zur Referenzverifikation . . . . .                                                                           | 62 |
| 18 | Benutzeroberfläche zur Referenzextraktion . . . . . . . . . . . . . . .                                                                          | 63 |
| 19 | Token-Editor zur manuellen Validierung und Korrektur von AnyStyle- Tokens . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .  | 64 |
| 20 | Benutzeroberfläche zur Referenzverifikation . . . . . . . . . . . . . . .                                                                        | 65 |
| 21 | Benutzeroberfläche zur Anzeige verifizierter Referenzmetadaten . . .                                                                             | 66 |
| 22 | Evidenzansicht der feldweisen Übereinstimmungsbewertung . . . . . .                                                                              | 66 |
| 23 | Benutzeroberfläche zur Konfiguration der Felder für die LLM-Extraktion                                                                           | 67 |
| 24 | Benutzeroberfläche zur Konfiguration der Datenbankaktivierung und -priorität . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . | 68 |
| 25 | Benutzeroberfläche zur Konfiguration der Early-Termination . . . . .                                                                             | 68 |
| 26 | Benutzeroberfläche zur Konfiguration der Klassifikationsschwellenwerte                                                                           | 70 |
| 27 | Benutzeroberfläche zur Auswahl des Normalisierungsmodus . . . . . .                                                                              | 70 |
| 28 | Benutzeroberfläche zur Konfiguration der Feldauswahl und Gewich- tung im Matching-Algorithmus . . . . . . . . . . . . . . . . . . . . .          | 71 |
| 29 | Benutzeroberfläche zur Konfiguration der KI-Anbieter und API-Schlüssel                                                                           | 71 |

.

.

.

.

.

.

.

.

.

.

.

.

.

.

8

29

## Tabellenverzeichnis

1

Zusammenhang zwischen Fachrichtung und KI-Nutzung .

| 2    | Zusammenhang zwischen Rolle und Halluzinationserfahrung . . . .                                                                                    |   30 |
|------|----------------------------------------------------------------------------------------------------------------------------------------------------|------|
| 3    | Zusammenhang zwischen Zeitaufwand und dem Verzicht auf die Über- prüfung von Quellenangaben . . . . . . . . . . . . . . . . . . . . . .            |   32 |
| 4    | Funktionale Anforderungen an die Browser-Erweiterung . . . . . . .                                                                                 |   46 |
| 5    | Nicht-funktionale Anforderungen an die Browser-Erweiterung . . . .                                                                                 |   48 |
| 6    | Übersicht der Use Cases . . . . . . . . . . . . . . . . . . . . . . . .                                                                            |   49 |
| 7    | Vergleich der Metadaten: Eingabereferenz vs. Kandidat . . . . . . .                                                                                |   55 |
| 8    | Berechnung des Verifikationsscores anhand einer Beispielreferenz . .                                                                               |   56 |
| 9    | Modulare API-Services der Architektur . . . . . . . . . . . . . . . .                                                                              |   72 |
| 10   | Gesamtgenauigkeit der Verifikation echter APA-Referenzen . . . . .                                                                                 |   82 |
| 11   | Genauigkeit der Verifikation nach Publikationstyp für APA-Referenzen                                                                               |   83 |
| 12   | Vergleich der Genauigkeit mit und ohne DOI-Suche . . . . . . . . .                                                                                 |   83 |
| 13   | Vergleich der Verifikationsgenauigkeit über alle Zitierstile . . . . . .                                                                           |   85 |
| 14   | Vergleich der Verifikationsgenauigkeit - Original vs. modifizierte APA- Referenzen . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . |   87 |
| 15   | Robustheit nach Publikationstyp - modifizierte APA-Referenzen . .                                                                                  |   88 |
| 16   | Erkennung nicht-existenter Quellen . . . . . . . . . . . . . . . . . .                                                                             |   90 |
| 17   | Vereinfachte Performance-Kennzahlen am Beispiel APA-Referenzen                                                                                     |   91 |
| 18   | Performance-Vergleich der Verifikationspipeline nach Zitierstil . . .                                                                              |   92 |
| 19   | Durchschnittliche Verarbeitungszeiten pro Systemkomponente . . .                                                                                   |   94 |
| 20   | Vergleich der Systemperformance mit und ohne Early Termination .                                                                                   |   95 |
| A.1  | Exemplarische Kodierungsliste - Fachrichtungen . . . . . . . . . . .                                                                               |  111 |
| A.2  | Exemplarische Kodierungsliste - Rollen . . . . . . . . . . . . . . . .                                                                             |  112 |
| A.3  | Exemplarische Kodierungsliste - Methoden zur Überprüfung von Quellenangaben . . . . . . . . . . . . . . . . . . . . . . . . . . . . .              |  112 |
| A.4  | Exemplarische Kodierungsliste - Probleme bei der Überprüfung von Quellenangaben . . . . . . . . . . . . . . . . . . . . . . . . . . . . .          |  113 |
| A.5  | Exemplarische Kodierungsliste - Arbeitsschritte . . . . . . . . . . .                                                                              |  114 |
| A.6  | Exemplarische Kodierungsliste - Wünsche an ein Tool zur Überprüfung von Quellenangaben . . . . . . . . . . . . . . . . . . . . . . . . . .         |  115 |
| A.7  | Exemplarische Kodierungsliste - Risiken durch den Einsatz von KI in der wissenschaftlichen Literaturrecherche . . . . . . . . . . . . . . .        |  117 |
| A.8  | Zuordnung von Fachrichtungs-Codes → Hauptkategorien . . . . . .                                                                                    |  119 |
| A.9  | Zuordnung von Rollen-Codes → Hauptkategorien . . . . . . . . . .                                                                                   |  119 |
| A.10 | Zuordnung von Methoden-Codes → Hauptkategorien . . . . . . . .                                                                                     |  120 |
| A.11 | Zuordnung von Problem-Codes → Hauptkategorien . . . . . . . . .                                                                                    |  120 |
| A.12 | Zuordnung von Arbeitsschritt-Codes → Hauptkategorien . . . . . .                                                                                   |  121 |
| B.1  | Ø-Score nach Publikationstyp . . . . . . . . . . . . . . . . . . . . .                                                                             |  125 |

.

.

.

.

.

.

.

29

B.2

Score-Verteilung nach Publikationstyp

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

. 126

| B.3   | Ø-Score nach Publikationstyp . . . . . . . . . . . . . . . . . . . . . . 126   |
|-------|--------------------------------------------------------------------------------|
| B.4   | Score-Verteilung nach Publikationstyp . . . . . . . . . . . . . . . . . 127    |
| B.5   | Performance der Pipeline . . . . . . . . . . . . . . . . . . . . . . . . . 128 |

## Abkürzungsverzeichnis

ACS

American Chemical Society

AMA

American Medical Association

APA

American Psychological Association

API

Application Programming Interface

CERMINE

Computational Extraction and Recognition of Metadata from Inline Notations

CRF

Conditional Random Fields

CSL

Citation Style Language

DFG

Deutsche Forschungsgemeinschaft

DOI

Digital Object Identifier

DSR

Design Science Research

ER

Entity Resolution

EXCITE

Extraction of Citations

GPT

Generative Pre-trained Transformer

GROBID

GeneRation Of BIbliographic Data

IEEE

Institute of Electrical and Electronics Engineers

ISBN

International Standard Book Number

JSON

JavaScript Object Notation

KI

Künstliche Intelligenz

LLM

Large Language Model

ML

Maschinelles Lernen

MLA

Modern Language Association

PDF

Portable Document Format

PMC

PubMed Central

## 1 Einleitung

Die zunehmende Nutzung generativer Sprachmodelle in wissenschaftlichen Arbeitsprozessen führt zu formal plausiblen, tatsächlich jedoch nicht existierenden Quellenangaben. Solche halluzinierten Quellen gefährden Nachvollziehbarkeit und Reproduzierbarkeit als Kernprinzipien wissenschaftlicher Integrität (Alkaissi &amp; McFarlane, 2023; Chelli et al., 2024; Forschungsgemeinschaft, 2025). Vor diesem Hintergrund entwickelt und evaluiert diese Arbeit eine Browser-Erweiterung zur automatisierten Verifikation bibliografischer Referenzen. Der Ansatz verortet die Aufgabe als Anwendungsfall der Entity Resolution (ER), verbindet theoretische Fundierung mit empirischer Anforderungserhebung und mündet in ein gestaltungsorientiert entwickeltes Tool, dessen Leistungsfähigkeit experimentell geprüft wird.

## 1.1 Ausgangslage

Die Arbeit knüpft an eine vorangegangene Projektarbeit an, in der ein Prototyp zur Digital Object Identifier (DOI)-Verifikation über die Crossref-Schnittstelle (Crossref, 2025c) umgesetzt wurde. Dieser Ansatz erlaubte zwar eine grundsätzliche Prüfung vorhandener Identifikatoren, blieb jedoch funktional und methodisch begrenzt. Er fokussierte ausschließlich auf DOIs, nutzte reguläre Ausdrücke zur Erkennung und war nicht theoretisch verankert. Damit fehlten eine robuste Verarbeitung referenztypischer Variabilität sowie nachvollziehbare Entscheidungen jenseits des bloßen Identifikator-Abgleichs. Die vorliegende Masterarbeit greift diese Grenzen auf und erweitert den Ansatz zu einem wissenschaftlich fundierten, empirisch abgesicherten und gestaltungsorientiert entwickelten System.

## 1.2 Motivation

Die Sicherung wissenschaftlicher Integrität erfordert nachvollziehbare und überprüfbare Quellenangaben. Der Deutsche Forschungsgemeinschaft (DFG)-Kodex fordert explizit die Offenlegung der Herkunft verwendeter Daten, Materialien und Software sowie die klare Zitierung der Originalquellen, um Replizierbarkeit und Überprüfung zu ermöglichen (Forschungsgemeinschaft, 2025). Der verbreitete Einsatz generativer Sprachmodelle verstärkt diese Anforderung, da halluzinierte Quellenangaben nachweislich auftreten und formal plausible, tatsächlich jedoch falsche oder nicht existierende Referenzen erzeugen (Alkaissi &amp; McFarlane, 2023; Chelli et al., 2024). Damit sind Nachvollziehbarkeit und Reproduzierbarkeit unmittelbar gefährdet.

Zugleich erfordert die verlässliche Bewertung der von Sprachmodellen ausgegebenen Referenzen weiterhin eine gründliche Verifikation durch Forschende, was den praktischen Aufwand erhöht und die Skalierbarkeit manueller Verfahren begrenzt (Chelli et al., 2024). Vorliegende Werkzeuge adressieren das Problem häufig nur partiell, etwa indem sie Referenztexte auf vorhandene DOIs abbilden, ohne eine ganzheitliche, mehrstufige Verifikationslogik für unvollständige oder fehlerhafte Eingaben bereitzustellen (Crossref, 2025d).

Darüber hinaus ist das Aufgabenprofil der Referenzverifikation domänenspezifisch anspruchsvoll. Es umfasst robuste Extraktion und Normalisierung heterogener Zitierstile sowie das Matching gegen autoritative Metadatenquellen. Der Stand der Technik identifiziert hierfür einerseits regelbasierte, andererseits Maschinelles Lernen (ML)-basierte Parser und zeigt deren Stärken und Grenzen auf (Cioffi &amp; Peroni, 2022). Quellenspezifische Schnittstellen und bibliometrische Werkzeuge ermöglichen den Zugriff und die Aufbereitung von Metadaten, bieten jedoch selbst keine integrierte Verifikationspipeline mit feldweiser Evidenzbewertung und Klassifikation (Aria et al., 2023; Priem et al., 2022). Der eigentliche Abgleich lässt sich fundiert als Anwendungsfall von ER einordnen, bei dem effizientes Blocking, feldspezifische Ähnlichkeitsbewertung und eine verlässliche Entscheidung zwischen Match und Non-Match erforderlich sind (Saier et al., 2021).

In Summe ergibt sich ein klarer Bedarf an effizienten, möglichst automatisierten Lösungen, die die Verifikation von Quellenangaben skalierbar, nachvollziehbar und zuverlässig gestalten und damit zur Qualitätssicherung in Künstliche Intelligenz (KI)gestützten wissenschaftlichen Arbeitsprozessen beitragen.

## 1.3 Ziele der Arbeit

Ziel dieser Arbeit ist die Entwicklung und Evaluation einer wissenschaftlich fundierten Browser-Erweiterung zur automatisierten Referenzverifikation. Das Forschungsvorhaben folgt dabei einem Design Science Research (DSR)-Ansatz. Dieser umfasst eine empirische Fundierung sowie die gestaltungsorientierte Entwicklung einer ERbasierten Verifikationspipeline mit dualer Extraktionsstrategie. Abschließend wird das System in einer experimentellen Evaluation auf kuratierten Datensätzen mit etablierten Metriken überprüft. Aus der Problemstellung ergeben sich drei leitende Fragen:

1. Wie muss ein System zur automatisierten Referenzverifikation konzipiert werden, um dessen Entscheidungen durchgängig reproduzierbar und für den Nutzer nachvollziehbar zu gestalten?
2. Welche nutzerzentrierten Anforderungen an eine automatisierte Referenzverifikation ergeben sich aus der aktuellen Praxis und wo liegen die größten Hebel für Effizienz und Qualität?
3. Welche Genauigkeit, Robustheit und Effizienz weist das Tool bei der Unterscheidung zwischen echten und KI-halluzinierten Quellenangaben unter praxisnahen Bedingungen auf?

Die Zielerreichung wird anhand messbarer Kriterien beurteilt, die im Stand der Technik (Abschnitt 2.3) verankert sind und in der Evaluation (Kapitel 7) angewendet werden. Hierzu zählen die Verifikationsgenauigkeit über Zitierstile und Publikationstypen hinweg, gemessen an etablierten Metriken (Precision, Recall, F1) und abgestuften Match-Kategorien. Ebenfalls evaluiert werden die Robustheit bei unvollständigen oder fehlerhaften Eingaben, insbesondere die zuverlässige Erkennung von Non-Matches, sowie die Systemperformance in Form der mittleren Verarbeitungszeit pro Referenz und des erzielbaren Durchsatzes. Gegenstand der Arbeit ist die formale Verifikation bibliografischer Metadaten durch Extraktion, Normalisierung, Kandidatensuche, Matching und Klassifikation gegen autoritative Quellen. Nicht umfasst sind hingegen die inhaltliche Bewertung oder Relevanzbeurteilung der zitierten Arbeiten, Plagiatsprüfungen sowie stilistische Formatkorrekturen, die über die für das Matching notwendige Normalisierung hinausgehen. Als wissenschaftlichen und praktischen Beitrag leistet die Arbeit die Bereitstellung eines nutzerzentrierten Tools zur skalierbaren Referenzverifikation. Konkret adaptiert sie das ER-Paradigma domänenspezifisch für bibliografische Referenzen und integriert eine feldweise Evidenzdarstellung mit mehrstufiger Klassifikation. Zudem liefert die Evaluation (Kapitel 7) mit kuratierten Datensätzen belastbare Evidenz zur Genauigkeit, Robustheit und Performance und schafft damit eine nachvollziehbare Grundlage für den Einsatz in KI-gestützten wissenschaftlichen Arbeitsprozessen.

## 1.4 Aufbau der Arbeit

Ausgehend von den theoretischen Grundlagen und dem Stand der Technik in Kapitel 2 wird das Problemfeld der halluzinierten Quellenangaben präzisiert, die Referenzverifikation im Rahmen von ER verortet und Bewertungskriterien für Extraktion, Matching und Entscheidung hergeleitet. Darauf aufbauend erläutert die Methodik in Kapitel 3 das integrative Forschungsdesign. Diese verbindet drei zentrale Elemente zu einem konsistenten Vorgehen: die Anforderungserhebung, die gestaltungsorientierte Entwicklung und die experimentelle Evaluation. Die empirische Vorstudie in Kapitel 4 verdichtet Praxisanforderungen und bildet die Brücke zur Konzeption, die in Kapitel 5 einen zusammenhängenden Verifikationsprozess sowie eine tragfähige Systemarchitektur ausarbeitet. Die Implementierung in Kapitel 6 überführt diese Gestaltungsentscheidungen in eine nutzerzentrierte Browser-Erweiterung. Daran schließt sich in Kapitel 7 die Evaluation an, in der das Tool entlang definierter Gütekriterien geprüft wird. Diese umfassen Verifikationsgenauigkeit, Robustheit mit zuverlässiger Erkennung von Halluzinationen und Systemperformance. Die Diskussion in Kapitel 8 ordnet die Ergebnisse kritisch ein, diskutiert Stärken und Limitationen, leitet Implikationen für Forschung und Praxis ab und gibt einen Ausblick auf weiterführende Arbeiten. Den Abschluss bildet das Fazit in Kapitel 9, das die zentralen Erkenntnisse bündelt.

## 2 Theoretische Grundlagen und Stand der Technik

Im vorherigen Kapitel wurde das Problem vorgestellt, dass Sprachmodelle nichtexistente Quellenangaben generieren können, was die Integrität wissenschaftlicher Arbeiten gefährdet. Um dieses Problem zu lösen, sind automatisierte Prüfverfahren nötig. Bevor jedoch eine konkrete Lösung wie die in dieser Arbeit entwickelte BrowserErweiterung entworfen werden kann, muss das nötige theoretische und technische Grundwissen geschaffen werden.

das Problem der Referenzverifikation als spezifischen Anwendungsfall des etablierten ER-Paradigmas zu modellieren. Diese Einordnung ermöglicht es, auf bewährte Methoden und ein fundiertes Begriffssystem aus der Datenintegration zurückzugreifen. Darauf aufbauend wird der aktuelle Stand der Technik analysiert, um geeignete Algorithmen und Werkzeuge für die Umsetzung einer automatisierten Verifikationspipeline zu identifizieren.

Der Aufbau des Kapitels folgt dieser konzeptionellen Logik: Zunächst präzisiert Abschnitt 2.1 die spezifische Bedrohung, die von KI-Halluzinationen für die wissenschaftliche Praxis ausgeht. Anschließend entwickelt Abschnitt 2.2 ein generisches Prozessmodell der Referenzverifikation, indem es die Aufgabe als ER-Problem operationalisiert und die Phasen Extraktion, Kandidatensuche, Matching und Klassifikation herleitet. Abschnitt 2.3 analysiert schließlich den Stand der Technik entlang dieses Modells. Er untersucht etablierte Methoden und Systeme für die Extraktion und Normalisierung von Referenzen, das Matching gegen autoritative Metadatenquellen sowie Metriken zur Bewertung der Performanz.

Dieses Kapitel schafft so das notwendige theoretische und methodische Fundament, um die spätere Konzeption der Browser-Erweiterung in Kapitel 5 wissenschaftlich fundiert und auf dem neuesten Stand der Technik zu entwickeln.

## 2.1 KI-Halluzination als Bedrohung der wissenschaftlichen Integrität

Der Einsatz generativer KI-Systeme wie ChatGPT in der wissenschaftlichen Praxis hat deutlich zugenommen. Diese Systeme unterstützen Forschende bei der Literaturrecherche und dem Verfassen von Texten (F. J. Pinzolits, 2023). Mit dieser Verbreitung gehen jedoch neue Risiken einher, die die Grundlagen wissenschaftlicher Arbeit betreffen können (Panda &amp; Kaur, 2024).

Das zentrale Risiko besteht in dem Phänomen der sogenannten Halluzinationen . Hierunter werden Antworten verstanden, die sprachlich plausibel erscheinen, inhaltlich jedoch falsch oder erfunden sind (Ye et al., 2023). Im Kontext der Literaturrecherche zeigt sich dies in der Generierung formal korrekt wirkender, aber faktisch nicht existierender Quellenangaben (Alkaissi &amp; McFarlane, 2023).

Empirische Untersuchungen belegen die praktische Relevanz dieses Problems. In einer Studie generierte ChatGPT (OpenAI, 2025) auf Aufforderung hin fünf Referenzen, die sich sämtlich als entweder fehlerhaft oder nicht existent erwiesen (Alkaissi &amp; McFarlane, 2023). Eine vergleichende Analyse dokumentiert, dass Generative Pre-trained Transformer (GPT)-3.5 in rund 40 % der Fälle und GPT-4 in knapp 29 % der Fälle fehlerhafte Referenzen erstellt (Chelli et al., 2024). Diese unzuverlässigen Angaben stellen ein erhebliches Risiko für die wissenschaftliche Integrität dar.

Die Einhaltung der Grundsätze wissenschaftlicher Integrität nach den Leitlinien der DFG setzt zwingend die transparente Dokumentation und lückenlose Nachvollziehbarkeit aller Quellen und Methoden voraus. Gemäß den DFG-Leitlinien sind Forschende verpflichtet, alle relevanten Informationen zu Daten, Methoden und Analyseschritten so zu dokumentieren, dass eine Überprüfung und Bewertung der Ergebnisse durch Dritte möglich ist. Dies schließt ausdrücklich ein, die 'Nachvollziehbarkeit von Zitationen zu gewährleisten' und den Zugang zu den zugrunde liegenden Materialien zu ermöglichen (Forschungsgemeinschaft, 2025). Darüber hinaus wird die vollständige Offenlegung von Forschungsdaten, Methoden und Software sowie die umfassende Darlegung der Arbeitsabläufe gefordert, wobei eigene und fremde Vorarbeiten stets korrekt auszuweisen sind (Forschungsgemeinschaft, 2025). Um diese Nachvollziehbarkeit und Nachnutzbarkeit langfristig zu sichern, empfiehlt die DFG zudem die Hinterlegung von Daten und Materialien in anerkannten Repositorien nach den FAIR-Prinzipien (Findable, Accessible, Interoperable, Reusable) (Forschungsgemeinschaft, 2025).

Vor diesem Hintergrund stellt die Verwendung nicht existierender oder falsch belegter Quellen eine fundamentale Verletzung dieser Prinzipien dar. Derartige Referenzen machen Forschungsresultate weder überprüfbar noch reproduzierbar und untergraben damit die Grundpfeiler wissenschaftlicher Validität. Um die Glaubwürdigkeit der eigenen Arbeit zu wahren, ist es daher unerlässlich, die Genauigkeit von Quellenangaben kritisch zu prüfen, Halluzinationen zu identifizieren und eine lückenlose Dokumentation der verwendeten Literatur sicherzustellen.

Eine manuelle Überprüfung sämtlicher Quellen erscheint als naheliegende Gegenmaßnahme, stößt jedoch angesichts der dokumentierten Fehlerhäufigkeit von KI-Systemen im Forschungsalltag schnell an praktische Grenzen. Der hierfür erforderliche Zeitaufwand ist insbesondere bei umfangreichen Literaturverzeichnissen hoch. Daher besteht ein dringender Bedarf an effizienten, automatisierten Lösungen, die eine skalierbare und zuverlässige Verifikation von Quellenangaben ermöglichen (Glynn, 2025).

Um eine solche Lösung systematisch zu entwickeln, bedarf es zunächst eines klaren Verständnisses des zugrundeliegenden Verifikationsprozesses. Der folgende Abschnitt 2.2 entwickelt daher ein allgemeines Prozessmodell der Referenzverifikation, das als theoretische Grundlage für die weitere Arbeit dient. Aufbauend auf diesem Modell analysiert Abschnitt 2.3 den Stand der Technik, um geeignete Methoden für die Umsetzung zu identifizieren.

## 2.2 Ein Prozessmodell der Referenzverifikation

Wie im vorherigen Abschnitt dargelegt, stellt die Generierung nicht-existenter Quellenangaben durch KI-Systeme eine fundamentale Bedrohung für die wissenschaftliche Integrität dar. Bevor eine technische Lösung für dieses Problem entworfen werden kann, muss es jedoch zunächst in ein etabliertes informatisches Paradigma eingeordnet werden. Dies ermöglicht es, auf bestehende Methoden und ein fundiertes Begriffssystem zurückzugreifen. Die zentrale These dieses Abschnitts lautet, dass es sich bei der Referenzverifikation um einen spezifischen Anwendungsfall des ER-Problems handelt.

## 2.2.1 Das Problem der Referenzverifikation als Anwendungsfall von ER

Entity Resolution (auch 'Record Linkage' oder 'Deduplication') bezeichnet den Prozess, Datensätze zu identifizieren und zusammenzuführen, die dieselbe reale Entität repräsentieren. Das Verfahren ist ein Kernbestandteil der Datenbereinigung und -integration. Moderne Ansätze nutzen Matching-Funktionen, um Übereinstimmungen zu erkennen (Tang et al., 2022). Eine große Herausforderung besteht darin, dass reale Datenquellen heterogen und fehlerbehaftet sind. Unterschiede in Struktur, Format, Schema und Semantik erschweren das Matching und führen zu variierenden, unsauberen Darstellungen ein und derselben Entität (Moslemi et al., 2025). Moslemi et al. (2025) betonen beispielsweise, dass diese heterogene Datenlandschaft sowohl die Vorfilterung ('Blocking') als auch die Berechnung von Ähnlichkeiten behindert.

Wie Saier et al. (2021) herausarbeiten, lässt sich diese Problembeschreibung auf das Verknüpfen von Literaturreferenzen übertragen, da das Referenz-Linking ein spezieller Fall von ER ist. Eine textuelle Referenz im Literaturverzeichnis oder im Output eines KI-Systems stellt einen unstrukturierten, potenziell fehlerhaften Datensatz dar, während die korrekte Publikation in einer Metadatenbank (etwa Crossref oder OpenAlex (Priem et al., 2022)) die Entität repräsentiert (Saier et al., 2021). Der Verifikationsprozess beantwortet letztlich die Frage, ob die gegebene Referenz mit einer realen Publikation übereinstimmt, was eine klassische MatchingAufgabe darstellt.

Spezifische Herausforderungen der Referenzverifikation. Die Anwendung des ER-Paradigmas auf das spezifische Domänenproblem der Referenzverifikation offenbart mehrere besondere Herausforderungen, die über das klassische ER-Problem hinausgehen oder es in spezifischer Weise ausprägen.

Zunächst führt die hohe Variabilität der Eingabedaten zu erheblichen Erschwernissen. Wie Cioffi und Peroni (2022) zeigen, hat die exponentielle Zunahme wissenschaftlicher Publikationen zu einer Vielzahl von Zitierstilen geführt, was die Extraktion und Verifikation von Referenzen aus beispielsweise Portable Document Format (PDF)Dokumenten erheblich erschwert. Diese Vielfalt spiegelt sich in unterschiedlich formatierten Autorenangaben, Titeln, Jahreszahlen und Publikationsorganen wider.

Bevor ein Abgleich stattfinden kann, erfordert dies einen robusten Parsing-Schritt, bei dem die unstrukturierten Referenztexte in strukturierte Metadaten zerlegt werden müssen (Autor, Titel, Jahr, usw.). Cioffi und Peroni (2022) identifizieren sieben aktuelle Tools (u. a. Anystyle (AnyStyle Project, 2025), Computational Extraction and Recognition of Metadata from Inline Notations (CERMINE) (Tkaczyk et al., 2015), Extraction of Citations (EXCITE) (Hosseini et al., 2019) und GeneRation Of BIbliographic Data (GROBID) (GROBID Developers, 2025)) zur Extraktion und Strukturierung von Referenzen.

Hinzu kommen Herausforderungen durch Datenheterogenität und Skalierung. Wie Moslemi et al. (2025) herausarbeiten, führt die Heterogenität in Struktur, Format und Semantik zu Problemen bei Vorfilterung und Ähnlichkeitsvergleich. Bei der Referenzverifikation kommt erschwerend hinzu, dass große Datenbanken mit Millionen von Publikationen performant durchsucht werden müssen.

Eine besonders kritische Herausforderung im Kontext dieser Arbeit stellen halluzinierte Entitäten dar. KI-Systeme können Referenzen zu nicht existierenden Publikationen halluzinieren. Glynn (2025) argumentiert, dass es zeitaufwendig und im schlimmsten Fall unmöglich ist, zu beweisen, dass eine referenzierte Quelle nicht existiert. Deshalb muss ein Referenz-Verifikationssystem nicht nur Matches finden, sondern auch Non-Matches identifizieren. Diese Herausforderung stellt eine Neuinterpretation des ER-Problems dar: Während klassisches ER darauf abzielt, variierende Darstellungen existierender Entitäten zu verlinken, muss die Referenzverifikation im Kontext von KI-Halluzinationen auch sicher feststellen, dass eine Entität nicht existiert. Diese Anforderung an die Erkennung von Non-Matches geht über die Fähigkeiten vieler Standard-ER-Verfahren hinaus und begründet den Bedarf für eine Anpassung, wie sie in dieser Arbeit vorgenommen wird.

Fazit. Die Einordnung der Referenzverifikation als ER-Problem ermöglicht es, auf bewährte Methoden und Begriffe aus der Datenintegration zurückzugreifen (Saier et al., 2021). Gleichzeitig zeigen die genannten Quellen, dass die Besonderheiten bibliografischer Daten, von heterogenen Zitierstilen über die Notwendigkeit eines zuverlässigen Parsings bis zur Erkennung halluzinierter Entitäten, spezifische Anpassungen erfordern.

Im folgenden Abschnitt wird auf dieser Grundlage ein generisches Prozessmodell abgeleitet, das die einzelnen Schritte dieses Abgleichs formal beschreibt.

## 2.2.2 Abstraktion einer generischen Verifikationspipeline

Aufbauend auf der Einordnung als ER-Problem wird in diesem Abschnitt der generische Verifikationsprozess modelliert. Hierfür wird auf das etablierte Phasenmodell der ER-Pipeline nach Christen (2012) zurückgegriffen und für die Domäne der Referenzverifikation spezifiziert. Dieses Vorgehen stellt sicher, dass das Modell auf einem fundierten theoretischen Fundament aus der Literatur aufbaut.

Abbildung 1 Vier-Phasen-Modell der Referenzverifikation

<!-- image -->

Anmerkung. Eigene Darstellung, adaptiert aus dem ER-Ansatz nach Christen (2012)

Das allgemeine ER-Modell nach Christen (2012) umfasst die Phasen Datenvorverarbeitung, Indexierung, Vergleich und Entscheidung. Übertragen auf die Aufgabe der Referenzverifikation lässt sich dieser Prozess, wie in Abbildung 1 dargestellt, in vier Kernphasen gliedern:

Extraktion und Normalisierung (Datenvorverarbeitung). Ziel ist die Gewinnung strukturierter Metadaten aus unstrukturiertem Text. Die Vorverarbeitung umfasst das Entfernen von Interpunktion, das Erweitern von Abkürzungen, das Korrigieren von Schreibfehlern sowie das Parsieren der Referenz in klar definierte Attribute (Christen, 2012). Eine zentrale Herausforderung ergibt sich aus der hohen Variabilität der Eingabedaten durch unterschiedliche Zitierstile (Cioffi &amp; Peroni, 2022). Etablierte Verfahren und Tools für diesen Schritt wurden von Cioffi und Peroni (2022) identifiziert und evaluiert, darunter Anystyle, CERMINE, EXCITE, GROBID, PDFSSA4MET, Scholarcy und Science Parse.

Blocking und Kandidatengenerierung (Indexierung). Ziel ist die effiziente Reduktion des Suchraums der Metadatenbank (Christen, 2012). Blocking verwendet aus relevanten Attributen wie Titel, Autor und Jahr abgeleitete Blocking-Keys, die bestimmen, welche Datensätze in denselben Block fallen und damit als Kandidaten gelten (Papadakis et al., 2019; Saier et al., 2021). Die Strategie zielt darauf, den Suchraum zu verkleinern und gleichzeitig möglichst alle echten Matches beizubehalten, also einen hohen Recall zu sichern (Papadakis et al., 2019). Neben traditionellen Techniken wie key-basiertem Blocking, Sorted Neighborhood und q-gram-Blocking werden auch neuere, ähnlichkeitssensitive und dynamische Indexierungsansätze beschrieben (Papadakis et al., 2019; Ramadan et al., 2013).

Vergleich und Bewertung (Record Pair Comparison). Ziel ist die Quantifizierung der Ähnlichkeit zwischen der extrahierten Referenz und jedem generierten Kandidaten (Christen, 2012). Typische String-Ähnlichkeitsmaße sind Jaro-Winkler und Edit-Distance; aus den Einzelwerten wird ein Gesamtscore gebildet, der die Entscheidungsfindung unterstützt (Christen, 2012). Etablierte Verfahren kombinieren bewährte Metriken mit probabilistischen Modellen (Binette &amp; Steorts, 2022; Christen, 2012).

Klassifikation und Verifikation (Entscheidung). Ziel ist das Treffen einer Verifikationsentscheidung (Christen, 2012). Praktisch erfolgt dies durch Anwendung eines Schwellwerts auf den Gesamt-Ähnlichkeits-Score: Werte oberhalb des Schwellwerts werden als 'verifiziert' klassifiziert, darunter als 'nicht verifiziert'; bei gradueller Bewertung kann zusätzlich ein Konfidenzwert ausgegeben werden (Christen, 2012). Mit Blick auf domänenspezifische Risiken weist Glynn (2025) darauf hin, dass KISysteme nicht existierende Quellen halluzinieren, weshalb eine Verifikationspipeline auch Non-Matches zuverlässig erkennen muss.

Dieses adaptierte ER-Modell bildet den theoretischen Bezugsrahmen für diese Arbeit. Es erlaubt die systematische Analyse, welcher konkrete algorithmische Ansatz für welche Phase des Gesamtproblems am besten geeignet ist.

## 2.2.3 Ableitung wissenschaftlicher Bewertungskriterien

Aus dem zuvor entwickelten generischen Prozessmodell der Referenzverifikation lassen sich wissenschaftlich etablierte Bewertungskriterien ableiten, die in der Literatur zur Evaluation von ER-Systemen verwendet werden. Diese Kriterien dienen als objektive Maßstäbe für die Analyse des Stands der Technik (Abschnitt 2.3) und bilden die Grundlage für die spätere Evaluation des eigenen Systems in Kapitel 7.

Die Bewertung der Extraktionsgenauigkeit in Phase 1 erfolgt durch Field-LevelMetriken nach Tkaczyk et al. (2018). Hierzu zählen die Field-Level Accuracy als Anteil korrekt extrahierter Felder an allen zu extrahierenden Feldern sowie der Field-Level F1-Score als harmonisches Mittel aus Precision und Recall auf Feldebene.

Für die Bewertung der Verifikationsleistung in den Phasen 3-4 werden mehrstufige Bewertungssysteme verwendet (Christen, 2012; Papadakis et al., 2019). Grundlage bildet der Ähnlichkeits-Score , ein gewichteter Gesamtscore, der aus konfigurierbaren Feldvergleichen berechnet wird. Auf Basis dieses Scores erfolgt die mehrstufige Klassifikation in die Kategorien Exact Match, Possible Match und No Match, gesteuert durch konfigurierbare Schwellenwerte. Die Qualität der Verifikationsentscheidung wird durch zwei etablierte Metriken gemessen: die Precision (Anteil korrekt verifizierter Referenzen an allen als verifiziert klassifizierten (Binette &amp; Steorts, 2022)) und die Vollständigkeit (Recall) (Anteil korrekt erkannter echter Referenzen an allen tatsächlich vorhandenen (Christen, 2012)).

Zur Bewertung der Praxistauglichkeit werden Performance-Kennzahlen erhoben (Gazzarri, 2021). Diese umfassen die Verarbeitungszeit pro Referenz als durchschnittliche Dauer der Gesamtverifikation, den Durchsatz als Anzahl verifizierter Referenzen pro Zeiteinheit sowie die Latenz der einzelnen Systemkomponenten.

Im spezifischen Kontext der Referenzverifikation und KI-Halluzinationen kommen weitere domänenspezifische Kriterien hinzu. Hierzu zählen die Robustheit bei unvollständigen oder fehlerhaften Eingabedaten (Binette &amp; Steorts, 2022), die Erkennung von Non-Matches als zuverlässige Identifikation nicht-existierender Referenzen, sowie die Abdeckung als Fähigkeit, verschiedene Publikationstypen und Zitierstile zu verarbeiten (Anzaroot &amp; Mccallum, 2013).

Diese Metriken bilden ein umfassendes Bewertungsraster, das sowohl die technische Leistungsfähigkeit als auch die praktische Tauglichkeit von Referenzverifikationssystemen erfassen kann. Sie werden in Abschnitt 2.3 zur systematischen Analyse bestehender Lösungen und in Kapitel 7 zur Evaluation des eigenen Systems verwendet.

## 2.3 Stand der Technik: Methoden und Systeme zur Referenzverifikation

Das im vorherigen Abschnitt entwickelte Prozessmodell und die daraus abgeleiteten wissenschaftlichen Bewertungskriterien bilden den theoretischen Bezugsrahmen für diese Arbeit. Vor der Entwicklung einer eigenen Lösung ist es jedoch unerlässlich, den aktuellen Stand der Technik zu analysieren. Dieses Kapitel hat das Ziel, bestehende Ansätze und Werkzeuge zur Referenzverifikation systematisch zu erfassen, zu kategorisieren und vor dem Hintergrund der definierten Bewertungskriterien zu analysieren.

Die Analyse folgt dabei der Logik der generischen Verifikationspipeline aus Abschnitt 2.2.2. Zunächst werden in Abschnitt 2.3.1 Techniken zur Extraktion und Normalisierung von Referenzmetadaten untersucht, also die kritische erste Phase, die die Qualität aller folgenden Schritte maßgeblich beeinflusst. Anschließend widmet sich Abschnitt 2.3.3 den Strategien für das Matching und die Auflösung der extrahierten Metadaten gegen autoritative Quellen. Hier liegt der Fokus auf der Effektivität der Kandidatengenerierung und den verwendeten Ähnlichkeitsmetriken. Den Abschluss der Analyse bildet Abschnitt 2.3.4, in dem Kriterien und Metriken zur Bewertung der Performanz von Verifikationssystemen zusammengefasst werden. Diese Bewertung erfolgt explizit entlang der in Abschnitt 2.2.3 definierten wissenschaftlichen Kriterien (Precision, Recall, Robustness etc.) und zeigt damit auch auf, inwiefern bestehende Lösungen die spezifischen Herausforderungen durch KI-generierte, halluzinierte Referenzen bereits adressieren.

Durch diese strukturierte Analyse wird eine fundierte Grundlage geschaffen, um in Kapitel 5 eine eigene Lösung zu konzipieren, die die Stärken des Stands der Technik aufgreift und identifizierte Lücken schließt.

## 2.3.1 Extraktion und Normalisierung

Die Phase der Extraktion und Normalisierung bildet das Fundament der Verifikationspipeline. Ihr Ziel ist die Transformation unstrukturierter Referenztexte in sauber strukturierte und standardisierte Metadaten, die einen robusten Abgleich in den folgenden Phasen ermöglichen. Die Qualität dieses Schrittes ist kritisch, da sich Fehler hier kaskadierend auf den gesamten Verifikationsprozess auswirken.

Die Herausforderung: Heterogenität bibliografischer Daten. Die automatische Verarbeitung bibliografischer Referenzen wird durch eine mehrdimensionale Heterogenität erschwert, die sich in verschiedenen Aspekten manifestiert. Grundlegend ist die Existenz tausender unterschiedlicher Zitierstile wie American Psychological Association (APA), Modern Language Association (MLA), Chicago und Institute of Electrical and Electronics Engineers (IEEE), die jeweils spezifische Formatierungskonventionen vorschreiben (Grennan &amp; Beel, 2019). Diese stilistische Vielfalt wird durch zusätzliche Formatierungsvarianten in Interpunktion, Groß-/Kleinschreibung, Abkürzungen und der Reihenfolge der Felder weiter verkompliziert (Grennan &amp; Beel, 2019).

Weitere Komplexität ergibt sich aus den unterschiedlichen Quellenarten wie Zeitschriftenartikeln, Konferenzbeiträgen, Büchern, Preprints und Online-Quellen, die jeweils spezifische Parsing-Herausforderungen aufweisen (Grennan &amp; Beel, 2019). Die Datenqualität wird zudem durch verschiedene Fehlerquellen beeinträchtigt, darunter Optical Character Recognition (OCR)-Fehler bei gescannten PDFs, Tippfehler oder bewusste Vereinfachungen, die die Robustheit der Extraktionsalgorithmen auf die Probe stellen (Grennan &amp; Beel, 2019).

Etablierte Lösungsansätze und Werkzeuge. Zur Bewältigung der Herausforderungen bei der Extraktion und Normalisierung von Referenzmetadaten haben sich in Forschung und Praxis zwei grundsätzliche Ansätze etabliert: regelbasierte Parser und ML-/KI-basierte Parser .

Regelbasierte Parser nutzen manuell definierte Grammatiken und Muster, um die Bestandteile einer Referenz zu identifizieren (Zhang et al., 2011). Dieser Ansatz zeichnet sich durch hohe Präzision aus und ist besonders geeignet, wenn die zu verarbeitenden Zitierstile vorab bekannt und die Daten rauscharm sind (Tkaczyk et al., 2018). Allerdings weisen regelbasierte Systeme eine begrenzte Robustheit bei unbekannten oder variierenden Stilen auf und erfordern einen hohen Pflegeaufwand, da sie nur bei im Voraus bekannten Stilen zuverlässig arbeiten und kontinuierliche Anpassungen benötigen (Tkaczyk et al., 2018). Zu den etablierten Werkzeugen dieser Kategorie zählen Citation, Citation-Parser, Biblio und PDFSSA4MET, die auf regulären Ausdrücken und heuristischen Regeln basieren (Tkaczyk et al., 2018).

Im Gegensatz dazu setzen ML-/KI-basierte Parser auf statistische Modelle (z. B. Conditional Random Fields (CRF)) oder Deep-Learning-Architekturen (z. B. Bidirectional Long Short-Term Memory (BiLSTM)-CRF), die auf Datensätzen mit manuell gekennzeichneten Bestandteilen bibliografischer Einträge trainiert werden (Grennan &amp; Beel, 2019; Tkaczyk et al., 2018). Diese Ansätze bieten eine hohe Robustheit und Generalisierungsfähigkeit gegenüber unterschiedlichen Zitierstilen und können durch Nachtrainieren oder Fine-Tuning an neue Stile angepasst werden (Grennan &amp; Beel, 2019; Tkaczyk et al., 2018). Als Nachteile sind der Bedarf an großen, möglichst diversen Trainingsdaten zu nennen, wobei vorhandene Datensätze oft klein und domänenspezifisch sind, was die Generalisierbarkeit begrenzt (Grennan &amp; Beel, 2019; Tkaczyk et al., 2018). Zu den prominenten Vertretern dieser Kategorie zählen GROBID, AnyStyle, ParsCit und CERMINE als CRF-basierte Parser mit hoher Extraktionsgenauigkeit (Grennan &amp; Beel, 2019; Tkaczyk et al., 2018).

Der Normalisierungsschritt. Nach der Extraktion folgt die Normalisierung der Rohdaten, um sie für den Abgleich vergleichbar zu machen. Dieser Prozess umfasst typischerweise mehrere Schritte: Zunächst erfolgt eine Bereinigung durch Entfernung unerwünschter Sonderzeichen, redundanter Interpunktion und überflüssiger Leerzeichen zur Vereinheitlichung des Texteingangs (Grennan &amp; Beel, 2019; Tkaczyk et al., 2018). Anschließend wird eine Case Normalization durchgeführt, bei der die Groß- und Kleinschreibung vereinheitlicht wird, in der Regel durch Umwandlung in Kleinbuchstaben, um Varianten desselben Tokens zu vermeiden (Grennan &amp; Beel, 2019; Tkaczyk et al., 2018).

Weiterhin umfasst die Normalisierung eine Abkürzungsstandardisierung , bei der gängige Stilabkürzungen (z. B. für Volume oder Seiten) vereinheitlicht werden, soweit Domänenlisten vorliegen (Grennan &amp; Beel, 2019; Tkaczyk et al., 2018). Abschließend erfolgt eine Personennamen-Normalisierung , die die Vereinheitlichung von Namensformaten (z. B. von 'Vorname Nachname' zu 'Nachname, Vorname') und die konsistente Behandlung von Initialen umfasst, um feldweise Vergleiche zu ermöglichen (Grennan &amp; Beel, 2019; Tkaczyk et al., 2018).

Leistungsfähigkeit und Grenzen. Vergleichende Studien zeigen, dass ML-basierte Parser wie GROBID und CERMINE in Gesamtauswertungen (F1) out-of-the-box bis 0 , 89 bzw. 0 , 83 erreichen und nach Retraining auf aufgabenspezifischen Daten jeweils F1 von 0 , 92 erzielen (Grennan &amp; Beel, 2019; Tkaczyk et al., 2018). Auf Feldebene werden für einzelne Metadatentypen sehr hohe Werte (teils über 0 , 95) berichtet. Zudem liegt für GROBID eine berichtete field-level accuracy von 95 , 7% vor (Grennan &amp; Beel, 2019; Tkaczyk et al., 2018).

Allerdings variieren die Ergebnisse deutlich nach Zitierstil, Datengüte und Vorverarbeitung. Insbesondere ist der Recall -Vorteil ML-basierter Ansätze gegenüber regelbasierten Systemen ausgeprägt und lässt sich durch Nachtraining weiter erhöhen (Grennan &amp; Beel, 2019; Tkaczyk et al., 2018).

## 2.3.2 CSL-Ökosystem: Datenformat, Stile und Prozessoren

Für die standardisierte Repräsentation und Ausgabe bibliografischer Daten eignet sich das Citation Style Language (CSL) -Ökosystem. Das CSL-Format definiert ein offenes, XML-basiertes Regelwerk zur Formatierung von Zitaten und Bibliografien und stellt eine große, kuratierte Stilsammlung bereit (Citation Style Language, 2025a, 2025b; Zotero, 2025). Zentral ist dabei CSL-JavaScript Object Notation (JSON) als maschinenlesbares Austauschformat für Quellenangaben, das von Prozessoren direkt verarbeitet werden kann (Bennett, 2025; Citation Style Language, 2025c).

Mit citeproc-js liegt ein in JavaScript implementierter CSL-Prozessor vor, der CSL-Stile auf bibliografische Daten (z. B. im CSL-JSON-Format) anwendet und formatierte Zitate sowie Bibliografien erzeugt (Bennett, 2025). Citation.js ergänzt dieses Ökosystem um modulare Konvertierungs- und Formatierungsfunktionen: Es wandelt vielfältige Eingabeformate und Identifier (z. B. BibTeX, DOI, Wikidata) nach CSL-JSON und kann über ein CSL-Plugin Stile wie APA oder Vancouver ausgeben (Citation.js, 2025a, 2025b; Willighagen, 2019). Diese Komponenten eignen sich für die konsistente Darstellung verifizierter Referenzen und als standardisiertes Datenformat in Pipeline-Architekturen.

Gleichzeitig ist zu betonen, dass CSL , citeproc-js und Citation.js keine Verifikationsmechanismen bereitstellen (Bennett, 2025; Citation Style Language, 2025a, 2025b; Willighagen, 2019). Sie lösen weder das Matching gegen autoritative Metadatenquellen noch die Entscheidung zwischen Match und Non-Match. Innerhalb der Verifikationspipeline adressieren diese Komponenten die Schichten 'Datenrepräsentation' und 'Ausgabeformatierung', nicht jedoch die verifikationsrelevanten Schritte 'Kandidatengenerierung', 'feldweise Ähnlichkeitsbewertung' und 'Klassifikation' (Christen, 2012; Papadakis et al., 2019).

Die hierfür erforderliche Normalisierung der Eingabedaten ist nicht Bestandteil des CSL-Stacks, sondern Teil der Vorverarbeitung in 'Phase 1: Extraktion und Normalisierung'. Sie stellt die Vergleichbarkeit der extrahierten Felder für die nachfolgenden Schritte der feldweisen Ähnlichkeitsbewertung und der Klassifikation her und wird in Abschnitt 2.3.1 detailliert beschrieben. Damit ist sie klar von der reinen Ausgabeformatierung mittels CSL zu trennen.

Aufbauend auf den strukturierten und normalisierten Metadaten aus der Vorverarbeitung folgt in Abschnitt 2.3.3 die Matching- und Auflösungsphase, die die extrahierte Referenz mit der korrekten Entität in autoritativen Metadatenbanken verknüpft (Papadakis et al., 2019).

## 2.3.3 Matching und Auflösung gegen Metadatenquellen

Aufbauend auf den strukturierten und normalisierten Metadaten aus der vorherigen Phase hat die Matching- und Auflösungsphase das Ziel, die extrahierte Referenz mit der korrekten Entität in einer autoritativen Metadatenbank zu verknüpfen (Papadakis et al., 2019). Dieser Prozess unterteilt sich in zwei konzeptionelle Schritte: die effiziente Generierung von Kandidaten und deren anschließende feinkörnige Bewertung.

Kandidatengenerierung durch Blocking-Strategien. Um den Suchraum der oft millionengroßen Metadatenquellen effizient einzuschränken, werden BlockingStrategien eingesetzt. Sie selektieren nur solche Paare, die mit hoher Wahrscheinlichkeit übereinstimmen und vermeiden damit die ansonsten quadratische Anzahl an Paarvergleichen. Ziel ist eine kleine, aber möglichst vollständige Kandidatenmenge als Grundlage des nachfolgenden Matchings (Papadakis et al., 2019).

Standard-Blocking. Beim Standard-Blocking erfolgt die Gruppierung von Datensätzen über einen exakten Blocking Key, der aus ausgewählten Attributen abgeleitet wird, zum Beispiel das Präfix der ersten drei Titelzeichen. Datensätze mit identischem Key landen im selben Block (Papadakis et al., 2019).

Sliding-Window (Sorted Neighborhood). Diese Strategie sortiert Datensätze nach einem Schlüssel und bewegt ein gleitendes Fenster fester Größe über die sortierte Liste. Durch überlappende Fenster werden benachbarte Einträge in verschiedenen Positionen gemeinsam betrachtet, um potenzielle Übereinstimmungen nahe an Blockgrenzen nicht zu übersehen (Marchant, 2021; Papadakis et al., 2019).

Canopy Clustering. Beim Canopy Clustering werden überlappende Vorgruppen mit einer günstigen, approximativen Ähnlichkeitsfunktion (z. B. Jaccard-Index oder Kosinusähnlichkeit auf TF-IDF-Vektoren) mittels zweier Schwellenwerte gebildet. Dies dient der groben Kandidatenselektion vor genauerem Matching (Marchant, 2021; Papadakis et al., 2019).

Die Effektivität und Effizienz einer Blocking-Strategie werden üblicherweise über Pair Completeness (PC) (Recall-Analogon) und Reduction Ratio bewertet, die in einem Zielkonflikt stehen: Höhere PC geht meist mit geringerer Reduktion der Vergleiche einher und umgekehrt (Papadakis et al., 2019).

Ähnlichkeitsberechnung und feinkörniges Matching. Für die Kandidaten aus der Blocking-Phase werden feldweise Ähnlichkeiten berechnet und anschließend zu einem Gesamt-Score über mehrere Attribute aggregiert, auf dessen Basis die Match-Entscheidung erfolgt (Marchant, 2021; Papadakis et al., 2019).

Die Berechnung erfolgt dabei feldtypenspezifisch: Für String-Felder wie Titel und Venue werden token-basierte Metriken eingesetzt. Dazu zählen Jaccard-Ähnlichkeit sowie Kosinusähnlichkeit auf TF-IDF-Vektoren zur Erfassung semantisch ähnlicher Begriffe (Bilenko et al., 2003; Papadakis et al., 2019). Ergänzt wird dieses Repertoire durch string-basierte Metriken wie die Levenshtein-Distanz (Edit Distance) und Jaro-Winkler-Ähnlichkeit. Eine erweiterte Variante der Levenshtein-Distanz ist die Levenshtein-Damerau-Distanz, die neben Einfügungen, Löschungen und Ersetzungen auch die Vertauschung zweier benachbarter Zeichen (Transposition) als zulässige Operation mitzählt. Dies macht sie besonders effektiv für die Korrektur von Tippfehlern, da diese zu über 80 Prozent auf genau einer dieser vier Operationen beruhen (Koller &amp; Damerau, 1964). Die Jaro-Winkler-Ähnlichkeit erweist sich dabei als besonders geeignet für kurze Strings wie Personennamen (Bilenko et al., 2003; Papadakis et al., 2019). Für numerische Felder (z. B. Jahr) wird ein exakter Vergleich oder eine schwellenbasierte Nähe (Toleranzfenster) angewendet (Marchant, 2021; Papadakis et al., 2019). Bei Listen wie Autoren erfolgt die Ähnlichkeitsberechnung über die gesamte Liste durch Aggregation paarweiser Namensähnlichkeiten (z. B. Monge-Elkan oder optimale Zuordnung) bzw. durch einfache Überlappung der Einträge (Marchant, 2021; Ventura et al., 2013).

Die Aggregation der feldweisen Scores zu einem Gesamtscore kann regelbasiert als gewichtete Summe von Attribut-(Dis)Agreements erfolgen (Fellegi-Sunter, Expectation Maximization (EM)) oder über ein trainiertes Modell, das auf einem Feature-Vektor aus feldweisen Ähnlichkeiten eine Match-Entscheidung lernt (z. B. Support Vector Machines (SVM) oder logistische Regression) (Bilenko et al., 2003; Marchant, 2021; Ventura et al., 2013).

Genutzte Metadatenquellen und deren Charakteristika. Die Wahl der Metadatenquelle hat erheblichen Einfluss auf Abdeckung und Qualität der Verifikation. Im Folgenden werden die wichtigsten Quellen und ihre charakteristischen Eigenschaften vorgestellt.

Crossref und DataCite fungieren als DOI-Registrierungsagenturen und stellen standardisierte, offen zugängliche Metadaten zu wissenschaftlichen Objekten bereit. Bei Crossref registrieren Mitglieder DOIs und hinterlegen oder aktualisieren die zugehörigen Metadaten, die über die REST-Application Programming Interface (API) abrufbar sind (Crossref, 2025a, 2025c; DataCite, 2025a). Dadurch erreicht Crossref eine sehr hohe Abdeckung bei formal publizierten Artikeln in wissenschaftlichen Zeitschriften (Crossref, 2025b). DataCite verwendet ein verbindliches Metadatenschema zur eindeutigen Identifikation und Zitation von Forschungsdaten, Software und weiteren wissenschaftlichen Outputs und stellt diese Metadaten öffentlich über Schnittstellen bereit (DataCite, 2025b; DataCite Metadata Working Group, 2024).

Google Scholar bietet eine sehr breite Abdeckung inklusive Preprints und 'grauer Literatur' wie Abschlussarbeiten und technischen Berichten. Allerdings weist sie Transparenzdefizite auf, insbesondere bei Gesamtabdeckung und Indexierungspraxis. Zudem sind Qualitätsschwankungen dokumentiert, darunter Duplikate, fehlerhafte Zählungen und Manipulierbarkeit (Lopez-Cozar et al., 2012; Martín-Martín &amp; LópezCózar, 2021; Martín-Martín et al., 2021; Sauvayre, 2022).

DBLP (Digital Bibliography &amp; Library Project) fokussiert sich auf die Informatik und zeichnet sich durch hohe Qualität und Konsistenz durch manuell kuratierte Metadaten in diesem Fachgebiet aus (DBLP, 2025a). DBLP erreicht diese Qualität durch einen manuellen Kuratierungsprozess, der Fehlerbereinigung, Vervollständigung der Metadaten und insbesondere die Disambiguierung von Autorennamen umfasst (DBLP, 2025b, 2025c). Zur Reproduzierbarkeit steht ein offener, monatlich versionierter XML-Snapshot mit persistenter URL zur Verfügung, dessen Nutzung DBLP für Zitationen ausdrücklich empfiehlt (DBLP, 2025d). Als zentrale Bibliographie der Informatik deckt DBLP Millionen von Publikationen aus führenden Zeitschriften und Tagungen ab (DBLP, 2025a; Schloss Dagstuhl - Leibniz Center for Informatics, 2025).

Semantic Scholar und OpenAlex sind KI- bzw. ML-gestützte Kataloge, die umfangreiche Kontextinformationen wie Zitationsnetzwerke, Autoren, Institutionen, Venues und Themen bieten (Allen Institute for AI, 2025a; OurResearch, 2025a; Priem et al., 2022). Semantic Scholar bietet KI-Funktionen wie Zusammenfassungen sowie Zugriff auf Paper-, Autoren- und Zitationsdaten via API (Allen Institute for AI, 2025b, 2025c). OpenAlex ist ein frei zugänglicher, offener Wissenschaftsgraph, der Publikationen, Autoren, Quellen, Institutionen und Themengebiete umfasst, wobei Themengebiete automatisiert mithilfe eines ML-/Deep-Learning-Verfahrens vergeben werden (OurResearch, 2025a, 2025b).

Eine robuste Verifikationslösung sollte mehrere Metadatenquellen kombinieren, um Abdeckung und Evidenz zu erhöhen und quellspezifische Lücken oder Fehler zu kompensieren. Dies entspricht gängigen Multi-Source-ER- und Datenintegrationsansätzen wie Schemaabgleich, ER und Data Fusion sowie Verfahren zur Recall-Steigerung wie Multi-Pass-/Meta-Blocking (Marchant, 2021; Papadakis et al., 2019).

Herausforderung: Erkennung von Non-Matches. Eine besondere Herausforderung im Kontext der Referenzverifikation ist die zuverlässige Identifikation von Referenzen, die keiner realen Entität zugeordnet werden können. Neben dem klassischen Linkage auf vorhandene Entitäten muss ein hochkonfidenter Non-Match ausgegeben werden (Christen, 2012). Hierfür haben sich mehrere Ansätze etabliert.

Der Ansatz des strengen Schwellenwerts basiert auf der Anwendung eines (ggf. zweistufigen) globalen Ähnlichkeitsschwellenwerts für die Match-Entscheidung. Referenzen, die diesen definierten Schwellenwert nicht erreichen, werden systematisch als Non-Matches klassifiziert (Christen, 2012).

Eine weitere Methode nutzt das Blocking-Signal, wobei das Fehlen plausibler Kandidaten nach dem Blocking als starkes Non-Match-Indiz dient. Wenn trotz angemessener Blocking-Strategien keine potenziellen Übereinstimmungen identifiziert werden können, deutet dies auf eine nicht-existente Entität hin. Allerdings ist dabei auf mögliche False Negatives bei zu restriktiven Blocking-Kriterien zu achten (Christen, 2012).

Der dritte Ansatz umfasst eine Konsistenz- und Registerprüfung, bei der umfassende Plausibilitäts- und Referenzprüfungen der extrahierten Felder durchgeführt werden. Dabei werden die Metadaten der Referenz gegen autoritative Register validiert, um Inkonsistenzen oder offensichtliche Fehler zu erkennen, die auf eine nicht-existente Entität hindeuten (Christen, 2012).

## 2.3.4 Bewertung der Performanz: Metriken und Qualitätssicherung

Die abschließende Phase der Analyse betrachtet die Bewertung der Gesamtleistung von Referenzverifikationssystemen. Während die vorherigen Abschnitte Metriken für Teilaspekte der Pipeline eingeführt haben, liegt der Fokus hier auf der systemweiten Evaluation und den Methoden zur Qualitätssicherung. Diese Bewertung ist essenziell, um die Zuverlässigkeit von Verifikationssystemen zu vergleichen und ihre Eignung für den wissenschaftlichen Einsatz beurteilen zu können.

Systemweite Evaluierungsmetriken. Die Gesamtleistung eines Verifikationssystems wird üblicherweise anhand überwachter Klassifikationsmetriken wie Precision , Recall und F1-Score auf einem annotierten Testdatensatz bewertet. Diese Metriken sind in der Forschung zu ER und Referenzverifikation etabliert, da sie ein ausgewogenes Maß zwischen Genauigkeit und Vollständigkeit liefern und auch bei unausgeglichenen Klassen aussagekräftig bleiben (Christen, 2012; Grennan &amp; Beel, 2019; Marchant, 2021; Tkaczyk et al., 2018).

Die grundlegende Bewertung erfolgt über eine Konfusionsmatrix, die die Häufigkeit von 'True/False Positives/Negatives' darstellt. Daraus werden die zentralen Kennzahlen abgeleitet (Christen, 2012): Die Precision gibt an, wie zuverlässig das System ist: Sie misst, welcher Anteil der als 'verifiziert' klassifizierten Referenzen tatsächlich echt ist. Ein hoher Precision-Wert bedeutet wenige falsche Bestätigungen.

Der Recall (Vollständigkeit) zeigt, wie vollständig das System arbeitet: Er gibt an, wie viele der tatsächlich echten Referenzen auch tatsächlich gefunden wurden. Ein hoher Recall-Wert bedeutet, dass wenige echte Referenzen übersehen werden.

Der F1-Score als harmonisches Mittel aus Precision und Recall bietet eine ausgewogene Gesamtbewertung, die beide Aspekte gleichermaßen berücksichtigt.

Die Accuracy (Genauigkeit) misst zwar den Gesamterfolg aller Klassifikationen, kann jedoch bei unausgeglichenen Datensätzen, wenn beispielsweise viel mehr echte als unechte Referenzen vorliegen, irreführend sein (Christen, 2012).

Bei unausgeglichenen Klassen sind Precision-Recall-Kurven ein geeignetes Instrument zur Visualisierung und Bewertung der Systemleistung. ROC-Kurven (Receiver Operating Characteristic) können in Data-Matching-Szenarien aufgrund des dominierenden Anteils wahrer Negativfälle (also der sehr vielen korrekt als nicht zugehörig erkannten Entitäten) zu optimistisch ausfallen und sollten daher vorsichtig interpretiert werden (Christen, 2012).

Neben Qualitätsmetriken sind Effizienzkennzahlen wie Laufzeit und Durchsatz zentrale Indikatoren für die praktische Anwendbarkeit. Christen (2012) unterscheidet hierfür zwischen plattformabhängigen Messungen (z. B. Laufzeit) und plattformunabhängigen Komplexitätsmaßen (z. B. Anzahl der Kandidatenpaare).

Herausforderungen bei der Evaluation. Die aussagekräftige Evaluation von Verifikationssystemen ist mit mehreren spezifischen Herausforderungen verbunden. Erstens existiert derzeit kein standardisierter Benchmark für die Bewertung von Referenz-Halluzinationen. Die verfügbaren Studien sind domänenspezifisch und heterogen. Neue Arbeiten schlagen erst eigene Frameworks und Benchmarks vor (Maharjan, 2024; Tang et al., 2025; Wu et al., 2025).

Zweitens erschweren Datenschutz und Lizenzierung die Nutzung realer wissenschaftlicher Literatur in Evaluationen, da urheberrechtliche und lizenzrechtliche Beschränkungen die Datensatzbereitstellung und Replikation behindern (FernándezMolina &amp; De La Rosa, 2024; Fiil-Flynn et al., 2022). Dies hat zur Folge, dass kein standardisierter Benchmark (Gold Standard) auf Basis realer Daten veröffentlicht werden kann, was vergleichende Evaluationen zwischen verschiedenen Ansätzen erheblich erschwert.

Drittens ist die Repräsentativität der Testdaten eine zentrale Herausforderung, da für generalisierbare Ergebnisse Testsets verschiedene Disziplinen, Zitierstile und Fehlerarten abdecken sollten. Aktuelle Arbeiten sind jedoch meist fachspezifisch und damit nicht umfassend repräsentativ (Agrawal et al., 2023; Aljamaan et al., 2024; Tang et al., 2025).

Viertens beeinflusst die Dynamik der Metadatenquellen die Reproduzierbarkeit, da Quellen wie Crossref und OpenAlex kontinuierlich aktualisiert werden und identische Anfragen zu unterschiedlichen Zeitpunkten abweichende Ergebnisse liefern können (Crossref, 2021; OpenAlex, 2024a, 2024b, 2025).

Ansätze zur Qualitätssicherung. Um trotz dieser Herausforderungen belastbare Ergebnisse zu erhalten, kommen in Forschung und Praxis mehrere etablierte Ansätze zum Einsatz. Die manuelle Annotation bildet die Grundlage für belastbare Evaluationen durch manuell geprüfte Gold-Standard-Datensätze, in denen wahre Matches/No Matches vorliegen (Christen, 2012).

Die Verwendung synthetischer Daten ermöglicht den Aufbau künstlich erzeugter Testdatensätze, in denen realistische Fehlerarten (z. B. Tipp-, OCR- oder phonetische Fehler) gezielt simuliert werden, um die Robustheit und Fehlertoleranz der Verifikationspipeline systematisch zu prüfen (Christen, 2012).

Schließlich gewährleisten unabhängige und stratifizierte Testsets eine zuverlässige Evaluation. Hierfür werden methodisch ausgewogene Stichproben durch stratifiziertes Sampling erzeugt. Diese berücksichtigen die inhaltliche Vielfalt von Zitierstilen und Publikationstypen und stellen sicher, dass auch homogene Datensätze die Breite realer Referenzformen angemessen abbilden (Christen, 2012; Grennan &amp; Beel, 2019).

Fazit für die eigene Arbeit. Für die Entwicklung und Evaluation der in dieser Arbeit konzipierten Lösung bedeutet die Analyse des Stands der Technik, dass vor dem Hintergrund der spezifischen Gefahr durch KI-Halluzinationen die Metriken Precision und Recall im Vordergrund stehen, wobei einer hohen Precision Priorität eingeräumt wird, um falsch-positive Verifikationen nicht-existenter Quellen zu minimieren. Da kein standardisierter Benchmark für KI-halluzinierte Referenzen existiert, muss ein eigener, möglichst repräsentativer Testdatensatz mit manuell verifizierten und synthetisch halluzinierten Referenzen erstellt werden. Um die geforderte Praxistauglichkeit zu gewährleisten, muss zudem die Performance (Latenz) als nicht-funktionales Kriterium mitbewertet werden.

Die im Stand der Technik identifizierten Metriken und Herausforderungen bilden somit den Maßstab für die empirische Evaluation im späteren Verlauf dieser Arbeit.

## 2.4 Zusammenfassung

Dieses Kapitel legte das theoretische und technische Fundament für die Entwicklung der Browser-Erweiterung zur Referenzverifikation. Zunächst wurde in Abschnitt 2.1 die spezifische Bedrohung der wissenschaftlichen Integrität durch KI-generierte, halluzinierte Quellenangaben präzisiert. Diese stellt ein systematisches Risiko für Nachvollziehbarkeit und Reproduzierbarkeit dar und begründet den dringenden Bedarf an automatisierten Prüfverfahren.

Darauf aufbauend wurde in Abschnitt 2.2 die Referenzverifikation als ein spezifischer Anwendungsfall des ER Paradigmas modelliert. Das daraus abgeleitete generische Vier-Phasen-Modell, bestehend aus Extraktion und Normalisierung, Kandidatensuche, Vergleich und Bewertung sowie Klassifikation und Verifikation, strukturiert den Verifikationsprozess und bietet einen theoretisch fundierten Bezugsrahmen. Aus diesem Modell wurden zudem wissenschaftlich etablierte Bewertungskriterien wie Precision, Recall, F1-Score und Performance-Kennzahlen abgeleitet, die für die spätere Evaluation maßgeblich sind.

Abschließend analysierte Abschnitt 2.3 den Stand der Technik entlang dieser Prozesskette. Es wurden etablierte Methoden und Werkzeuge für die Extraktion und Normalisierung untersucht, beispielsweise regelbasierte und ML-basierte Parser wie AnyStyle und GROBID. Darüber hinaus wurden Ansätze für das Matching gegen autoritative Metadatenquellen analysiert, was Blocking-Strategien und Ähnlichkeitsmetriken einschließt. Abschließend widmete sich die Analyse der Bewertung der Systemperformanz. Die Analyse zeigt, dass bestehende Lösungen die spezifische Herausforderung der zuverlässigen Erkennung von Non-Matches, also halluzinierten Quellen, nur unzureichend adressieren. Diese Lücke begründet den konzeptionellen und technischen Ansatz der vorliegenden Arbeit.

Zusammenfassend schafft dieses Kapitel die notwendige theoretische und methodische Basis, um im Folgenden eine nutzerzentrierte, empirisch fundierte und technisch robuste Lösung zu konzipieren, die die identifizierten Limitationen des Stands der Technik überwindet.

## 3 Methodik

Dieses Kapitel erläutert die Methodik der Arbeit. Das zugrundeliegende Forschungsdesign verbindet dabei mehrere Ansätze: eine theoretische Fundierung, die Erhebung empirischer Anforderungen, eine gestaltungsorientierte Entwicklung sowie eine quantitative Evaluation. Die Methodik orientiert sich an den Prinzipien der Methoden-Triangulation , um die Forschungsfragen aus unterschiedlichen Perspektiven zu untersuchen.

## 3.1 Integratives Forschungsdesign

Die Arbeit folgt einem gestaltungsorientierten Forschungsansatz nach den Prinzipien des DSR (Hevner et al., 2004; Peffers et al., 2007). Der DSR-Ansatz adressiert Forschung durch den Entwurf und die Evaluation von Artefakten , die zur Lösung relevanter Probleme beitragen (Hevner et al., 2004). Der Forschungsprozess folgt dem DSR-Methodology-Modell mit den Phasen Problemidentifikation, Zieldefinition, Entwurf und Entwicklung, Demonstration, Evaluation und Kommunikation (Peffers et al., 2007). Dieser Ansatz ist geeignet, da er die Entwicklung innovativer IT-Artefakte mit wissenschaftlicher Strenge und praktischer Relevanz verbindet.

Das Forschungsdesign integriert quantitative und qualitative Verfahren im Sinne eines Mixed-Methods-Ansatzes . Mixed-Methods-Designs zeichnen sich durch die intentionale Integration quantitativer und qualitativer Daten aus, um ein umfassenderes Verständnis komplexer Forschungsgegenstände zu erzielen (Creswell &amp; Clark, 2017). Die Kombination unterschiedlicher methodischer Zugänge folgt dem Prinzip der Triangulation , die auf Konvergenz und Ergänzung verschiedener Perspektiven abzielt (Creswell &amp; Clark, 2017). Durch diese Integration wird die Forschungsfrage sowohl empirisch fundiert als auch gestaltungsorientiert beantwortet, wodurch die wissenschaftliche Validität und die praktische Relevanz der Ergebnisse erhöht werden.

Der Forschungsprozess folgt dem etablierten DSR-Ansatz. Er beginnt mit der Problemidentifikation und -motivation durch die theoretische Fundierung des Problems KI-halluzinierter Quellenangaben in Kapitel 2. Aufbauend darauf erfolgt die Anforderungsanalyse mittels einer empirischen Online-Umfrage, deren Ergebnisse in Kapitel 4 vorgestellt werden. Darauf aufbauend umfasst die Artefakt-Entwicklung die konzeptionelle und technische Realisierung der Browser-Erweiterung in Kapitel 5 und 6. Die experimentelle Evaluation in Kapitel 7 überprüft das entwickelte Artefakt anschließend anhand definierter Gütekriterien. Den Abschluss des Prozesses bildet die Kommunikation der Ergebnisse durch kritische Reflexion und Diskussion in Kapitel 8.

Dieses Forschungsdesign gewährleistet eine systematische, methodisch fundierte und nachvollziehbare Bearbeitung der Forschungsfragen.

## 3.2 Operationalisierung der Forschungsfragen

Die methodische Herangehensweise baut auf einer theoretischen Fundierung durch Literaturanalyse und der Einordnung des Problems als ER-Paradigma in Kapitel 2 auf. Die Beantwortung der drei Forschungsfragen erfolgte durch einen integrativen Methodenmix, bei dem jeder Forschungsfrage ein spezifischer methodischer Ansatz zugeordnet wurde.

Gestaltungsorientierte Entwicklung zur Systemkonzeption. Die erste Forschungsfrage nach der Konzeption eines reproduzierbaren und nachvollziehbaren Verifikationssystems wurde durch einen gestaltungsorientierten Entwicklungsprozess nach den Prinzipien des DSR beantwortet. Dieser iterativ-inkrementelle Prozess begann mit der Ableitung konkreter Anforderungen aus den empirischen Befunden der Vorstudie (Kapitel 4). Darauf aufbauend wurde eine modulare Client-Server-Architektur entworfen, die das in Abschnitt 2.2 beschriebene Verifikationsmodell implementiert. Die technische Umsetzung erfolgte mit einem modernen Web-Technologie-Stack auf Basis von TypeScript und Node.js . Die detaillierte Konzeption und Implementierung werden in Kapitel 5 und 6 beschrieben.

Empirische Anforderungserhebung für nutzerzentrierte Gestaltung. Zur Beantwortung der zweiten Forschungsfrage nach nutzerzentrierten Anforderungen und Hebeln für Effizienz und Qualität wurde eine standardisierte Online-Befragung unter Personen mit Tätigkeitsschwerpunkt in Forschung und Lehre im deutschsprachigen Hochschulkontext durchgeführt. Die konkrete methodische Umsetzung inklusive Stichprobenrekrutierung, Instrumentenentwicklung und Auswertungsverfahren wird ausführlich in Abschnitt 4.1 beschrieben. Die Befragung unter N=425 Teilnehmenden kombinierte quantitative und qualitative Auswertungsverfahren nach den Prinzipien der Methoden-Triangulation, um ein umfassendes Bild der Praxisanforderungen zu gewinnen.

Experimentelle Evaluation der Systemleistung. Die dritte Forschungsfrage nach der Genauigkeit, Robustheit und Effizienz des Tools wurde durch eine kontrollierte experimentelle Evaluation beantwortet. Diese folgte einem quantitativen, experimentellen Ansatz mit drei kuratierten Testdatensätzen, die unterschiedliche Anwendungsszenarien abdecken. Zur Bewertung kamen etablierte Metriken aus der ER-Forschung (Christen, 2012; Papadakis et al., 2019) zum Einsatz, darunter der Ähnlichkeits-Score, mehrstufige Klassifikation (Exact Match, Strong Match, Possible Match, No Match) sowie Precision, Recall und F1-Score für binäre Verifikationsentscheidungen. Die Systemperformance wurde durch Durchsatz (Referenzen pro Minute) und Latenz (durchschnittliche Verarbeitungszeit pro Referenz) gemessen. Der detaillierte Versuchsaufbau wird in Abschnitt 7.2 beschrieben.

Wissenschaftliche Gütesicherung. Zur Gewährleistung der wissenschaftlichen Qualität wurden etablierte Gütekriterien durch mehrere Maßnahmen adressiert: Die interne Validität wurde durch kontrollierte Evaluationsbedingungen und standardisierte Erhebungsinstrumente gestärkt. Für die externe Validität sorgte eine repräsentative Stichprobe in der Vorstudie sowie diverse Testdatensätze. Die Konstruktvalidität wurde durch theoretisch fundierte Metriken und methodische Triangulation gewährleistet. Die Reliabilität schließlich wurde durch reproduzierbare Experimente mit konsistenter Dokumentation sichergestellt.

## 4 Vorstudie: Umfrage zur Referenzverifikation

Dieses Kapitel berichtet von einer Online-Umfrage zur Praxis der Referenzverifikation und zum Einsatz von KI-Werkzeugen in Forschung und Lehre. Das übergeordnete Ziel ist es, systematisch Anforderungen und Problemfelder zu erfassen und daraus belastbare Gestaltungskriterien für das in Kapitel 5 vorgestellte Tool abzuleiten.

Konkret untersucht die Umfrage fünf zentrale Aspekte: Erstens die demografischen und fachlichen Merkmale der Teilnehmenden, um die Übertragbarkeit der Ergebnisse einschätzen zu können. Zweitens steht die Nutzung und Wahrnehmung von KI-Tools in Literaturrecherche und Schreibprozess im Fokus, einschließlich erster Erfahrungen mit halluzinierten Quellenangaben. Drittens wird die bisherige Praxis der Referenzverifikation beleuchtet, also die eingesetzten Methoden, der zeitliche Aufwand, typische Probleme und die betroffenen Arbeitsschritte. Viertens werden konkrete Anforderungen an Tools zur Referenzverifikation erhoben, durch die Bewertung einzelner Funktionen auf Likert-Skalen, priorisierte Nutzenpotenziale und offene Wünsche. Fünftens und letztens widmet sich die Erhebung den wahrgenommenen Risiken des KI-Einsatzes in der Literaturrecherche auf Inhalts- und Prozessebene, wie beispielsweise Halluzinationen, Qualitätsrisiken oder die Entstehung neuer Abhängigkeiten.

Das Kapitel stellt zunächst in Abschnitt 4.1 die methodische Vorgehensweise vor, präsentiert darauf aufbauend in Abschnitt 4.2 die empirischen Befunde und diskutiert diese in Abschnitt 4.3 im Kontext der Forschungsfrage. Den Abschluss bildet Abschnitt 4.4, welcher die Implikationen bündelt und zur folgenden ToolKonzeption überleitet.

## 4.1 Methodik

Dieser Abschnitt beschreibt Stichprobe und Rekrutierung, das Fragebogendesign sowie das Auswertungsverfahren der Online-Befragung. Ziel ist es, die Nachvollziehbarkeit der Datenerhebung und -analyse sicherzustellen und die Grundlage für die Ergebnisdarstellung in Abschnitt 4.2 zu legen.

Stichprobe und Rekrutierung. Die Online-Befragung wurde über einen Zeitraum von rund drei Wochen durchgeführt. Zielgruppe waren alle Personen, die im deutschsprachigen Hochschul- und Forschungskontext arbeiten oder studieren. Die Rekrutierung erfolgte in einem mehrstufigen Verfahren. Zunächst wurden 352 Dekanate an 35 deutschen Universitäten und Hochschulen per E-Mail kontaktiert. Eine vollständige Übersicht der kontaktierten Universitäten sowie deren Rückmeldestatus befindet sich auf der beiliegenden CD. Zusätzlich wurde der Befragungslink über private Netzwerke an Studierende weitergegeben, um eine breitere Streuung zu erreichen.

Von insgesamt 514 geöffneten Fragebögen wurden 425 vollständig ausgefüllt (82 , 7 % Abschlussquote). Unvollständige Datensätze ( n = 89) wurden ausgeschlossen. Die Rohdaten aller 514 Antworten sind auf der beiliegenden CD enthalten.

Fragebogendesign. Der Fragebogen wurde in LimeSurvey (LimeSurvey GmbH, 2025) erstellt und umfasste 15 Items mit einer durchschnittlichen Bearbeitungszeit von etwa 5 min. Die Struktur orientierte sich an den in der Einleitung beschriebenen Forschungsaspekten und gliederte sich in vier Themenblöcke: (1) Fachrichtung und Rolle, (2) Nutzung von KI-Tools, (3) Status quo der Referenzverifikation sowie (4) Funktionswünsche und Risiken. Der Fragebogen kombinierte geschlossene (Einfach-, Mehrfach- und Likert-Items) und offene Fragen.

Der vollständige Fragebogen ist auf der beiliegenden CD enthalten.

Auswertungsverfahren. Die Plattform exportierte die erhobenen Rohdaten als CSV-Datei, auf deren Grundlage die deskriptive Auswertung in Excel erfolgte. Dabei wurden Häufigkeiten, Prozentwerte, Mittelwerte und Medianwerte berechnet. Zur Analyse von Gruppenunterschieden, beispielsweise zwischen Fachrichtungen und dem Einsatz von KI-Tools, kamen χ 2 -Tests zum Einsatz.

Die offenen Antworten wurden anschließend in MAXQDA 24 (MAXQDA, 2025) mittels inhaltsanalytischer Verfahren ausgewertet. Die Kodierung erfolgte kategoriengeleitet, ohne Durchführung einer Intercoder-Prüfung. Exemplarische Auszüge der Kodierlisten sind im Anhang A.1 dokumentiert. Die vollständigen Kodierlisten befinden sich auf der beiliegenden CD. Die in den quantitativen Analysen verwendeten Kategorien basieren auf diesen Kodierungen und den zugehörigen Rekodierungen (Anhang A.2).

## 4.2 Ergebnisse

Die folgenden Unterabschnitte berichten die Befunde in der Reihenfolge der Forschungsaspekte: demografische und fachliche Merkmale (Abschnitt 4.2.1), Nutzung und Wahrnehmung von KI-Tools (Abschnitt 4.2.2), aktuelle Praxis der Quellenprüfung (Abschnitt 4.2.3), Anforderungen an Tools zur Überprüfung von Quellenangaben (Abschnitt 4.2.4) und Risiken des KI-Einsatzes (Abschnitt 4.2.5). Zentrale Resultate werden jeweils textlich zusammengefasst und durch Tabellen sowie Abbildungen ergänzt.

## 4.2.1 Demografische und fachliche Merkmale

Fachrichtungen. Mehr als ein Drittel der Teilnehmenden ist in den Naturwissenschaften tätig ( n = 151; 35 , 5 %), gefolgt von den Ingenieur- und Technikwissenschaften ( n = 108; 25 , 4%) sowie den Geistes- und Sozialwissenschaften ( n = 96; 22 , 6 %). Personen aus den Rechts- und Wirtschaftswissenschaften machen 13 , 2 % der Stichprobe aus ( n = 56), das Gesundheitswesen ist mit 3 , 3% vertreten ( n = 14). Abbildung 2 zeigt die prozentuale Verteilung der Fachrichtungen.

Abbildung 2 Verteilung der Fachrichtungen der Befragten

<!-- image -->

Anmerkung. N = 425. Prozentwerte basierend auf Gesamtstichprobe.

Rollen im Hochschulkontext. Über die Hälfte der Befragten (54 , 1 %; n = 230) arbeitet als wissenschaftliche Mitarbeiter bzw. Doktoranden . Lehrkräfte , einschließlich Professoren und Dozierender, stellen 39 , 3 % der Stichprobe ( n = 167). Studierende sind mit 6 , 1% vertreten ( n = 26), während 0 , 5% ( n = 2) eine sonstige Funktion angaben. Die Verteilung der Rollen ist in Abbildung 3 dargestellt.

Abbildung 3 Rollenverteilung der Befragten

<!-- image -->

Anmerkung. N = 425. Prozentwerte basierend auf Gesamtstichprobe.

Einschätzung der Repräsentativität. Der hohe Anteil aktiver Wissenschaftler weist auf eine starke Nähe zur Forschungspraxis hin, geht jedoch mit einer Unterrepräsentation reiner Studierendengruppen einher. Die Ergebnisse lassen sich daher vorrangig auf forschungsnahe Kontexte übertragen. Für stärker lehrorientierte Kontexte ist eine mögliche Verzerrung zu berücksichtigen.

Zwischenfazit. Die Stichprobe ist ausreichend groß und in Bezug auf Rollen und Fachrichtungen breit aufgestellt. Dadurch liegen vielfältige Erfahrungs- und Anwendungskontexte vor, was die Übertragbarkeit der Ergebnisse verbessert und die Grundlage für belastbare Anforderungsableitungen schafft.

## 4.2.2 Nutzung und Wahrnehmung von KI-Tools

Einsatzhäufigkeit in Literaturrecherche und Schreibprozess. Wie in Abbildung 4 dargestellt, nutzen in der Literaturrecherche KI 55 , 3% der Befragten mindestens gelegentlich, wobei 14 , 4 % sie regelmäßig und 40 , 9 % sie gelegentlich verwenden. 44 , 7 % nutzen KI in diesem Kontext nie. Beim Verfassen wissenschaftlicher Texte liegt der Anteil derjenigen, die KI mindestens gelegentlich nutzen, bei 61 , 9 %. Diese Gruppe setzt sich zusammen aus 19 , 5 % regelmäßigen und 42 , 4 % gelegentlichen Nutzern, während 38 , 1% KI beim Verfassen nie verwenden. Damit ist der Anteil der Nutzung mindestens gelegentlich beim Verfassen um 6 , 6% höher als bei der Literaturrecherche.

Abbildung 4 Nutzung von KI-Tools in zwei Arbeitsschritten

<!-- image -->

Anmerkung. N = 425. Prozentwerte basierend auf Gesamtstichprobe.

Beobachtung halluzinierter Quellenangaben. Auf die Frage, wie häufig bereits nicht existierende Quellenangaben beobachtet wurden, berichteten 31 % der Teilnehmenden häufige ( n = 131) und 32 % gelegentliche Erfahrungen ( n = 134). Seltene Beobachtungen traten bei 13 % ( n = 55) auf, während 24 , 7 % ( n = 105) noch nie eine halluzinierte Quellenangabe wahrgenommen haben (Abbildung 5).

Abbildung 5 Beobachtung halluzinierter Quellenangaben bei KI-Tools

<!-- image -->

Anmerkung. N = 425. Prozentwerte basierend auf Gesamtstichprobe.

Erwartete Entwicklung. Die Mehrheit geht davon aus, dass die Zahl nicht existenter KI-Quellenangaben künftig zunimmt: 45 , 9% ( n = 195) erwarten eine starke, 41 , 2% ( n = 175) eine leichte Zunahme. Lediglich 12 , 9% rechnen mit einer gleichbleibenden oder sinkenden Häufigkeit (Abbildung 6).

Zusammenhang zwischen Fachrichtung und KI-Nutzung. Die Kreuztabelle in Tabelle 1 weist einen signifikanten Zusammenhang zwischen Fachrichtung und KI-Einsatz in der Literaturrecherche auf ( χ 2 (5) = 15 . 38 , p = . 009). Insbesondere Befragte aus den Ingenieur- und Naturwissenschaften nutzen KI häufiger als Teilnehmende aus geistes- und sozialwissenschaftlichen Disziplinen. Aufgrund sehr kleiner Fallzahlen in einer Kategorie sind die Ergebnisse jedoch mit Vorsicht zu interpretieren.

Zusammenhang zwischen Rolle und Halluzinationserfahrung. Für die Rollenverteilung zeigt sich kein statistisch bedeutsamer Zusammenhang mit der Erfahrung halluzinierter Quellenangaben ( χ 2 (9) = 14 . 94 , p = . 092). Demnach bestehen keine systematischen Unterschiede zwischen den Rollen (Tabelle 2). Aufgrund kleiner Gruppengrößen in einzelnen Kategorien sind die Ergebnisse jedoch mit Vorsicht zu Anmerkung. N = 425.

Abbildung 6 Einschätzung der zukünftigen Häufigkeit halluzinierter KI-Quellenangaben

<!-- image -->

Tabelle 1 Zusammenhang zwischen Fachrichtung und KI-Nutzung

| Fachrichtung                          | Ja   | Nein   |
|---------------------------------------|------|--------|
|                                       | n    | n      |
| Naturwissenschaften                   | 76   | 67     |
| Ingenieur- und Technikwissenschaften  | 71   | 34     |
| Geistes- und Sozialwissenschaften     | 44   | 47     |
| Rechts- und Wirtschaftswissenschaften | 23   | 32     |
| Wirtschaftsinformatik                 | 2    | 0      |
| Sonstiges                             | 19   | 10     |
| Gesamt                                | 235  | 190    |

Anmerkung. Absolute Häufigkeiten ( N = 425). Zusammenhangstest (Chi-Quadrat der Unabhängigkeit): χ 2 (5) = 15 . 38 , p = . 009.

interpretieren.

Tabelle 2 Zusammenhang zwischen Rolle und Halluzinationserfahrung

| Rolle                           |   Häufig |   Gelegentlich |   Selten |   Noch nie |
|---------------------------------|----------|----------------|----------|------------|
| Lehrkräfte                      |       46 |             44 |       20 |         56 |
| Wiss. Mitarbeiter / Doktoranden |       78 |             78 |       30 |         43 |
| Studierende                     |        6 |             10 |        5 |          5 |
| Sonstiges                       |        1 |              2 |        0 |          1 |
| Gesamt                          |      131 |            134 |       55 |        105 |

Anmerkung. Absolute Häufigkeiten ( N = 425). Zusammenhangstest (Chi-Quadrat der Unabhängigkeit): χ 2 (9) = 14 . 94 , p = . 092.

Zwischenfazit. KI-Werkzeuge sind fest in wissenschaftliche Arbeitsprozesse integriert und werden bereits von einer Mehrheit der Forschenden, insbesondere im Schreibprozess, eingesetzt. Gleichzeitig werden halluzinierte Quellenangaben regelmäßig beobachtet. Zudem erwartet eine deutliche Mehrheit eine weitere Zunahme dieser Problematik. Dies verdeutlicht den dringenden Bedarf an zuverlässigen, effizienten und nahtlos in den Workflow integrierten Prüfsystemen, was die in Kapitel 5 beschriebene Zielrichtung der Arbeit unterstützt. Ein signifikanter Zusammenhang zwischen der Rolle der Befragten und ihren Halluzinationserfahrungen konnte jedoch nicht festgestellt werden.

## 4.2.3 Aktuelle Praxis der Überprüfung von Quellenangaben

Eingesetzte Methoden. Wie Abbildung 7 zeigt, dominieren Online-Datenbanken (72 , 2%; n = 307) und DOI-Überprüfungen (45 , 6%; n = 194) die aktuelle Praxis. Diese datenbankgestützten Verfahren bilden den Kern der etablierten Prüfroutinen. Die Analyse der 'Sonstiges'-Antworten zeigt drei typische Muster:

1. Pragmatische Fallback-Strategien : 4 , 7 % nutzen manuelle Verfahren wie 'Suchmaschine (z. B. Google)' (ID 97) oder 'Stichproben bei Auffälligkeiten' (ID 508)
2. Qualitätsbewusste Ansätze : 2 , 6 % prüfen Quellen konsequent im Original ('Ich lese jede Quelle im Original . . . ', ID 130)
3. Innovative Ansätze : Angaben wie 'promptbasiertes Nachfragen innerhalb des Large Language Model (LLM) . . . ' (ID 411) weisen auf neue, KI-gestützte Prüfmethoden hin

Der deutliche Abstand zwischen der hohen Verbreitung strukturierter Datenbank- Aktuell genutzte Methoden zur Überprüfung von Quellenangaben Anmerkung. N = 425; Mehrfachauswahl möglich. Prozentwerte beziehen sich auf die Gesamtstichprobe.

Abbildung 7

<!-- image -->

methoden (&gt;72%) und den vereinzelten innovativen Ansätzen (&lt;5 %) zeigt, dass datenbankgestützte Verfahren gegenwärtig den Standard definieren, während sich neue Prüfparadigmen erst herausbilden.

Zeitaufwand und Verzicht. Abbildung 8 verdeutlicht, dass über drei Viertel der Befragten (78 , 3 %; n = 333) höchstens 5 min pro Quelle investieren. Wie Abbildung 9 zeigt, erfolgt ein Verzicht auf die Prüfung zwar meist selten oder nie (68 , 9 %; n = 293), doch 31 , 0 % ( n = 132) verzichten häufig oder immer aus Zeitgründen.

Abbildung 8 Selbsteingeschätzter Zeitaufwand pro Quellenangabe

<!-- image -->

Anmerkung. N = 425. Prozentwerte basierend auf der Gesamtstichprobe.

Abbildung 9 Verzicht auf vollständige Überprüfung von Quellenangaben aufgrund von Zeitmangel

<!-- image -->

Anmerkung. N = 425. Prozentwerte basierend auf Gesamtstichprobe.

Die Kreuztabelle in Tabelle 3 belegt einen signifikanten Zusammenhang zwischen geschätztem Zeitaufwand und Verzicht: Teilnehmende mit einem Aufwand von ≤ 5 min verzichten signifikant häufiger immer oder häufig als jene mit größerem Zeitbudget. Die Ergebnisse sind aufgrund kleiner Zellhäufigkeiten in einigen Kategorien jedoch mit Vorsicht zu interpretieren. Umgekehrt gaben Befragte mit mehr als 5 min Bearbeitungszeit überwiegend an, nur selten oder nie auf die Überprüfung zu verzichten. Ein gering eingeschätzter Zeitaufwand steht demnach nicht für Effizienz, sondern deutet eher auf das Ziel hin, den Prüfvorgang möglichst knapp zu halten.

Tabelle 3 Zusammenhang zwischen Zeitaufwand und dem Verzicht auf die Überprüfung von Quellenangaben

| Zeitaufwand     |   Nie |   Selten |   Häufig |   Immer |
|-----------------|-------|----------|----------|---------|
| Unter 1min      |    33 |       18 |        8 |      13 |
| 1min bis 5min   |    88 |       83 |       76 |      14 |
| 6min bis 10min  |    34 |       19 |       16 |       1 |
| 11min bis 15min |     5 |        5 |        2 |       0 |
| Mehr als 15min  |     5 |        3 |        1 |       1 |
| Gesamt          |   165 |      128 |      103 |      29 |

Anmerkung. Absolute Häufigkeiten ( N = 425). Zusammenhangstest (Chi-Quadrat der Unabhängigkeit): χ 2 (12) = 33 . 27 , p = . 001.

Typische Probleme. Wie Abbildung 10 zeigt, stellt die zeitintensive manuelle Suche (62 , 8%; n = 267) die größte Herausforderung dar. Dicht dahinter folgen inkonsistente Formatierungen (42 , 4 %), fehlende DOI-Nummern (40 , 9 %) und nicht existierende Referenzen (40 , 0 %).

Abbildung 10

Häufig auftretende Probleme bei der Überprüfung von Quellenangaben

<!-- image -->

Anmerkung. N = 425; Mehrfachantworten möglich. Prozentwerte beziehen sich auf die Gesamtstichprobe.

Die Auswertung der 'Sonstiges'-Antworten zeigt drei zusätzliche Problemkomplexe:

1. Metadatenqualität : 14 Teilnehmende (3 , 3 %) berichten von unvollständigen oder fehlerhaften Angaben (z. B. 'Fehlender Zeitschriftentitel . . . ' ID 386), was ein grundlegendes Hindernis für automatisierte Prüfungen darstellt
2. Inhaltsvalidierung : 5 Befragte (1 , 2 %) nennen das Problem, dass eine Quelle zwar existiert, aber nicht zu den KI-Aussagen passt (ID 376). Dies verdeutlicht die Grenzen rein formaler Existenzprüfungen
3. Institutionelle Barrieren : Universitätsspezifische Zugriffsbeschränkungen (z. B. 'Kein Zugriff . . . ' ID 58) behindern 1 , 2 % der Prüfprozesse

Eine kleine Gruppe (9 Personen; 2 , 1 %) berichtet, dank Tools wie 'Citavi' oder 'EndNote' (ID 22) keine Probleme zu erleben. Dieser Kontrast zwischen weitverbreiteten Schwierigkeiten (&gt;60 %) und vereinzelten reibungslosen Workflows verdeutlicht das Potenzial integrierter Prüfsysteme.

Auswirkungen auf die Qualität. Nach eigener Einschätzung wirkt sich das Nichtprüfen von Quellenangaben in 78 , 1% der Fälle stark oder sehr stark qualitätsmindernd aus ( n = 332; Abbildung 11). Nur 1 , 6% ( n = 7) sehen keine Beeinträchtigung. Diese Einschätzung verdeutlicht die Relevanz automatisierter Lösungen, insbesondere bei begrenzten Zeitressourcen.

Abbildung 11 Einschätzung der Beeinträchtigung der Qualität wissenschaftlicher Arbeiten durch ungeprüfte Quellenangaben

<!-- image -->

Anmerkung. N = 425. Prozentwerte basierend auf Gesamtstichprobe.

Zwischenfazit. Die Befragten nutzen überwiegend datenbankgestützte Methoden, verzichten jedoch häufig auf eine vollständige Prüfung, sobald der wahrgenommene Aufwand gering erscheint. Hauptprobleme sind zeitintensive manuelle Suchen, inkonsistente Formatierungen und fehlende DOI-Nummern. Rund 40 % haben bereits halluzinierte Quellenangaben erlebt und fast 80 % sehen darin eine starke Qualitätsbeeinträchtigung. Damit entsteht ein Spannungsfeld zwischen Qualitätsbewusstsein und Prüfverzicht. Ein zukünftiges Tool sollte daher den realen Aufwand senken, Usability-Hürden minimieren und klare Fehlerhinweise bieten, um Verzichtstendenzen zu verringern.

## 4.2.4 Anforderungen an Tools zur Quellenangabenüberprüfung

Arbeitsschritte mit dem höchsten Nutzen. Wie Abbildung 12 zeigt, wird der größte Mehrwert einer automatisierten Quellenprüfung in der Lehre gesehen (69 , 4 %; n = 295), insbesondere bei der Betreuung wissenschaftlicher Arbeiten. Mit Abstand folgen das Schreiben von Arbeiten (61 , 4%; n = 261), das Lesen von Fachartikeln (55 , 1 %; n = 234) und Peer-Review (53 , 6 %; n = 228).

Die Analyse der 'Sonstiges'-Antworten weist auf zwei Muster hin:

- -KI-Integration : 5 Teilnehmende (1 , 2 %) nennen explizit KI-bezogene Nutzungskontexte (z. B. 'Beim Recherchieren von Quellen mittels KI', ID 376)

Abbildung 12 Einschätzung des Nutzens einer Überprüfung von Quellenangaben in verschiedenen Arbeitsschritten

<!-- image -->

Anmerkung. N = 425; Mehrfachauswahl möglich. Prozentwerte basierend auf Gesamtstichprobe.

- -Lehrfokus : 4 Antworten (0 , 9 %) verorten die Prüfung in der Lehre (z. B. 'Beurteilung von Abschlussarbeiten', ID 459)

Die Rangfolge verdeutlicht, dass Quellenprüfung besonders dort als nützlich wahrgenommen wird, wo sie nahtlos in lehr- und schreibzentrierte Prozesse eingebettet ist. Nennungen zu KI-gestützten Workflows deuten auf ein wachsendes Anwendungsfeld hin.

Bewertung zentraler Funktionen. Die Top-2-Box-Auswertung (Bewertungen 4/5) ergibt das in Abbildung 13 dargestellte Prioritätenprofil: An erster Stelle steht die Warnung bei nicht existierenden Quellen (87 , 8%; n = 373), gefolgt von Überprüfung von Metadaten (79 , 5 %; n = 338) und automatischer DOI-Überprüfung (73 , 9%; n = 314). Im Mittelfeld liegen PDF-Import prüfen (69 , 4%) und Mehrere gleichzeitig prüfen (60 , 0 %). Geringere Priorität haben Exportfunktionen (42 , 6 % in Referenzmanager; 31 , 8 % PDF-Export).

Wünsche an ein Prüftool. Die Freitextauswertung zeigt klare Schwerpunkte (Abbildung 14): Zuverlässigkeit (19 , 7 %; n = 54) und Benutzerfreundlichkeit (17 , 5 %; n = 48) stehen an erster Stelle (z. B. 'Muss mindestens so zuverlässig sein wie eine manuelle Überprüfung', ID 190). Danach folgen Schnelligkeit (11 , 7 %; z. B. 'Schnell und unkompliziert zu bedienen', ID 11), Warnsysteme (10 , 2%; z. B. 'Flagging fehlerhafter Referenzen', ID 91) und Integration in bestehende Workflows (8 , 4%; z. B. 'Integrierbar in MS-Office-Programme', ID 44).

In den offenen Antworten wurden zudem folgende weitere Wünsche geäußert:

Abbildung 13 Einschätzung der Wichtigkeit zentraler Funktionen eines Tools zur Überprüfung von

Quellenangaben

<!-- image -->

Anmerkung. N = 425. Top-2-Box = Anzahl der Bewertungen '4' oder '5' auf der 5-Punkte-Skala. Prozentwerte basierend auf Gesamtstichprobe.

Abbildung 14

Genannte Wünsche an ein Tool zur Überprüfung von Quellenangaben

<!-- image -->

Anmerkung. N = 182. Zehn häufigste Wunschkategorien aus insgesamt 274 Freitextnennungen (Mehrfachkodierung); Prozentwerte bezogen auf Gesamtnennungen.

- -Datenschutz : 1 , 8% wünschen lokale Verarbeitung ohne externe Server und die Wahrung von Anonymität (ID 93; ID 450)
- -Technische Kompatibilität : 1 , 5% fordern BibT E X -Kompatibilität (ID 41; ID 194; ID 421)
- -Kontextspezifische Anpassung : 1 , 8% nennen Adaptierbarkeit an fachkulturelle Eigenheiten und Flexibilität gegenüber der Struktur von Quellenangaben (ID 101; ID 317)

Bemerkenswert ist der Wunsch nach inhaltsbasierten Prüfungen (5 , 8 %; z. B. 'Prüfung, ob zitierte Stellen inhaltlich der Quelle entnehmbar sind', ID 25). Dieser Aspekt liegt außerhalb des Fokus der vorliegenden Arbeit, die auf formale Existenz- und Metadatenprüfungen zielt. Eine inhaltsbasierte Prüfung könnte jedoch in zukünftigen Forschungsarbeiten aufgegriffen und weiterentwickelt werden.

Zwischenfazit. Die Anforderungen konzentrieren sich auf drei Schwerpunkte: (1) Verlässlichkeit und Effizienz der formalen Prüfung (präzise Treffer, geringe Fehlalarme, kurze Reaktionszeiten), (2) geringe Nutzungshürden durch intuitive Bedienung und nahtlose Integration in etablierte Workflows sowie (3) aktive Unterstützung durch Warnmechanismen , Direktlinks und automatisierte Checks. Niedriger priorisierte, aber relevante Aspekte betreffen Transparenz/Nachvollziehbarkeit , PDF-Import und Kompatibilität . Daraus ergeben sich Leitlinien für Kapitel 5: robuste Prüfalgorithmen mit erklärten Hinweisen, schlanke Interaktionen in den priorisierten Arbeitsschritten (Lehre, Schreiben, Lesen, Peer-Review) und Integrationsoptionen in gängige Umgebungen.

## 4.2.5 Risiken des KI-Einsatzes in der wissenschaftlichen Literaturrecherche

Die Analyse der Freitextantworten ( n = 187) zeigt vielfältige Bedenken hinsichtlich des Einsatzes von KI-Tools in der Literaturarbeit. Wie Abbildung 15 veranschaulicht, werden insbesondere halluzinierte, nicht existierende Quellenangaben (29 , 6 %; n = 77; z. B. 'erfundene Quellen- und Literaturangaben', ID 171) und ein Qualitätsverlust wissenschaftlicher Integrität (21 , 2%; n = 55; z. B. 'sinkende Qualität, mangelndes Verständnis der Themen', ID 310) häufig genannt. Ebenfalls relevant sind blindes Vertrauen in KI-Ergebnisse (18 , 8 %; n = 49; 'dass Menschen die Literatur nicht mehr selbst überprüfen und blind auf die KI vertrauen', ID 56) sowie ein wahrgenommener Kompetenzverlust bzw. eine Abhängigkeit (14 , 2%; n = 37; 'das kritische Denken wird gefährdet . . . ', ID 125).

Weitere in den Freitextantworten genannte Aspekte betreffen:

- -Bias und Verzerrung (3 , 8%; n = 10): 'Selektionsbias aufgrund des Prompting' (ID 139)

Abbildung 15 Genannte Risiken des KI-Einsatzes bei der Literaturrecherche

<!-- image -->

Anmerkung. n = 187. Genannte Risikokategorien aus insgesamt 260 Freitextnennungen (Mehrfachkodierung); Prozentwerte bezogen auf Gesamtnennungen.

- -Betrug und Fälschung (3 , 8 %; n = 10): 'Plagiate durch KI-Erstellung' (ID 357)
- -Pragmatische Herausforderungen (2 , 3 %; n = 6): 'Die hohe Fehlerrate macht eine manuelle Überprüfung notwendig und spart am Ende kaum Zeit' (ID 325)
- -Systematische Limitierungen (1 , 9%; n = 5): 'Noch stärkerer Verweis auf nicht zugängliche Quellen' (ID 346)

Die genannten Risikokategorien korrespondieren mit den zuvor dargestellten Ergebnissen zu den beobachteten Halluzinationen (Abbildung 5) sowie zur erwarteten Zunahme nicht existenter Quellen (Abbildung 6). Für die Gestaltung eines Prüftools lassen sich daraus drei Gestaltungsanforderungen ableiten: (1) Fehlerprävention durch robuste Erkennung nicht existenter Referenzen, (2) Transparenz und Nachvollziehbarkeit der Prüfergebnisse sowie (3) Nutzerschutz durch klare und kontextbezogene Warnmechanismen.

## 4.3 Diskussion der Befunde

Die Ergebnisse dieser Vorstudie bestätigen nicht nur die Relevanz des Themas Referenzverifikation, sondern liefern auch differenzierte Einblicke in Nutzungsmuster, Problemwahrnehmungen und konkrete Anforderungen. Im Folgenden werden die zentralen Befunde im Kontext der Forschungsfrage zusammengeführt, die Grenzen der Studie reflektiert und die Implikationen für die Tool-Konzeption herausgearbeitet.

## 4.3.1 Einordnung zentraler Ergebnisse

Die Daten zeichnen ein klares Bild eines paradoxen Spannungsfelds: Während KITools insbesondere im Schreibprozess mehrheitlich genutzt werden (61 , 9 %) und nicht überprüfte Quellen als gravierendes Qualitätsproblem eingestuft werden (78 , 1%), verzichtet dennoch fast ein Drittel der Befragten (31 %) häufig oder immer auf eine vollständige Prüfung, was primär auf Zeitgründe zurückgeführt wird. Diese Diskrepanz zwischen Qualitätsbewusstsein und Handlungspraxis unterstreicht die Dringlichkeit für entlastende Lösungen.

Die beobachtete und prognostizierte Zunahme halluzinierter Quellen deutet zudem auf ein systematisch wachsendes Problem hin, das nicht durch individuelle Sorgfalt allein aufgefangen werden kann. Dies legitimiert den Ansatz, nach technischen, tool-gestützten Lösungen zu suchen.

Die festgestellten fachspezifischen Unterschiede in der KI-Nutzung, die insbesondere in den Ingenieur- und Naturwissenschaften eine höhere Affinität erkennen lassen, sprechen für eine Tool-Gestaltung, die die Integrationstiefe gegenüber fachspezifischen Anpassungen priorisiert. Da das Problem halluzinierter Quellen jedoch rollenübergreifend auftritt, sollte die Lösung für alle wissenschaftlich Tätigen gleichermaßen zugänglich und nutzbar sein.

## 4.3.2 Beantwortung der Forschungsfrage: Nutzerzentrierte Anforderungen und Hebel

Vor dem Hintergrund der dargestellten Ergebnisse lassen sich die zentralen nutzerzentrierten Anforderungen und die größten Hebel für Effizienz und Qualität systematisch ableiten und direkt beantworten.

## Welche nutzerzentrierte Anforderungen ergeben sich aus der aktuellen

Praxis? Die Untersuchung der Forschungsfrage, welche nutzerzentrierten Anforderungen sich aus der aktuellen Praxis ergeben, zeigt drei zentrale Kernbereiche auf. Erstens muss das Tool Geschwindigkeit und minimale Interaktion bieten, da der hohe manuelle Zeitaufwand (&gt;78 % der Befragten investieren ≤ 5 min pro Quelle) als Hauptgrund für Qualitätsverzicht identifiziert wurde (31 % verzichten häufig oder immer). Die konkrete Anforderung lautet daher: Senkung der Transaktionskosten der Prüfung auf nahezu Null durch extrem schnelle Operationen mit minimaler Klickzahl. Zweitens erfordert die Dominanz etablierter Arbeitsumgebungen eine nahtlose Workflow-Integration , sodass das Tool passgenau in Textverarbeitung und Referenzmanager eingebettet sein muss, anstatt einen zusätzlichen Arbeitsschritt zu erfordern. Drittens verlangen die weitverbreitete Sorge vor KI-Halluzinationen und der explizite Wunsch nach Zuverlässigkeit (19 , 7 %) nach Vertrauen und Transparenz durch nachvollziehbare und erklärbare Ergebnisse, die informiertes Handeln ermöglichen.

Wo liegen die größten Hebel für Effizienz und Qualität? Bei der Identifikation der größten Hebel für Effizienz und Qualität zeigt sich, dass diese dort liegen, wo die häufigsten Probleme auf die am höchsten priorisierten Funktionen treffen. Der Effizienz-Hebel besteht in der Automatisierung der manuellen Suche , die als mit Abstand häufigstes Problem (62 , 8%) identifiziert wurde. Ein Tool, das diese manuelle Arbeit durch automatische Abfragen von Datenbanken und DOIRegistern ersetzt, adressiert den Hauptzeitfresser und senkt die Hemmschwelle für die Prüfung am stärksten. Der Qualitäts-Hebel liegt in der proaktiven Warnung vor nicht-existierenden Quellen , der als absolut priorisierte Funktion (87 , 8%) das Kernrisiko von KI-Halluzinationen adressiert (&gt;60 % der Befragten haben dies bereits beobachtet). Ein zuverlässiges Warnsystem verhindert, dass formale Fehler in die endgültige Arbeit einfließen und wirkt dadurch direkt qualitätssichernd.

Zusammenfassend lässt sich festhalten: Die nutzerzentrierten Anforderungen fordern ein Tool, das schnell, integriert und vertrauenswürdig ist. Der effizienteste Hebel liegt in der Automatisierung der manuellen Suche , der qualitätswirksamste in der proaktive Warnung vor Fake-Quellen . Die nachfolgende Konzeption wird diese zentralen Erkenntnisse in die Spezifikation des Verifikationstools überführen.

## 4.3.3 Grenzen und Validität

Die Aussagekraft der Ergebnisse ist im Lichte mehrerer Einschränkungen zu betrachten. Erstens weist die Stichprobe eine forschungsnahe Zusammensetzung auf, sodass die Übertragbarkeit auf lehrorientierte Kontexte begrenzt sein kann.

Zweitens beruhen die Angaben auf Selbstberichten. Diese unterliegen möglichen Verzerrungen durch Erinnerung oder unterschiedliche Begriffsverständnisse, wie etwa die Bedeutung von 'halluziniert' im Sinne formaler Nichtexistenz versus inhaltlicher Unplausibilität. Zudem ist anzumerken, dass in der Umfrage der Begriff 'Quellenverifikation' verwendet wurde, obwohl im Kontext der Arbeit präziser von 'Referenzverifikation' hätte gesprochen werden sollen. Diese begriffliche Unschärfe könnte dazu geführt haben, dass einige Teilnehmende die Aufgabenstellung stärker inhaltlich interpretierten, was sich in einzelnen offenen Antworten widerspiegeln kann.

Drittens handelt es sich um ein Querschnittsdesign, sodass keine kausalen Schlussfolgerungen gezogen werden können. Schließlich beruhen die Angaben auf Selbsteinschätzungen der Teilnehmenden, sodass die Ergebnisse als subjektive Einschätzungen und nicht als beobachtetes Verhalten zu interpretieren sind.

## 4.4 Fazit und Zusammenfassung

Ziel dieses Kapitels war es, durch eine Vorstudie den konkreten Bedarf und die Anforderungen an ein Tool zur formalen Referenzverifikation empirisch zu fundieren.

Die Ergebnisse der Online-Befragung liefern hierfür eine klare Ausgangslage:

Erstens belegen sie die Relevanz des Problems: KI-gestützte Halluzinationen von Quellen sind kein Nischenphänomen, sondern werden von einem großen Teil der wissenschaftlich Tätigen bereits regelmäßig beobachtet und ihre Zunahme wird mehrheitlich erwartet. Zweitens zeigen sie eine deutliche Diskrepanz zwischen Qualitätsanspruch und Praxis: Obwohl nicht überprüfte Quellen als gravierendes Qualitätsproblem eingestuft werden, wird aus Zeitgründen häufig auf eine vollständige Verifikation verzichtet. Drittens lassen sich aus den Daten konkrete Gestaltungsleitsätze für ein Tool ableiten. Dieses muss vor allem zuverlässig (Vermeidung von Fehlalarmen, präzise Treffer), effizient (minimaler Zeitaufwand) und nahtlos integrierbar in etablierte Workflows (z. B. in Textverarbeitung und Referenzmanager) sein. Die hohe Priorität für Funktionen wie die Warnung vor nicht-existierenden Quellen und die DOI-Überprüfung unterstreicht die Notwendigkeit eines stark automatisierten, formalen Prüfansatzes.

Die im Diskussionsteil reflektierten Limitationen, insbesondere die forschungsnahe Stichprobe, schränken die Generalisierbarkeit zwar ein, bestätigen jedoch den Bedarf für die anvisierte Zielgruppe. Vor diesem empirisch gestützten Hintergrund wird im folgenden Kapitel die Konzeption eines Verifikationstools vorgestellt, das die hier identifizierten Anforderungen in funktionale und nicht-funktionale Spezifikationen überführt und dessen Praxistauglichkeit anschließend evaluiert wird.

## 5 Konzeptionierung

Dieses Kapitel beschreibt die konzeptionelle Grundlage der Browser-Erweiterung zur formalen Referenzverifikation. Diese baut konsequent auf zwei Säulen auf: dem theoretischen Rahmenwerk aus Kapitel 2 und den empirischen Befunden der Vorstudie (Kapitel 4). Die Konzeption versteht sich damit als Synthese aus wissenschaftlich fundierten Methoden und nutzerzentrierten Anforderungen.

Im Mittelpunkt stehen die in der Vorstudie identifizierten Nutzerbedarfe, insbesondere der Wunsch nach Zuverlässigkeit , Benutzerfreundlichkeit und einer automatisierten Prüfung von Quellenangaben. Diese bilden die Grundlage für das Zielbild (Abschnitt 5.1) und die nachfolgenden Anforderungen.

Darauf aufbauend werden die funktionalen und nicht-funktionalen Anforderungen (Abschnitt 5.2) systematisch analysiert und priorisiert. Die resultierenden Use Cases (Abschnitt 5.3) konkretisieren diese Anforderungen aus Nutzersicht und verdeutlichen zentrale Interaktionsabläufe.

Den Kern des Kapitels bildet der Verifikationsprozess als konzeptionelles und algorithmisches Zentrum. Er ist explizit als Anwendungsfall des ER -Paradigmas modelliert und setzt das in Abschnitt 2.2.2 entwickelte generische Modell praktisch um. Der darauf aufbauende deterministische Entwurf (Abschnitt 5.4) dient als kernalgorithmische Grundlage der späteren Implementierung.

Abschließend beschreibt die schlanke Client-Server-Architektur (Abschnitt 5.5) die technische Umsetzung. Die Konzeption dient damit als verbindliche Grundlage für die Implementierung im folgenden Kapitel.

## 5.1 Zielbild, Scope und Abgrenzung

Zielbild. Das Ziel ist eine Browser-Erweiterung, die bibliografische Referenzen formal verifiziert und damit die drei häufigsten Probleme der Befragten adressiert: zeitintensive manuelle Suche (62 , 8%), inkonsistente Formatierung (42 , 4%) und nicht existierende Referenzen (40 , 0%). Hierzu werden erkannte Referenzen in eine standardisierte Normalform (CSL-JSON) überführt und automatisch mit externen Metadatenquellen abgeglichen. Das System trifft eine reproduzierbare Entscheidung auf Basis eines gewichteten Scoring-Modells und definierter Schwellenwerte. Dieser gesamte Verifikationsprozess ist, wie in Abschnitt 2.2.2 hergeleitet, als Instanz eines ER-Problems modelliert und realisiert die Phasen Extraktion, Kandidatensuche, Matching und Klassifikation. Jede Entscheidung wird durch eine Evidenzdarstellung transparent erklärt, was dem Nutzerwunsch nach Nachvollziehbarkeit (3 , 3%) entspricht. Die Interaktion erfolgt über eine Seitenleiste oder ein Pop-up-Fenster.

Leitprinzipien. Die Konzeption folgt vier Leitprinzipien aus den Nutzererwartungen der Vorstudie. Erstens die Trennung der Verantwortlichkeiten durch eine modulare Architektur. Zweitens Determinismus und Nachvollziehbarkeit für Reproduzierbarkeit und Transparenz als Grundlage der geforderten Zuverlässigkeit (19 , 7 %) sowie als zentrale Anforderung an wissenschaftliche ER-Systeme. Drittens Resilienz und Benutzbarkeit für intuitive Oberflächen und robuste Fehlerbehandlung entsprechend der Erwartungen an Benutzerfreundlichkeit (17 , 5%). Viertens Datenschutz durch datensparsame Verarbeitung und geschützte Schlüsselverwaltung als Reaktion auf geäußerte Datenschutzbedenken (1 , 8 %).

Geltungsbereich. Der funktionale Geltungsbereich umfasst Extraktion und Normalisierung von Referenzen, Suche nach Kandidaten in externen wissenschaftlichen Datenbanken, deterministisches Matching und Bewertung, Darstellung der Ergebnisse und Evidenz in der Browseroberfläche sowie Konfiguration der Erweiterung durch Nutzende. Das Konzept befasst sich ausschließlich mit der formalen Prüfung der Existenz und Korrektheit bibliografischer Metadaten, was die in der Vorstudie priorisierten Bedarfe an Warnungen bei nicht existierenden Quellen (87 , 8%) und Metadatenprüfungen (79 , 5 %) abdeckt.

Das System ist auf die formale Prüfung von Publikationen spezialisiert, die in wissenschaftlichen Metadatenbanken (CrossRef, OpenAlex, etc.) indexiert sind und über persistente Identifikatoren (DOI, International Standard Book Number (ISBN)) oder strukturierte Metadaten (Titel, Autor, Jahr) verfügen.

Nicht-Ziele und Abgrenzung. Nicht Bestandteil der Arbeit sind inhaltliche Bewertungen von Quellen, obwohl dies von 5 , 8% der Befragten gewünscht wurde. Ebenfalls ausgeschlossen sind Plagiatsprüfung, Volltextabgleich, Volltextbeschaffung und persistente Benutzerkonten. Die Integration in Desktop-Schreibumgebungen wurde bewusst zugunsten einer Fokussierung auf browserbasierte Lösungen zur nahtlosen Workflow-Integration nicht umgesetzt. Die Verifikation von Bildquellen, die nur von 0 , 7 % der Befragten genannt wurde, sowie die Verifikation von WebseitenRessourcen sind ebenfalls nicht Teil des Systems. Die Überprüfung der Existenz und Validität von generischen Webseiten (wie Blogbeiträgen oder Nachrichtenartikeln) ohne die oben genannten Merkmale liegt folglich außerhalb des Funktionsumfangs.

Nutzungskontexte und Stakeholder. Primäre Zielgruppen sind Studierende und Forschende in zwei Nutzungskontexten: Im Lese-Kontext konsumieren sie wissenschaftliche Literatur (Online-Journals, Preprint-Server) und überprüfen kopierte Referenzen. Dies entspricht dem Arbeitsschritt 'Beim Lesen von Papers' (55 , 1 %). Im Schreib-Kontext erstellen sie eigene Arbeiten und verifizieren Literaturverzeichnisse durch Import von Referenzlisten. Dies korrespondiert mit dem Arbeitsschritt 'Beim Schreiben von Arbeiten' (61 , 4 %).

## 5.2 Anforderungen

Die konzeptionelle Gestaltung der Browser-Erweiterung leitet sich unmittelbar aus den empirischen Befunden der Vorstudie (Kapitel 4) ab. Die folgenden Anforderungen übertragen die identifizierten Nutzerbedarfe, Problemfelder und Funktionswünsche in ein konkretes, priorisiertes Anforderungsprofil.

Die Vorstudie hat mehrere zentrale Herausforderungen aufgezeigt, die die Entwicklung eines Verifikationstools erforderlich machen:

- -Hoher manueller Aufwand : 62 , 8 % der Befragten nannten die zeitintensive manuelle Suche als größte Herausforderung (Abbildung 10).
- -Verbreitung formaler Fehler : 40 % der Teilnehmenden berichteten Erfahrungen mit nicht existierenden Referenzen (Abbildung 10). Zudem gaben 63 % an, solche Fälle häufig oder gelegentlich zu beobachten (Abbildung 5).
- -Qualitätsbewusstsein : 78 , 1 % gaben an, dass ungeprüfte Quellenangaben die Qualität einer Arbeit stark oder sehr stark beeinträchtigen (Abbildung 11).
- -Funktionsprioritäten : Die Befragten bewerteten eine Warnung bei nicht existierenden Quellen (87 , 8 %) und die Überprüfung von Metadaten (79 , 5 %) als wichtigste Funktionen (Abbildung 13).

Diese Ergebnisse verdeutlichen den Bedarf an einer automatisierten, zuverlässigen und transparenten Referenzverifikation. Auf ihrer Basis wurden die nachfolgenden funktionalen und nicht-funktionalen Anforderungen formuliert, die die Grundlage für die Systemkonzeption und spätere Implementierung bilden.

## 5.2.1 Funktionale Anforderungen

Die funktionalen Anforderungen (Tabelle 4) wurden auf Grundlage der empirischen Befunde der Vorstudie priorisiert. Ihre Auswahl und Dringlichkeit leiten sich unmittelbar aus den identifizierten Nutzerproblemen, bestehenden Praktiken und geäußerten Funktionswünschen ab.

Anforderungen zur Extraktion und Suche. Diese Gruppe adressiert die grundlegenden Herausforderungen der Quellenverifikation. Die automatische Erkennung und Strukturierung von Quellenangaben (REQ-F01) bildet die technische Basis, um das häufigste Problem der inkonsistenten Formatierung (42 , 4 %; Abbildung 10) zu lösen. Die Suchfunktionalität ist zweigleisig ausgelegt: eine Suche über eindeutige Kennungen wie DOI oder ISBN (REQ-F03), im Einklang mit der verbreiteten Praxis der DOI-Überprüfung (45 , 6%; Abbildung 7), sowie eine Suche anhand von Titel, Autor und Jahr (REQ-F04) für Quellen ohne Identifier. Letztere greift auf OnlineDatenbanken zurück, die von 72 , 2 % der Befragten als bevorzugte Prüfquelle genutzt werden (Abbildung 7). Die konfigurierbare Datenbankauswahl (REQ-F05) stärkt die Benutzerfreundlichkeit (17 , 5%; Abbildung 14) und erlaubt Kontrolle über den Suchprozess.

Anforderungen für Abgleich und Bewertung. Diese Anforderungen zielen darauf ab, die von den Nutzenden am höchsten priorisierte Zuverlässigkeit (19 , 7 %; Abbildung 14) sicherzustellen. Anpassbare Regeln für den Textvergleich (REQ-F06) und die Gewichtung einzelner Metadatenfelder (REQ-F07) erhöhen die Treffergenauigkeit bei variierender Formatierung (42 , 4%) und ermöglichen domänenspezifische Anpassungen. Der automatische Vergleich zentraler Metadaten (REQ-F08) operationalisiert einen der wichtigsten Funktionswünsche, nämlich die Überprüfung von Metadaten (79 , 5 %; Abbildung 13). Einstellbare Schwellenwerte für die Trefferklassifikation (REQ-F10) sichern dabei konsistente und nachvollziehbare Entscheidungen. Die transparente Darstellung der Prüfergebnisse (REQ-F11) erfüllt den Wunsch nach Nachvollziehbarkeit (3 , 3 %) und einem klaren Warnsystem (10 , 2 %; Abbildung 14).

Anforderungen an Interaktion und Resilienz. Diese Anforderungen beziehen sich auf zentrale Schwachstellen im Nutzerworkflow. Die gleichzeitige Prüfung mehrerer Quellen (REQ-F12) adressiert das Problem des hohen Zeitaufwands (62 , 8%; Abbildung 10) sowie den Wunsch, mehrere Referenzen parallel prüfen zu können (60 , 0 %; Abbildung 13). Exportfunktionen (REQ-F13) unterstützen die Integration in bestehende Workflows, insbesondere in Referenzmanager (42 , 6 %). Die Möglichkeit zur manuellen Korrektur und erneuten Prüfung (REQ-F14) überträgt etablierte Fallback-Strategien , wie sie von 4 , 7 % der Befragten in offenen Antworten berichtet wurden, in den digitalen Prozess. Eine stabile Prüfung auch bei Ausfällen externer Dienste (REQ-F15) ist wesentlich für die wahrgenommene Verlässlichkeit des Gesamtsystems (19 , 7 %).

Bewusste Abgrenzungen. Diese als Won't-Have klassifizierten Anforderungen wurden bewusst aus dem Projektumfang ausgeklammert, obwohl entsprechende Wünsche in der Vorstudie geäußert wurden. Die kontextuelle Plausibilitätsprüfung (REQF16) würde den Rahmen der formalen Metadatenverifikation überschreiten, greift jedoch das Problem inhaltlicher Abweichungen, das von 1 , 2 % der Befragten in offenen Antworten genannt wurde, auf. Die Integration in Desktop-Schreibumgebungen (REQ-F17) liegt außerhalb des Fokus auf Browser-basierten Lösungen, obwohl 8 , 4 % der Befragten Tool-Integrationen wünschten. Die Verifikation von Bildquellen (REQF18) stellt mit nur 0 , 7 % Nennungen in offenen Antworten ein Randthema dar und wurde daher nicht weiterverfolgt. Die Verifikation von Webseiten-Ressourcen (REQF19) wurde ausgeschlossen, da das System auf den Abgleich mit wissenschaftlichen Metadatenbanken spezialisiert ist und für generische Webinhalte keine autoritativen Entitäten zum Abgleich vorliegen. Diese bewusste Eingrenzung verdeutlicht die Konzentration auf die Kernproblematik der formalen Referenzverifikation wissenschaftlicher Publikationen innerhalb einer Browser-Erweiterung.

Tabelle 4 Funktionale Anforderungen an die Browser-Erweiterung

| ID      | Kurzbeschreibung                                                                 | Priorität   |
|---------|----------------------------------------------------------------------------------|-------------|
| REQ-F01 | Quellenangaben automatisch aus Text erkennen und strukturieren                   | Must        |
| REQ-F02 | Auswahl, welche Quellen-Informationen erkannt werden sollen                      | Should      |
| REQ-F03 | Quelle anhand eindeutiger Kennung (DOI, ISBN etc.) suchen                        | Must        |
| REQ-F04 | Quelle anhand von Titel, Autor und Jahr suchen                                   | Must        |
| REQ-F05 | Auswahl und Priorisierung der wissenschaftlichen Datenbanken                     | Should      |
| REQ-F06 | Anpassbare Regeln für den Textvergleich (z. B. Groß-/Kleinschreibung ignorieren) | Should      |
| REQ-F07 | Gewichtung, wie wichtig Titel, Autor oder Jahr für den Abgleich sind             | Should      |
| REQ-F08 | Automatischer Vergleich der wichtigsten Quellen- Metadaten                       | Must        |
| REQ-F09 | Auswahl, welche Metadaten für den Quellenab- gleich verwendet werden             | Should      |
| REQ-F10 | Einstellbare Grenzwerte für 'Exakter Treffer', 'Starker Treffer' etc.            | Must        |
| REQ-F11 | Nachvollziehbare Darstellung des Prüfergebnisses mit Quellenangabe               | Must        |
| REQ-F12 | Mehrere Quellenangaben gleichzeitig prüfen                                       | Could       |
| REQ-F13 | Prüfergebnisse exportieren oder in Zwischenabla- ge kopieren                     | Could       |
| REQ-F14 | Manuelle Korrektur erkannter Quellenangaben und erneute Prüfung                  | Must        |
| REQ-F15 | Stabile Prüfung auch bei temporären Problemen externer Dienste                   | Must        |
| REQ-F16 | Kontextuelle Plausibilitätsprüfung                                               | Won't       |
| REQ-F17 | Integration in Desktop-Schreibumgebungen                                         | Won't       |
| REQ-F18 | Verifikation von Bildquellen                                                     | Won't       |
| REQ-F19 | Verifikation von Webseiten-Ressourcen (Blogs, Nachrichtenartikel etc.)           | Won't       |

Anmerkung. Priorisierung nach MoSCoW-Prinzip: Must, Should, Could, Won't

## 5.2.2 Nicht-funktionale Anforderungen

Die nicht-funktionalen Anforderungen (Tabelle 5) beschreiben die Qualitätsmerkmale des Systems und leiten sich ebenso direkt aus den empirischen Befunden der Vorstudie ab. Sie gewährleisten, dass die funktionalen Anforderungen in einer Weise umgesetzt werden, die den Nutzererwartungen an Verlässlichkeit, Transparenz und Benutzbarkeit entspricht.

Anforderungen an Verlässlichkeit und Performance. Diese Anforderungen sichern das Kernversprechen eines verlässlichen Prüfwerkzeugs. Die präzise Einordnung der Quellen (NFR-01) und die hohe Genauigkeit der Quellenidentifikation (NFR-15) adressieren den am häufigsten genannten Wunsch nach Zuverlässigkeit (19 , 7 %; Abbildung 14). Deterministische und reproduzierbare Ergebnisse (NFR-13) sind dafür eine grundlegende Voraussetzung. Eine geringe Antwortzeit bei Einzelprüfungen (NFR-02) und ein hoher Durchsatz bei Batch-Verarbeitung (NFR-03) gehen direkt auf das Problem der zeitintensiven manuellen Suche (62 , 8 %; Abbildung 10) sowie den Wunsch nach Schnelligkeit und Effizienz (11 , 7%) zurück. Robustheit gegenüber Teilausfällen externer Dienste (NFR-05) ist essenziell, um die Stabilität und Verlässlichkeit des Gesamtsystems zu sichern.

Anforderungen an Benutzbarkeit und Transparenz. Diese Anforderungen adressieren die zweite zentrale Erwartungsebene der Nutzenden. Die nachvollziehbare Entscheidungsdarstellung (NFR-04) erfüllt den Wunsch nach Transparenz und Nachvollziehbarkeit (3 , 3 %) und ist eine Voraussetzung für die Akzeptanz der Prüfergebnisse. Eine intuitive Benutzbarkeit (NFR-07) entspricht dem zweithäufigsten Nutzerwunsch (17 , 5 % für Benutzerfreundlichkeit; Abbildung 14). Die niedrige Einstiegshürde (NFR-14) berücksichtigt die Forderung nach einem freien und leicht zugänglichen Tool, die in offenen Antworten geäußert wurde. Sie ist entscheidend für eine breite Akzeptanz, insbesondere unter Studierenden. Die barrierefreie Bedienbarkeit (NFR-08) gewährleistet, dass das Tool unabhängig von individuellen Einschränkungen nutzbar ist.

Technische und sicherheitsrelevante Anforderungen. Diese Anforderungen bilden die Grundlage für einen nachhaltigen und vertrauenswürdigen Betrieb. Die datenschutzkonforme Verarbeitung (NFR-06) reagiert auf die in der Vorstudie geäußerten Datenschutzbedenken (1 , 8 %), die in offenen Antworten genannt wurden. Die Kompatibilität mit verschiedenen Browsern (NFR-09) ist eine notwendige Voraussetzung für die geforderte nahtlose Integration in bestehende Workflows . Wartungsfreundlichkeit und Erweiterbarkeit (NFR-10) sowie die valide Konfigurationsprüfung (NFR-12) gewährleisten die langfristige Stabilität des Systems. Die sichere Handhabung von API-Schlüsseln (NFR-11) schützt sensible Zugangsdaten und schafft Vertrauen in die technische Integrität der Lösung.

Zusammen bilden diese nicht-funktionalen Anforderungen ein Qualitätsgerüst, das sicherstellt, dass die Erweiterung ihre Funktionen nicht nur zuverlässig, sondern auch effizient, transparent und benutzerfreundlich bereitstellt.

Tabelle 5 Nicht-funktionale Anforderungen an die Browser-Erweiterung

| ID     | Kurzbeschreibung                                   | Priorität   |
|--------|----------------------------------------------------|-------------|
| NFR-01 | Zuverlässige Klassifikation von Referenzen         | Must        |
| NFR-02 | Geringe Antwortzeit bei Einzelprüfungen            | Should      |
| NFR-03 | Hoher Durchsatz bei Batch-Verarbeitung             | Should      |
| NFR-04 | Transparente Entscheidungsdarstellung              | Must        |
| NFR-05 | Robustheit gegen Teilausfälle                      | Must        |
| NFR-06 | Datenschutzkonforme Verarbeitung                   | Must        |
| NFR-07 | Intuitive Benutzbarkeit                            | Should      |
| NFR-08 | Barrierefreie Bedienbarkeit                        | Could       |
| NFR-09 | Funktionsfähigkeit in verschiedenen Browsern       | Must        |
| NFR-10 | Einfache Wartung und Erweiterung                   | Should      |
| NFR-11 | Sichere Handhabung von API-Schlüsseln              | Must        |
| NFR-12 | Valide Konfigurationsprüfung                       | Should      |
| NFR-13 | Deterministische und reproduzierbare Ergebnisse    | Must        |
| NFR-14 | Niedrige Einstiegshürde (kostenfreie Basisversion) | Must        |
| NFR-15 | Hohe Verlässlichkeit der Quellenidentifikation     | Must        |

Anmerkung. Priorisierung nach MoSCoW-Prinzip: Must, Should, Could, Won't.

## 5.3 Use Cases

Die folgenden Use Cases strukturieren die zentralen Interaktionsszenarien in den durch die Vorstudie als besonders relevant identifizierten Nutzungskontexten (LeseKontext: 55 , 1 %, Schreib-Kontext: 61 , 4 %) und operationalisieren die zuvor definierten Anforderungen. Sie beschreiben die Nutzerperspektive auf die Kernfunktionen der Extraktion, Verifikation und Ergebnisanalyse. Die daraus abgeleiteten Abläufe bilden die Grundlage für den Entwurf der Systemarchitektur im folgenden Abschnitt. Tabelle 6 bietet eine kompakte Übersicht.

UC-01: Extraktion aus Texteingaben. Der Nutzer möchte vorhandene Referenzen aus Text extrahieren und strukturieren. Ausgangspunkt sind unstrukturierte oder strukturierte Texteingaben wie Freitext oder teilweise formatierte Quellenangaben. Nach Start der Extraktion in der Seitenleiste kann der Nutzer optional festlegen, welche Felder extrahiert werden sollen (REQ-F02). Das System normalisiert die Eingabe gemäß den konfigurierten Regeln (REQ-F06) und gibt die Referenz in standardisierter CSL-JSON-Form aus (REQ-F01). Ergebnis sind normalisierte Einträge, die für die weitere Verifikation bereitstehen. Akzeptanzkriterien sind die Erfüllung von REQ-F01, REQ-F02, REQ-F06 sowie NFR-04 und NFR-12.

Tabelle 6 Übersicht der Use Cases

| UC-ID   | Ziel                    | Trigger                      | Hauptszenario                                         |
|---------|-------------------------|------------------------------|-------------------------------------------------------|
| UC-01   | Extraktion aus Eingaben | Seitenleiste: Ex- traktion   | Eingabe →Feldauswahl →Normalisierung →CSL- Form       |
| UC-02   | Batch-Verifikation      | Seitenleiste: Verifi- zieren | Suche → Matching → Klas- sifikation → (Export)        |
| UC-03   | Korrektur & Re- Check   | Formularänderung             | Feldkorrektur →erneute Suche →aktualisierte Evi- denz |
| UC-04   | Detailansicht           | Öffnen Detailan- sicht       | Quellen, Feldvergleiche, Score-Zerlegung anzeigen     |
| UC-05   | Fehlerbehandlung        | Fehlerereignis               | Hinweis; Fortsetzung; optio- naler Abbruch            |

UC-02: Batch-Verifikation. Der Nutzer möchte mehrere Referenzen gleichzeitig verifizieren. Voraussetzung sind normalisierte Referenzen, beispielsweise aus UC-01. Beim Start der Batch-Prüfung sucht das System zunächst über vorhandene Identifier (REQ-F03) oder alternativ über Titel, Autor und Jahr (REQ-F04) nach Kandidaten. Anschließend erfolgt ein Matching mit konfigurierten Gewichtungen (REQ-F07) und Feldern (REQ-F09) unter Anwendung der Normalisierungsregeln (REQ-F06). Das System klassifiziert die Referenzen basierend auf Schwellenwerten (REQ-F10) und stellt die Ergebnisse mit Evidenz dar (REQ-F11). Optional kann der Nutzer die Ergebnisse exportieren oder kopieren (REQ-F13). Das System muss während der Verarbeitung bedienbar bleiben (REQ-F12) und die Anforderungen NFR-02, NFR-03, NFR-04 erfüllen.

UC-03: Manuelle Korrektur und Re-Check. Der Nutzer möchte eine bereits getroffene Verifikationsentscheidung manuell korrigieren und erneut prüfen. Auslöser ist die Bearbeitung der Referenz und das Auslösen der 'Erneut prüfen'-Funktion. Der Nutzer kann dabei einzelne Felder korrigieren oder die Feldauswahl für das Matching anpassen (REQ-F09). Das System führt eine erneute Suche und Bewertung mit den aktuellen Normalisierungsregeln (REQ-F06) und Gewichtungen (REQ-F07) durch, aktualisiert die Klassenzuordnung (REQ-F10) und die Evidenzdarstellung (REQ-F11). Die manuelle Korrekturmöglichkeit (REQ-F14) muss dabei zuverlässigen Ergebnissen (NFR-01) unter Einhaltung der Konfigurationsvalidierung (NFR-12) führen.

UC-04: Detailansicht und Evidenzanzeige. Der Nutzer möchte den Entscheidungsweg einer Verifikation nachvollziehen. Beim Öffnen der Detailansicht werden die verwendeten Metadatenquellen, die durchgeführten Feldvergleiche (inklusive Normalisierung) und die Score-Berechnung detailliert angezeigt. Kopierfunktionen stehen für einzelne Informationen zur Verfügung. Ergebnis ist ein vollständig nachvollziehbarer Entscheidungsweg, der die Anforderungen an transparente Darstellung (REQ-F11) und Nachvollziehbarkeit (NFR-04) erfüllt.

UC-05: Fehler- und Rate-Limit-Szenario. Das System muss robust auf Störungen externer Dienste reagieren. Bei Fehlern wie Rate-Limiting (HTTP 429) oder Timeouts zeigt das Interface klare Hinweise an und ermöglicht die Fortsetzung der Verarbeitung mit verbleibenden Referenzen. Ein optionaler Abbruch einzelner Anfragen ist möglich (REQ-F15). Das System bleibt insgesamt bedienbar und bereits erzielte Teilergebnisse bleiben sichtbar. Dies gewährleistet die geforderte Robustheit (NFR-05) auch bei Teilausfällen.

Die fünf Use Cases operationalisieren gezielt die in der Vorstudie identifizierten Hauptprobleme und Nutzerbedarfe. UC-01 und UC-02 adressieren die dominierende Herausforderung der zeitintensiven manuellen Suche (62 , 8 %) durch Automatisierung. UC-03 ermöglicht erfahrungsbasierte Prüfstrategien (4 , 7 % manuelle Plausibilitätsprüfung), während UC-04 den expliziten Wunsch nach Transparenz und Nachvollziehbarkeit (3 , 3 %) umsetzt. UC-05 schließlich gewährleistet die geforderte Robustheit (NFR-05) auch bei Störungen externer Dienste.

## 5.4 Verifikationsprozess

Dieser Abschnitt beschreibt den kernalgorithmischen Ablauf der Referenzverifikation, der das konzeptionelle und technische Herzstück der Browser-Erweiterung bildet. Zunächst werden die grundlegenden Designentscheidungen erläutert, die der Architektur zugrunde liegen (Abschnitt 5.4.1). Anschließend folgt eine detaillierte Darstellung der vier Prozessphasen, die den Verifikationsvorgang von der Eingabe bis zur klassifizierten Entscheidung beschreiben (Abschnitt 5.4.2). Abschließend veranschaulicht ein Fallbeispiel die vollständige Verifikation an einer konkreten Referenz (Abschnitt 5.4.3).

Der kernalgorithmische Ablauf der Referenzverifikation operationalisiert nicht nur die zuvor definierten Anforderungen, sondern ist explizit als Anwendungsfall des in Abschnitt 2.2 eingeführten ER -Paradigmas konzipiert. In Anlehnung an das Vier-Phasen-Modell aus Abschnitt 2.2.2 gliedert sich der Prozess in die folgenden, für die Domäne adaptierten Phasen: (1) Extraktion und Normalisierung, (2) Kandidatensuche, (3) Feldweiser Vergleich und Scoring sowie (4) Klassifikation und Evidenzgenerierung. Diese Strukturierung gewährleistet eine systematische und vergleichbare Umsetzung des theoretischen Referenzverifikationsprozesses und bildet die konzeptionelle Brücke zwischen den theoretischen Grundlagen (Kapitel 2) und der technischen Implementierung (Kapitel 6).

## 5.4.1 Grundlegende Designentscheidungen

Bevor die einzelnen Prozessphasen detailliert werden, sind die grundlegenden Designentscheidungen zu erläutern, die der Architektur des Verifikationsprozesses zugrunde liegen. Diese leiten sich unmittelbar aus den theoretischen Grundlagen des ER (Abschnitt 2.2) und den Ergebnissen der Vorstudie (Kapitel 4) ab.

Die Wahl der Extraktionsstrategien. Für die Umsetzung wurde eine duale Extraktionsstrategie gewählt, die AnyStyle als statistisch trainierten Referenzparser mit LLM-gestützter Extraktion kombiniert. Diese Entscheidung basiert auf einer systematischen Abwägung der in Abschnitt 2.3.1 beschriebenen etablierten Lösungsansätze sowie den spezifischen Anforderungen aus der Vorstudie.

AnyStyle wurde als CRF-basierter Parser gewählt, da das zugrunde liegende sequenzstatistische Modell deterministische und reproduzierbare Ergebnisse liefert, die ohne die Variabilität generativer Modelle auskommen und damit der Anforderung an Nachvollziehbarkeit (NFR-04) entsprechen. Zudem ermöglicht die lokale Verarbeitung ohne Abhängigkeit von externen Cloud-Diensten eine datenschutzfreundliche Lösung, die die in der Vorstudie geäußerten Datenschutzbedenken (1 , 8%) adressiert. Der kostenfreie Einsatz unterstützt die niedrige Einstiegshürde (NFR-14), während die Token-basierte Verarbeitung eine transparente Fehleranalyse und nachvollziehbare manuelle Validierung sowie Korrektur (REQ-F14) ermöglicht.

Die LLM-gestützte Extraktion wurde ergänzend implementiert, um die Robustheit gegenüber Formatierungsvarianten zu erhöhen, insbesondere bei unstrukturierten Eingaben und KI-generierten Referenzen. Sie trägt dazu bei, die Herausforderung variierender Zitierstile besser zu bewältigen und gewährleistet Resilienz gegenüber fehlerhaften Eingaben, wie sie in der Praxis und insbesondere bei KI-generierten Quellen häufig auftreten.

Diese komplementäre Architektur erlaubt es Nutzenden, je nach Anforderungskontext zwischen einem deterministischen, datensparsamen Ansatz (AnyStyle) und einem flexiblen, robusten Ansatz (LLM) zu wählen. Die Wahl von AnyStyle gegenüber alternativen ML-basierten Parsern wie GROBID oder CERMINE basiert auf dessen leichterer Integrierbarkeit, dem geringen Ressourcenbedarf und der expliziten Unterstützung für manuelle Nachbearbeitung durch das Token-basierte Modell.

Die Implementierung einer dualen Suchstrategie. Die Suche erfolgt primär über eindeutige Identifikatoren (DOI, ISBN) und sekundär über eine Kombination aus Titel, Autoren und Jahr. Diese Strategie adressiert direkt das in der Vorstudie identifizierte Problem fehlender DOIs (40 , 9 %). Der initiale Fokus auf Identifikatoren ist sowohl performanter (NFR-02) als auch zuverlässiger, da DOIs eine exakte Abbildung auf eine Publikation ermöglichen.

Die Definition eines gewichteten Scoring-Modells. Die Aggregation der feldweisen Ähnlichkeiten zu einem Gesamtscore S erfolgt mittels einer gewichteten Summe anstelle eines einfachen Durchschnitts. Diese Entscheidung ist zentral, um der unterschiedlichen diskriminierenden Kraft der einzelnen Metadatenfelder Rechnung zu tragen. Ein Feld mit hoher diskriminierender Kraft kann eine Referenz fast eindeutig identifizieren, während ein Feld mit niedriger Kraft mehrdeutig ist und häufig Fehler aufweist.

Die konfigurierbaren Gewichtungen w f für jedes Feld f erlauben es, diese Kraftverhältnisse abzubilden. In einem typischen Setup erhält der Titel als diskriminierendstes Merkmal eine hohe Gewichtung, da zwei verschiedene wissenschaftliche Publikationen mit identischem Titel extrem selten sind. Ebenfalls hoch gewichtet wird die Autorenliste , die zwar ebenfalls hochdiskriminierend ist, jedoch häufiger Formatierungsvarianten (Initialen vs. Vollnamen, Reihenfolge) unterliegt. Das Erscheinungsjahr erhält eine mittlere Gewichtung, da es wichtig für die zeitliche Einordnung ist, aber als alleiniges Merkmal nutzlos und anfällig für Tippfehler. Felder wie Seitenzahlen oder Bandnummern schließlich erhalten eine niedrige Gewichtung, da sie am anfälligsten für Inkonsistenzen sind und daher den geringsten Einfluss auf den Gesamtscore haben sollten.

Dieses gewichtete Modell stellt sicher, dass Abweichungen in kritischen, hochdiskriminierenden Feldern den Score stärker beeinflussen als solche in peripheren Feldern. Es operationalisiert nicht nur die Anforderung REQ-F07, sondern trägt maßgeblich zur Zuverlässigkeit der Quellenidentifikation (NFR-15) bei, einem der zentralen Nutzerwünsche aus der Vorstudie.

Die Wahl eines mehrstufigen Klassifikationsmodells. Anstelle einer binären Entscheidung ('verifiziert'/'nicht verifiziert') werden Referenzen in die Klassen Exact Match , Strong Match , Possible Match und No Match eingeteilt. Diese Entscheidung wird aus drei Gründen getroffen:

Erstens ermöglicht sie die Abbildung von Unsicherheit , da der Abgleich bibliografischer Metadaten inherent unscharf ist. Tippfehler, Formatierungsvarianten und unvollständige Angaben führen selten zu einer perfekten 100 %-Übereinstimmung. Ein binäres Modell mit einer willkürlichen Grenzziehung würde sowohl falsch-positive als auch falsch-negative Ergebnisse begünstigen, während das mehrstufige Modell Graustufen der Übereinstimmung abbilden kann.

Zweitens bietet das Modell Handlungsorientierung für den Nutzer , indem die Klassen klare Handlungsempfehlungen liefern. Dies adressiert direkt die in der Vorstudie geäußerte Forderung nach proaktiven Hinweisen. Ein Exact Match erfordert keine weitere Aktion, ein Strong Match rechtfertigt eine Sichtprüfung und ein Possible Match signalisiert die dringende Notwendigkeit einer manuellen Überprüfung. Dies lenkt den Fokus des Nutzers auf die kritischen Fälle und kann dem dokumentierten Verzicht auf Überprüfungen aus Zeitgründen (31 %) entgegenwirken.

Drittens ermöglicht das Modell die Erkennung von Non-Matches durch die explizite No Match -Kategorie. Diese adressiert die in Abschnitt 2.2.1 identifizierte Kernherausforderung der Referenzverifikation im KI-Kontext: die zuverlässige Erkennung von Non-Matches, also halluzinierten, nicht-existenten Quellen. Während klassisches ER primär darauf abzielt, variierende Darstellungen existierender Entitäten zu verlinken, muss dieses System eine hochkonfidente Negativverifikation leisten. Die Klasse 'No Match' ist somit keine Restkategorie, sondern ein zentrales, positiv identifiziertes Ergebnis, das der besonderen Bedrohung der wissenschaftlichen Integrität durch KI-Halluzinationen Rechnung trägt.

Die Konfigurierbarkeit der Schwellenwerte. Die Schwellenwerte für die Klassifikation ( Strong Match , Possible Match ) sind bewusst als konfigurierbare Parameter implementiert und nicht fest im Code verankert. Diese Entscheidung adressiert zwei zentrale Anforderungen:

Erstens ermöglicht sie die Anpassung an unterschiedliche Risikotoleranzen in verschiedenen Nutzungskontexten. Während in der Rechtswissenschaft möglicherweise nur Exact Matches akzeptabel sind, könnte in der Informatik aufgrund der Prävalenz von Preprints und Konferenzbeiträgen ein toleranterer Schwellenwert für Strong Matches angemessen sein. Die Konfigurierbarkeit erlaubt es, das Tool an diese domänenspezifischen Anforderungen anzupassen.

Zweitens unterstützt die Konfigurierbarkeit die iterative Optimierung und Nutzerautonomie . Die in der Vorstudie geäußerte Forderung nach Zuverlässigkeit (19 , 7 %) ist subjektiv und kann zwischen Nutzenden variieren. Konfigurierbare Schwellenwerte geben den Nutzenden die Kontrolle, das Verhältnis zwischen Genauigkeit (Vermeidung von Fehlklassifikationen) und Vollständigkeit (Erfassung möglichst vieler tatsächlich existierender Referenzen) selbst zu bestimmen.

Diese Designentscheidung unterstreicht den nutzerzentrierten Ansatz des Systems und setzt die Anforderung REQ-F10 (Einstellbare Grenzwerte) praktisch um.

## 5.4.2 Prozessphasen und Methoden

Der Verifikationsprozess beschreibt den Ablauf von der Nutzereingabe bis zur klassifizierten Entscheidung. Dieser strukturierte Ansatz gewährleistet Reproduzierbarkeit und Transparenz im Sinne der Leitprinzipien aus Abschnitt 5.1 und adressiert die in der Vorstudie identifizierten Kernprobleme: Handhabung inkonsistenter Formatierung (42 , 4 %) durch Normalisierung in Phase 1, Überwindung fehlender Identifier (40 , 9 %) durch duale Suchstrategie in Phase 2 sowie Sicherstellung von Nachvollziehbarkeit (3 , 3 %) durch evidenzbasierte Klassifikation in Phase 4. Die folgenden Abschnitte beschreiben die vier Prozessphasen im Detail und zeigen, wie sie zur Gesamtverifikation beitragen.

Phase 1: Extraktion und Normalisierung. In dieser Phase wird die unstrukturierte Eingabe über die in Abschnitt 5.4.1 begründete duale Extraktionsstrategie in einheitliches CSL-JSON überführt. Nutzende können dabei zwischen der LLMgestützten Extraktionspipeline für maximale Robustheit und der AnyStyle-basierten Pipeline für deterministische, datensparsame Verarbeitung wählen. Diese Wahlfreiheit zwischen Automatisierung und manueller Kontrolle ist mit den dokumentierten erfahrungsbasierten Prüfstrategien (4 , 7 %) vereinbar und stärkt die Benutzerautonomie.

Phase 2: Kandidatensuche. Diese Phase realisiert durch die in Abschnitt 5.4.1 begründete duale Suchstrategie die Blocking- und Kandidatengenerierungs-Phase der zugrundeliegenden Verifikationspipeline aus Abschnitt 2.2.2. Um den Suchraum der umfangreichen Metadatenquellen effizient einzugrenzen und die ansonsten quadratische Komplexität von Paarvergleichen zu vermeiden, kommt eine strategische Priorisierung zum Einsatz. Diese kann als eine Form des Standard-Blockings aufgefasst werden: Zuerst wird eine Identifier-basierte Suche (DOI, ISBN) durchgeführt, die als hochpräziser, exakter Blocking-Key wirkt. Schlägt diese fehl, folgt eine Metadaten-basierte Suche mit Titel, Autoren und Jahr, wobei die Kombination dieser Kernattribute einen zusammengesetzten Blocking-Key bildet. Dieser Ansatz adressiert die in Abschnitt 2.2.1 beschriebene Herausforderung der Datenheterogenität und Skalierung und automatisiert die von 72 , 2 % der Befragten genannte Praxis der Online-Datenbankrecherche.

Phase 3: Feldweiser Vergleich und Scoring. In dieser Phase erfolgt der kernalgorithmische Schritt des Record Pair Comparison (Abschnitt 2.2.2). Nach einer konsistenten Normalisierung wird die Ähnlichkeit für jedes aktivierte Metadatenfeld mittels spezifischer Fuzzy-Metriken berechnet. Für String-Felder wie Titel und Autoren kommt die Levenshtein-Damerau-Distanz zum Einsatz, die sich gegenüber der einfachen Levenshtein-Distanz als robust gegenüber Transpositionsfehlern erwiesen hat und sich bei der Namensvergleichen bewährt hat (Abschnitt 2.3.3).

Die Aggregation der feldweisen Scores s f zu einem Gesamtscore S erfolgt durch eine gewichtete Summe:

<!-- formula-not-decoded -->

ein regelbasiertes Aggregationsverfahren, das dem etablierten Fellegi-Sunter-Modell entspricht (Abschnitt 2.3.3). Dabei ist w f das konfigurierbare Gewicht des Feldes f . Die gewichtete Summe erlaubt es, der unterschiedlichen diskriminierenden Kraft der Metadatenfelder Rechnung zu tragen, wie in Abschnitt 5.4.1 begründet. Das Ergebnis S liegt immer im Bereich [0, 100].

Phase 4: Klassifikation und Evidenzgenerierung. Diese Phase ordnet den Gesamtscore S fi nal den zuvor motivierten Entscheidungsklassen zu. Die in Abschnitt 5.4.1 begründeten konfigurierbaren Schwellenwerte ermöglichen eine Anpassung an die jeweilige Risikobereitschaft: Exact match : S = 100, Strong match ( S ≥ Schwellenwert strong ), Possible match ( S ≥ Schwellenwert possible ), No match ( S &lt; Schwellenwert possible ). Die Generierung einer detaillierten Evidenz (gefundene Kandidaten, Feldvergleiche, Score-Aufschlüsselung) erfüllt dabei die Anforderung der transparenten Entscheidungsdarstellung (NFR-04).

## 5.4.3 Fallbeispiel: Vollständige Verifikation einer Referenz

Dieses Fallbeispiel demonstriert den vollständigen Verifikationsprozess anhand der Referenz 'Deep Residual Learning for Image Recognition'. Während die Phasen der Extraktion und Kandidatensuche hier übersprungen werden (da die normalisierten Metadaten bereits vorliegen), zeigt das Beispiel detailliert die kritischen Schritte des Matchings, der Score-Berechnung und der finalen Klassifikation.

Tabelle 7 zeigt die zugrunde liegenden Metadaten im Vergleich zwischen der normalisierten Eingabereferenz und dem korrekten Kandidaten aus Crossref. Die Eingabereferenz enthält mehrere typische Fehler: Im Titel fehlt das Wort 'for', das Erscheinungsjahr ist mit 2015 falsch angegeben (das tatsächliche Konferenzjahr ist 2016) und die Seitenzahlen weichen mit 620-640 von den korrekten 770-778 ab. Die Autorenliste und der Container-Titel stimmen dagegen exakt überein.

Tabelle 7 Vergleich der Metadaten: Eingabereferenz vs. Kandidat

| Feld            | Eingabereferenz                                              | Kandidat                                                               |
|-----------------|--------------------------------------------------------------|------------------------------------------------------------------------|
| Titel           | deep residual learning image recognition                     | deep residual learning for image recognition                           |
| Autoren Jahr    | he k, zhang x, ren s, sun j 2015                             | he k, zhang x, ren s, sun j 2016                                       |
| Container-Titel | conference on computer vision and pat- tern recognition cvpr | 2016 ieee conference on computer vision and pat- tern recognition cvpr |
| Seiten          | 2016 ieee                                                    | 770-778                                                                |
|                 | 620-640                                                      |                                                                        |

Im Matching-Schritt werden die feldweisen Ähnlichkeiten berechnet und gemäß der konfigurierten Gewichtung aggregiert. Tabelle 8 zeigt die detaillierte Score- Berechnung, die den Einfluss von Abweichungen in unterschiedlich gewichteten Feldern verdeutlicht.

Tabelle 8 Berechnung des Verifikationsscores anhand einer Beispielreferenz

| Feld            |   Gewicht |   Ähnlichkeit | Beitrag   |
|-----------------|-----------|---------------|-----------|
| Titel           |        35 |            91 | 31 , 85   |
| Autoren         |        30 |           100 | 30 , 00   |
| Jahr            |        15 |            50 | 7 , 50    |
| Container-Titel |        10 |           100 | 10 , 00   |
| Seiten          |        10 |             0 | 0 , 00    |
| Gesamtscore     |       100 |               | 79 , 35   |

Abschließend erfolgt die Klassifikation basierend auf den konfigurierten Schwellenwerten ( exact match = 100; strong match = 85; possible match = 50). Mit einem Gesamtscore von S = 79 , 35 wird die Referenz als possible match klassifiziert. Dieses Ergebnis zeigt, wie Abweichungen in stark gewichteten Feldern (Titel, Jahr) den Gesamtscore trotz perfekter Übereinstimmungen in anderen Feldern (Autoren, Container-Titel) deutlich reduzieren und eine manuelle Prüfung erforderlich machen.

## 5.5 Systemarchitektur

Die Systemarchitektur setzt den in Abschnitt 5.4 beschriebenen Verifikationsprozess in einer schlanken Client-Server-Struktur um, die explizit auf die Erfüllung der aus der Vorstudie abgeleiteten Anforderungen ausgelegt ist. Sie adressiert zentrale Nutzerbedarfe: nahtlose Integration in den Arbeitsfluss (69 , 4 % Nutzen in der Lehre; 61 , 4% beim Schreiben), transparente Entscheidungsfindung (3 , 3% Wunsch nach Nachvollziehbarkeit), robuste Performance (62 , 8% Problem zeitintensiver Suche) sowie datenschutzkonforme Verarbeitung (1 , 8 % geäußerte Bedenken).

Wie Abbildung 16 zeigt, besteht das System aus drei Ebenen: (A) BrowserErweiterung als Client, (B) Hono-API mit internen Services als Server-Schicht und (C) externe Dienste. Die modulare Architektur folgt den Leitprinzipien der Trennung der Verantwortlichkeiten und Resilienz aus Abschnitt 5.1 und operationalisiert nutzerzentrierte Anforderungen: Die Browser-Erweiterung gewährleistet nahtlose Integration und intuitive Benutzbarkeit (NFR-07; 17 , 5%), während die modulare API-Architektur Wartbarkeit (NFR-10) und deterministische Reproduzierbarkeit (NFR-13) unterstützt.

Die Architektur bildet die vier Phasen des Verifikationsprozesses technisch ab:

Abbildung 16 Systemarchitektur des Referenzverifikationssystems

## Browser-Erweiterung (Frontend)

<!-- image -->

Phase 1 (Extraktion). Die Architektur implementiert die duale Extraktionsstrategie durch zwei spezialisierte Services: den AnyStyle-Service für statistisch trainierte, CRF-basierte Extraktion und den Extraction-Service für LLM-gestützte Verarbeitung. Diese Aufteilung realisiert technisch die in den Designentscheidungen getroffene Wahl komplementärer Ansätze und gewährleistet damit die bedarfsgerechte Unterstützung unterschiedlicher Nutzungsszenarien.

Phase 2 (Kandidatensuche). Durch den Search-Service erfolgt die Abfrage externer wissenschaftlicher Metadatenquellen. Die Auswahl der verfügbaren Quellen (Crossref, OpenAlex, Semantic Scholar, Europe PubMed Central (PMC) und arXiv) folgt einer strategischen Priorisierung, die Redundanz zur Maximierung der potenziellen Abdeckung (Recall) mit Autorität und Datenqualität (Precision) verbindet. Diese Auswahlentscheidung adressiert die Limitation, dass keine einzelne Metadatenquelle vollständig oder perfekt ist, während die konkrete Abfragereihenfolge und -priorisierung durch den Nutzer konfigurierbar bleibt.

Crossref wird aufgrund seiner hohen Autorität als offizieller DOI-Registrar und der exzellenten Datenqualität für formal publizierte Werke angeboten. OpenAlex bietet als Alternative eine umfassende offene Abdeckung, die auch Werke außerhalb von Crossref einschließt. Semantic Scholar ergänzt das Portfolio durch KI-angereicherte Metadaten, die insbesondere bei der Erkennung von Preprints und inhaltlichen Zusammenhängen vorteilhaft sind. Spezialisierte Quellen wie Europe PMC für den biomedizinischen Bereich und arXiv für Preprints schließen domänenspezifische Lücken und adressieren die heterogenen Anforderungen verschiedener Fachrichtungen.

Diese Strategie gewährleistet Robustheit (NFR-05), indem sie keine Abhängigkeit von einer einzelnen Quelle schafft. Gleichzeitig operationalisiert sie die Anforderung REQ-F05 (Auswahl und Priorisierung der wissenschaftlichen Datenbanken) durch die konfigurierbare Datenbankauswahl.

Phase 3 (Feldweiser Vergleich und Scoring). Wird durch den MatchingService realisiert. Dieser Service implementiert den kernalgorithmischen Schritt des Verifikationsprozesses, indem er die normalisierten Metadaten der extrahierten Referenz mit den Kandidaten aus der Suchphase vergleicht. Der Service berechnet für jedes konfigurierte Metadatenfeld eine Ähnlichkeitspunktzahl mittels geeigneter Fuzzy-Metriken (z. B. Levenshtein-Damerau für String-Felder) und aggregiert diese gewichtet zu einem Gesamtscore. Die Gewichtung der Felder ist konfigurierbar, um die unterschiedliche diskriminierende Kraft der Felder zu berücksichtigen (Abschnitt 5.4.1).

Phase 4 (Klassifikation und Evidenzgenerierung). Erfolgt clientseitig in der Browser-Erweiterung. Der vom Matching-Service berechnete Gesamtscore wird anhand der in Abschnitt 5.4.1 begründeten konfigurierbaren Schwellenwerte in die Entscheidungsklassen Exact Match , Strong Match , Possible Match oder No Match eingeordnet. Die Browser-Erweiterung generiert eine detaillierte Evidenzdarstellung, die dem Nutzer die Entscheidung nachvollziehbar macht. Diese umfasst die gefundenen Kandidaten, die feldweisen Vergleiche und die Score-Aufschlüsselung, was die Anforderung der transparenten Entscheidungsdarstellung (NFR-04) erfüllt.

Die Aufteilung der Phasen 3 und 4 zwischen Server und Client ist eine bewusste Entscheidung. Der Matching-Service als Server-Komponente gewährleistet die deterministische und reproduzierbare Berechnung des Scores (NFR-13). Die Klassifikation und Evidenzgenerierung im Client ermöglicht eine sofortige, responsive Darstellung der Ergebnisse ohne zusätzliche Server-Kommunikation und gibt dem Nutzer die Möglichkeit, die Klassifikation bei Bedarf lokal anzupassen (z. B. durch Änderung der Schwellenwerte) ohne die Notwendigkeit einer erneuten Server-Anfrage.

## 5.6 Zusammenfassung

Dieses Kapitel hat die Konzeption der Browser-Erweiterung zur formalen Referenzverifikation vorgestellt. Die Konzeption stellt eine Synthese aus den empirischen Befunden der Vorstudie und dem theoretischen Rahmenwerk des ER-Paradigmas aus Abschnitt 2.2.2 dar. Ausgehend von einem Zielbild, das die zentralen Probleme der Nutzer adressiert, nämlich den zeitintensiven Aufwand, die inkonsistente Formatierung und nicht-existente Referenzen, wurden prioritäre funktionale und nicht-funktionale Anforderungen abgeleitet. Diese wurden in nutzerzentrierten Use Cases für die Hauptanwendungskontexte (Lesen und Schreiben) operationalisiert.

Den konzeptionellen Kern bildet der deterministische Verifikationsprozess, der als Instanz des ER-Paradigmas modelliert ist. Zentrale Designentscheidungen, wie die mehrstufige Klassifikation, die duale Extraktionsstrategie, das gewichtete ScoringModell und die konfigurierbaren Schwellenwerte, wurden eingehend begründet. Der darauf aufbauende, schlanke Client-Server-Architektur-Entwurf mit einer Hono-API als fachlichem Kern bildet die vier Prozessphasen (Extraktion, Kandidatensuche, Matching, Klassifikation) technisch ab. Die Konzeption bildet damit die verbindliche und fundierte Grundlage für die technische Realisierung im folgenden Implementierungskapitel.

## 6 Implementierung

Dieses Kapitel beschreibt die technische Umsetzung der in Kapitel 5 konzipierten Browser-Erweiterung zur Referenzverifikation. Im Mittelpunkt stehen die architektonischen Lösungsansätze, zentralen Implementierungsentscheidungen und die Bewältigung praktischer Herausforderungen. Ziel ist es, die Überführung der konzeptionellen Vorgaben in funktionsfähige Software nachvollziehbar darzulegen.

Die Darstellung beginnt mit der Implementierungsstrategie und Qualitätssicherung in Abschnitt 6.1. Anschließend werden die Kernkomponenten detailliert erläutert: die Browser-Erweiterung als Benutzerschnittstelle (Abschnitt 6.2), die Hono-APIServices als serverseitiger Anwendungskern (Abschnitt 6.3) sowie die Integration externer Dienste (Abschnitt 6.4). Das Kapitel schließt mit einer zusammenfassenden Einordnung der Implementierungsergebnisse (Abschnitt 6.5).

Der vollständige Quellcode ist auf der beigefügten CD enthalten.

## 6.1 Implementierungsstrategie

Die Implementierungsphase verfolgte drei Hauptziele: Erstens die Umsetzung der konzeptionellen Vorgaben gemäß der in Abschnitt 5.2 definierten funktionalen und nicht-funktionalen Anforderungen mit MoSCoW-Priorisierung. Zweitens eine robuste, wartbare Architektur mit klarer Trennung der Zuständigkeiten, typsicheren Schnittstellen und dokumentierten Komponenten zur langfristigen Erweiterbarkeit. Drittens Praxistauglichkeit und Nutzerfreundlichkeit durch iterative Entwicklung und frühe manuelle Tests zur Sicherstellung korrekter Funktion, angemessener Performance und intuitiver Bedienbarkeit.

Implementierungsansatz und Technologiestack. Die Implementierung folgte einem iterativ-inkrementellen Vorgehen: Zunächst wurde ein funktionsfähiger Kern entwickelt, der in mehreren Erweiterungsiterationen schrittweise ausgebaut wurde. Die Priorisierung der Funktionen orientierte sich am MoSCoW-Prinzip ('Must-have' vor 'Should-have' und 'Could-have'). Zentrale Leitlinien waren eine typsichere Entwicklung mit durchgängigem TypeScript im Frontend und Backend, ein API-first-Design für parallele Entwicklungsstränge sowie eine fortlaufende manuelle Testverifikation an realen Beispielreferenzen.

Die Technologieauswahl richtete sich nach Typsicherheit, guter Performance, hoher Browserkompatibilität und einer angenehmen Entwicklererfahrung. Das Frontend basiert auf dem Template vitesse-webext (Fu, 2021) und nutzt Vue 3, TypeScript und Vite mit Hot Module Replacement (HMR). Es ist für Browser-Extensions unter Manifest V3 optimiert. Das Backend verwendet Node.js mit Hono als schlankem Web-Framework, Zod für typsichere Validierungen, das OpenAI-SDK für die LLMIntegration sowie AES-256-GCM für die Verschlüsselung. Zusätzlich wurden externe APIs (OpenAlex, Crossref, Semantic Scholar, Europe PMC, arXiv) angebunden und AnyStyle über einen Ruby-basierten Sinatra-Service eingebunden.

Projektstruktur und Entwicklungsumgebung. Das Projekt ist als Monorepo organisiert mit Workspaces für Extension (Vue 3 + Vuetify), API (Hono + AnyStyleService) und Dokumentation (VitePress), ergänzt durch geteilte Typdefinitionen und zentrale ESLint-Konfiguration. Diese Struktur fördert Code-Wiederverwendung und unterstützt Trennung der Verantwortlichkeiten sowie Wartbarkeit (NFR-10).

Die Entwicklungsumgebung umfasst Git mit einem klar strukturierten BranchWorkflow, pnpm für die Monorepo-Verwaltung und Docker Compose für eine einheitliche lokale Umgebung. Dazu kommen getrennte Vite-Konfigurationen für die verschiedenen Extension-Kontexte, ESLint im TypeScript-Strict-Mode sowie HMR mit Live-Reload für eine schnelle und effiziente Entwicklung.

Qualitätssicherung. Die Qualitätssicherung wurde durch manuelle Testverifikation mit schrittweiser Funktionsvalidierung, browser-spezifischen Tests in Chrome und Firefox sowie Integrationsprüfungen der API-Endpunkte gewährleistet. CodeQuality-Gates umfassten TypeScript Strict-Mode für statische Analyse, ESLint für konsistenten Code-Stil und Pre-Commit-Hooks für automatisierte Prüfungen. Aufgrund projektspezifischer Rahmenbedingungen wurden keine automatisierten Unitoder Integrationstests implementiert, was einen transparenten Trade-off zwischen Funktionsumfang und Testabdeckung im gegebenen Zeitrahmen darstellt.

Durch diese Methodik entstand ein robustes, erweiterbares System, das trotz begrenzter Ressourcen eine hohe funktionale Vollständigkeit und Codequalität erreichte. Die folgenden Abschnitte beschreiben die Umsetzung der einzelnen Komponenten und Schnittstellen, beginnend mit der Browser-Erweiterung als zentralem Interaktionspunkt.

## 6.2 Umsetzung der Browser-Erweiterung

Dieser Abschnitt beschreibt die technische Realisierung der Browser-Erweiterung, die als zentrale Benutzerschnittstelle für die Referenzverifikation dient. Die Erweiterung wurde als Vue-3-basierte WebExtension mit Manifest V3 implementiert und folgt einem Schichtenmodell, das die Trennung der Verantwortlichkeiten gewährleistet. Die Architektur umfasst vier Kernkomponenten: Die Seitenleiste als primäre Arbeitsumgebung für Batch-Verifikationen und Detailanalysen, das Pop-up für kontextbezogene Einzelverifikationen, das Background Script zur zentralen Orchestrierung und Ereignisverwaltung sowie die Optionen-Seite zur Konfiguration der Verifikationseinstellungen und API-Schlüssel.

Hinweis zur Darstellung: Alle in diesem Kapitel gezeigten Screenshots stellen bewusst gewählte Ausschnitte der Benutzeroberfläche dar und fokussieren jeweils die relevanten Funktionsbereiche. Andere UI-Elemente wurden zugunsten der Lesbarkeit und Platzökonomie ausgeblendet. Ergänzende vollständige Ansichten der Benutzeroberfläche befinden sich auf der beiliegenden CD.

## 6.2.1 Benutzeroberfläche und Workflow

Die Benutzeroberfläche implementiert einen dreistufigen Workflow (Extrahieren, Bearbeiten, Verifizieren), der über verschiedene Interface-Komponenten realisiert wird (Abbildung 17).

## Abbildung 17

Hauptansicht der Benutzeroberfläche zur Referenzverifikation

<!-- image -->

Extrahieren. Das Extraktions-Interface (Abbildung 18) stellt beide Extraktionspipelines bereit: die LLM-gestützte Pipeline und die statistisch trainierte AnyStylePipeline. Nutzende können Referenzen per Drag-and-Drop als PDF hinzufügen oder direkt als Text einfügen.

Bei PDF-Import wird der Text lokal extrahiert und zur manuellen Bearbeitung in die Textarea eingefügt, bevor die Extraktion startet. Da hierbei unformatierter Rohtext entsteht, wird dieser Import primär für die KI-Extraktion empfohlen, die mit unstrukturierten Eingaben umgehen kann.

Die Bedienelemente sind intelligent gekoppelt: Standardmäßig ist nur der AnyStyleButton aktiviert, da die KI-Extraktion einen konfigurierten API-Key voraussetzt. Zudem passt sich der Platzhaltertext in der Textarea dynamisch an den gewählten Extraktionsmodus an. Für AnyStyle wird ein strukturiertes Referenzformat empfohlen, während die KI-gestützte Extraktion auch unstrukturierte Eingaben verarbeitet.

Der Datenfluss unterscheidet sich technisch zwischen den Pipelines: Bei 'Parse References' werden die strukturierten Referenzen in ein Array von Einzelreferenzen aufgeteilt und an /api/anystyle/parse gesendet. Bei 'AI-Extract References' wird der gesamte Textinhalt unverändert an /api/extract übermittelt, wobei zusätzlich der X-Client-Id Header mitgesendet wird, um im Backend den für diesen Nutzer konfigurierten API-Key zuzuordnen. Die KI-Extraktion erfolgt in einem Schritt.

Die parallelen Extraktionspipelines sind klar gekennzeichnet, wobei AnyStyle als Standard gewählt ist, da es deterministisch und kostenfrei arbeitet.

## Abbildung 18

Benutzeroberfläche zur Referenzextraktion

## 1. Extract

Input references or files

<!-- image -->

PDF File

- Vaswani, A., Shazeer, N.M., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A.N., Kaiser, L., &amp; Polosukhin, I. (2017). Attention is All you Need. Neural Information Processing Systems.
- &lt;&gt;1 PARSE REFERENCES

/1

AI EXTRACT REFERENCES

Bearbeiten. Nach dem AnyStyle-basierten Parsen werden die Referenzen im Backend tokenisiert, wobei jedes Token ein semantisches Label (Autor, Titel, Jahr, etc.) erhält. Die resultierenden Token-Label-Paare werden als strukturiertes Array an das Frontend übergeben und im Token-Editor (Abbildung 19) zur manuellen Validierung und Korrektur dargestellt. Diese Architektur ermöglicht eine präzise Nachbearbeitung durch visuelle Unterscheidung der Token-Typen mittels farblicher Hinterlegung sowie interaktive Korrekturmöglichkeiten über Dropdown-Menüs zur Neuzuordnung von Labels oder Entfernen irrelevanter Tokens. Dadurch setzt der Editor REQ-F14 (Korrektur und Re-Check) um und erhöht die Zuverlässigkeit der Extraktion gemäß NFR-01.

## Abbildung 19

Token-Editor zur manuellen Validierung und Korrektur von AnyStyle-Tokens

## 2. Edit

Review and relabel parsed references

V

<!-- image -->

Vaswani, A., Shazeer, N.M., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A.N., Kaiser, L., &amp; Polosukhin, I. (2017). Attention is All you Need. Neural Information Processing Systems.

<!-- image -->

Verifizieren. Das Verifikations-Interface (Abbildung 20) bildet das zentrale Steuerungselement für die Referenzverifikation. Der Verifikationsprozess variiert je nach Extraktionspipeline: Bei LLM-Extraktion startet die Verifikation automatisch, da die Metadaten bereits als CSL-JSON vom Backend zurückgegeben werden und keine manuelle Nachbearbeitung ermöglichen. Bei AnyStyle-Parsing kann der Nutzer nach der Token-Korrektur die Verifikation manuell initiieren, wobei die korrigierten Token-Label-Paare an /api/anystyle/convert-to-csl gesendet und als CSL-JSON zurückgegeben werden.

Sobald die Referenzdaten in CSL-JSON vorliegen, wird der Verifikationsprozess gestartet: Jede Referenz wird nacheinander an die in den Einstellungen konfigurierten Datenbanken ( /api/search/:database ) gesendet, wobei die festgelegte Prioritätsreihenfolge strikt eingehalten wird. Nach jeder Suche in einer Datenbank wird sofort /api/match mit dem gefundenen Kandidaten ausgeführt, um die Early-TerminationLogik anzuwenden. Diese ermöglicht es, die Suche abzubrechen sobald ein Kandidat mit dem konfigurierbaren Mindest-Score (z. B. 85 %) gefunden wurde, was die Performance erheblich optimiert (NFR-02, NFR-03).

Die Verify-Schaltfläche startet die Verifikation mit Abbruchmöglichkeit, während Statusanzeigen eine Echtzeitübersicht mit Farbcodierung bieten (Exact Matches in Grün, Strong Matches in Grün, Possible Matches in Orange und No Matches in Rot). Filter- und Suchfunktionen umfassen Status-Filter zur Filterung der Referenzliste nach Verifikationsstatus, ein Suchfeld für Volltextsuche über Referenzmetadaten und Echtzeit-Filterung bei Änderungen. Die Referenzenliste zeigt jeden Eintrag mit der entsprechenden Farbcodierung, Titel, Publikationstyp, Metadaten, Match-Score sowie Aktionsschaltflächen zum Öffnen der Literatur und der Detailansicht.

Abbildung 20 Benutzeroberfläche zur Referenzverifikation

<!-- image -->

Bericht. Die evidenzbasierte Ergebnisdarstellung (Abbildung 21) zeigt in der Detailansicht einer Referenz eine transparente Evidenzdarstellung, die die Transparenzanforderungen (NFR-04) umsetzt. Die Metadatensektion bietet eine vollständige Auflistung aller erkannten Felder mit Kopierfunktionen und Direktöffnungsmöglichkeiten. Die Quellenvergleichssektion listet alle abgefragten Quellen mit Markierung der besten Quelle und Score-Anzeige. Die feldweise Score-Darstellung (Abbildung 22) zeigt für jede Quelle die Aufschlüsselung der Feld-Scores mit farbcodierter Bewertung von hoher (grün) bis geringer Übereinstimmung (rot).

Abbildung 21

Benutzeroberfläche zur Anzeige verifizierter Referenzmetadaten

<!-- image -->

## 6.2.2 Konfiguration und Anpassbarkeit

Die Optionen-Seite bietet umfassende Kontrollmöglichkeiten, die den in der Vorstudie geäußerten Wünschen nach Anpassbarkeit und Transparenz entsprechen. Die Konfiguration ist in fünf klar getrennte Bereiche unterteilt, die im Folgenden detailliert beschrieben werden.

Extraktionskonfiguration. Die Extraktionskonfiguration ermöglicht die präzise Steuerung der Extraktionsparameter. Wie Abbildung 23 zeigt, lässt sich über Checkboxen festlegen, welche CSL-JSON-Felder während der LLM-gestützten Extraktion erkannt werden (REQ-F02). Die selektierten Felder werden als Array zusammen mit dem Text an /api/extract gesendet, wo sie im Backend für die gezielte Extraktion der relevanten Metadaten genutzt werden. Diese selektive Feldauswahl optimiert die Extraktionsgenauigkeit, reduziert die Verarbeitungskomplexität und minimiert die Token-Nutzung bei den LLM-Aufrufen.

Abbildung 23

Benutzeroberfläche zur Konfiguration der Felder für die LLM-Extraktion

<!-- image -->

Datenbankkonfiguration. Die Datenbankkonfiguration (Abbildung 24) bietet die Aktivierung externer Dienste (Crossref, OpenAlex, Semantic Scholar u. a.) gemäß REQ-F05. Die Konfiguration wird ausschließlich lokal im Client gespeichert und nicht an das Backend gesendet, da der Browser-Client während der Verifikation eigenständig entscheidet, in welcher Datenbank in welcher Reihenfolge gesucht wird. Nutzer können die Priorität der Datenbankabfragen per Drag-and-Drop festlegen und durch Early Termination mit einstellbarem Ähnlichkeits-Score (z. B. 85 %, Abbildung 25) die Suchperformance optimieren. Diese clientseitige Orchestrierung trägt maßgeblich zu den Performance-Anforderungen NFR-02 und NFR-03 bei.

Matching-Konfiguration. Die Matching-Konfiguration steuert Determinismus und Transparenz des Kernalgorithmus in drei Blöcken. Der Normalisierungsmodus (Abbildung 27) bietet drei Voreinstellungen gemäß REQ-F06. Strict ist für exakte 1:1-Vergleiche ohne Normalisierung konzipiert. Hier führen bereits kleinste Abweichungen wie ein Punkt zu Score-Verlusten. Balanced ermöglicht eine intelligente Normalisierung typischer Datenbankvarianzen, beispielsweise bei Titeln mit oder ohne Punkt. Custom schließlich erlaubt eine benutzerdefinierte Regelauswahl. Die ausgewählten Regeln werden an /api/match gesendet und umfassen:

Abbildung 24

Benutzeroberfläche zur Konfiguration der Datenbankaktivierung und -priorität

| ……:   | OpenAlex Open catalog of scholarly works, authors, venues, institutions, and concepts                    | Priority: 1 O   |
|-------|----------------------------------------------------------------------------------------------------------|-----------------|
| ……:   | Crossref Comprehensive database of academic publications with DOI registration                           | Priority: 2 O   |
| ……:   | Semantic Scholar Al-powered academic search engine with paper insights and recommendations               | Priority: 3 O   |
|       | Europe PMC European database for biomedical and life sciences literature                                 | Priority: 4 Q   |
|       | arXiv Open-access repository for preprints in physics, mathematics, computer science, and related fields | Priority: 5 Q   |

Abbildung 25

<!-- image -->

- -Normalisierungsregeln : Typografie (Anführungszeichen, Gedankenstriche), Kleinschreibung, Identifikatoren (DOI/ISBN-Präfixe entfernen), Zeichenkorrektur, Leerzeichenbereinigung, Akzente- und Umlautenormalisierung, Satzzeichenbereinigung, Unicode-Standardisierung und URL-Normalisierung
- -Matching-Heuristiken : Strukturierte Datumsabgleiche (±1 Jahr Toleranz), AutorenMatching über Initialen, numerische Band-/Heftnummernextraktion, SeitenbereichsÜberlappung und Variantentitel-Erkennung

Die Feldauswahl und Gewichtung (Abbildung 28) ermöglicht die präzise Steuerung des Matching-Algorithmus. Die Feldauswahl erlaubt es dem Nutzer, bereits im Vorhinein zu bestimmen, welche Felder beim Matching berücksichtigt werden sollen. So kann beispielsweise ausschließlich der Titel für den Abgleich aktiviert werden. Zusätzlich kann durch die konfigurierbare Gewichtung der Einfluss jedes Feldes auf den Gesamt-Score exakt kalibriert werden. Die aktivierten Felder und ihre Gewichtungen werden an /api/match gesendet, wo sie im Backend für die ScoreBerechnung verwendet werden. Diese Funktionalität setzt REQ-F07 und REQ-F09 um und bietet durch die Echtzeitvalidierung der Gewichtungssumme (NFR-12) eine intuitive Konfigurationsoberfläche.

Anpassbare Schwellenwerte (Abbildung 26) für Strong Match und Possible Match setzen REQ-F10 um. Diese ermöglichen es dem Nutzer, selbst zu entscheiden, ab welchem Score-Wert Referenzen in der Ergebnisliste als exakte, starke oder mögliche Übereinstimmungen klassifiziert und entsprechend farblich markiert werden. Die Schwellenwerte werden ausschließlich clientseitig verwendet, da das Backend lediglich die Roh-Scores zurückliefert und die eigentliche Klassifizierung im BrowserClient erfolgt.

KI-Anbieter-Konfiguration. Die KI-Anbieter-Konfiguration (Abbildung 29) umfasst die Einrichtung der LLM-gestützten Extraktion mit Auswahl von Anbietern (OpenAI, Anthropic, GoogleGemini, DeepSeek) und Modellen. Für jede BrowserErweiterung wird eine einmalige Client-ID generiert und im Local Storage gespeichert, die als X-Client-Id -Header bei allen API-Key-Operationen mitgesendet wird. Die folgenden Endpunkte werden für das Schlüsselmanagement verwendet:

- -POST /api/user/ai-secrets zum einmaligen Speichern des eingegebenen APISchlüssels,
- -DELETE /api/user/ai-secrets?provider=... zum Entfernen des API-Schlüssels des jeweiligen Anbieters,
- -GET /api/user/ai-secrets?provider=... zur Überprüfung, ob ein Schlüssel vorhanden ist.

Basierend auf dem Ergebnis der GET -Abfrage werden die Test- und Lösch-Buttons in der Oberfläche aktiviert oder deaktiviert. Diese Architektur gewährleistet eine sichere

## Abbildung 26

Benutzeroberfläche zur Konfiguration der Klassifikationsschwellenwerte

Abbildung 27

Benutzeroberfläche zur Auswahl des Normalisierungsmodus

O

Exact Match Threshold

100%

Perfect matches at 100% similarity

Q

Strong Match Threshold

85 %

Minimum score for green 'strong match' indicator

Possible Match Threshold

50 %

Minimum score for orange 'possible match' indicator

No Match

%0%&gt;

References below the possible match threshold

Strict

O

Exact matches only - every character, capitalization, and format must match precisely

Balanced

O

Case-insensitive with minor format differences allowed

Custom

User-defined matching rules and tolerance levels

Configure detailed matching behavior and tolerance levels for custom mode

Normalize Typography

Fix encoding and special characters

Normalize to Lowercase

②

Convert to lowercase

Normalize Identifiers

Standardize DOI, ISBN, etc.

Normalize Characters

②

Fix corrupted characters

Normalize Whitespace

Clean up spacing

<!-- image -->

<!-- image -->

Schlüsselverwaltung ohne persistente Speicherung im Client sowie eine Validierungsfunktion zur Überprüfung der Schlüsselgültigkeit. Die Trennung der API-Keys von der Client-Seite bietet zusätzliche Sicherheit.

Abbildung 29 Benutzeroberfläche zur Konfiguration der KI-Anbieter und API-Schlüssel

<!-- image -->

Allgemeine Einstellungen. Zusätzliche allgemeine Einstellungen bieten Sprachumschaltung (Deutsch/Englisch), Auswahl des Anzeigemodus (Seitenleiste/Popup) und Design-Themes (System, Hell, Dunkel). Diese Anpassungsmöglichkeiten unterstützen die Nutzerfreundlichkeit im Sinne von NFR-07 und ermöglichen eine individuelle Arbeitsumgebung.

Die Optionen-Seite wurde als Single-Page-Application mit Vue 3 und Vuetify umgesetzt. Änderungen werden unmittelbar in localStorage gespeichert, wobei direktes Validierungsfeedback und Tooltips mit Erläuterungen eine niedrige Einstiegshürde unterstützen.

## 6.3 Implementierung der Hono-API-Services

Dieser Abschnitt beschreibt die Realisierung der serverseitigen Komponenten als fachlichen Kern der Anwendung. Die modulare API-Architektur auf Basis des HonoFrameworks setzt die in Abschnitt 5.5 definierten Services technisch um.

Die Backend-API ist als Sammlung modularer Services strukturiert, die jeweils eine klar abgegrenzte fachliche Domäne abdecken. Jeder Service wird als eigener Hono-Router implementiert und im Hauptrouter registriert, was die Trennung der Verantwortlichkeiten fördert und Wartung sowie Erweiterung erleichtert (NFR-10). Tabelle 9 gibt einen Überblick über die implementierten Services und ihre Zuständigkeiten.

Tabelle 9 Modulare API-Services der Architektur

| Service    | Endpunkt             | Zweck                   |
|------------|----------------------|-------------------------|
| Extraktion | /api/extract         | LLM-basierte Extraktion |
| AnyStyle   | /api/anystyle/*      | CRF-basierte Extraktion |
| Suche      | /api/search:database | Kandidatensuche         |
| Matching   | /api/match           | Kandidatenvergleich     |
| Benutzer   | /api/user/*          | Schlüsselverwaltung     |

Die Umsetzung folgt der konzeptionellen Architektur mit einer klaren Arbeitsteilung zwischen Backend (Datenverarbeitung, Validierung, Vergleich) und Frontend (Orchestrierung, Klassifikation, Darstellung).

Extraction-Service. Der Extraction-Service fungiert als Proxy für die LLMgestützte Extraktion. Der Service empfängt Anfragen vom Frontend über den folgenden Endpunkt:

- -POST /api/extract für die Übergabe des zu extrahierenden Textes, der KIKonfiguration (Modell und Anbieter), der ausgewählten CSL-JSON-Felder sowie des X-Client-Id -Headers.

Die Daten werden unverändert an den entsprechenden LLM-Anbieter weitergeleitet, dessen konkrete Implementierung im Abschnitt 6.4 detailliert beschrieben wird. Der Service gibt die extrahierten Metadaten im CSL-JSON-Format an das Frontend zurück und behandelt Fehler konsistent innerhalb des API-Fehlermanagements.

AnyStyle-Service. Der AnyStyle-Service fungiert als Proxy zwischen der BrowserErweiterung und der AnyStyle-API. Der Service empfängt Anfragen vom Frontend und leitet sie unverändert an die entsprechende AnyStyle-API weiter. Dabei kommen die folgenden Endpunkte zum Einsatz:

- -POST /api/anystyle/parse für die Tokenisierung von Referenz-Arrays,
- -POST /api/anystyle/convert-to-csl für die Konvertierung von Token-LabelPaaren in CSL-JSON.

Die Ergebnisse der AnyStyle-API werden anschließend unverändert an das Frontend zurückgegeben. Diese Proxy-Architektur kapselt die Interaktion mit dem AnyStyleParser und gewährleistet eine konsistente Fehlerbehandlung, indem Antworten und Fehler der AnyStyle-API einheitlich auf das HTTP/JSON-Fehlerhandling der HauptAPI abgebildet werden. Die konkrete Implementierung der AnyStyle-Integration wird im Abschnitt 6.4 detailliert beschrieben.

Search-Service. Der Search-Service ermöglicht die Suche nach Kandidaten in den konfigurierten Metadatenquellen. Der Service empfängt Anfragen vom Frontend über den folgenden Endpunkt:

- -POST /api/search/:database für die Übergabe der Referenz im CSL-JSONFormat sowie des gewünschten Datenbanknamens (z. B. /api/search/crossref ).

Die Anfrage wird anschließend an den entsprechenden Datenbank-Adapter weitergeleitet, der die spezifische Implementierung der Datenbankabfrage übernimmt. Die detaillierte Beschreibung der Datenbankadapter, einschließlich Parameter-Mapping, Ergebnisnormalisierung und Fehlerbehandlung, erfolgt in Abschnitt 6.4. Der SearchService gibt die gefundenen Kandidaten einheitlich im CSL-JSON-Format zurück, wodurch eine konsistente Weiterverarbeitung im Matching-Service gewährleistet wird.

Matching-Service. Der Matching-Service implementiert den kernalgorithmischen Schritt des feldweisen Vergleichs und der Score-Berechnung (NFR-13). Der Service empfängt Anfragen vom Frontend über den folgenden Endpunkt:

- -POST /api/match für die Übergabe der Referenz im CSL-JSON-Format, des Kandidaten-Arrays, der ausgewählten Normalisierungsregeln sowie der konfigurierten Matching-Felder mit deren Gewichtung.

Der Service koordiniert das Matching der Referenz mit jedem Kandidaten in folgenden Schritten:

- -Feldweise Verarbeitung : Für jeden Kandidaten werden nur die in beiden Dokumenten (Referenz und Kandidat) vorhandenen und in der Konfiguration aktivierten Felder verglichen, um faire Vergleiche zu gewährleisten
- -Vorverarbeitung : Auf die einzelnen Feldwerte werden die konfigurierten Normalisie-

rungsregeln und Matching-Heuristiken angewendet

- -Ähnlichkeitsberechnung : Die normalisierten Feldwerte werden mittels DamerauLevenshtein-Distanz verglichen, woraus ein Score zwischen 0 und 1 pro Feld resultiert
- -Gesamt-Score-Berechnung : Anhand der konfigurierten Feldgewichtungen wird aus den Einzel-Scores der gewichtete Gesamt-Score berechnet

Das Ergebnis umfasst für jeden Kandidaten die detaillierten Feld-Scores und den Gesamt-Score. Die Klassifizierung (exact/strong/possible/no match) erfolgt clientseitig basierend auf den konfigurierbaren Schwellenwerten, was API-Zustandslosigkeit und Determinismus bewahrt.

User-Secrets-Service. Der User-Secrets-Service verwaltet die nutzerspezifischen KI-API-Schlüssel sicher serverseitig. Er stellt folgende Endpunkte bereit:

- -POST /api/user/ai-secrets : Speichert den gewählten Anbieter sowie den zugehörigen API-Key serverseitig.
- -GET /api/user/ai-secrets?provider=... : Gibt den aktuellen Schlüsselstatus für den angegebenen Anbieter zurück.
- -DELETE /api/user/ai-secrets?provider=... : Entfernt den vorhandenen Schlüssel idempotent vom Server.

Alle /api/user* Routen erfordern den X-Client-Id Header zur Nutzeridentifikation. Die Speicherung erfolgt über eine Keystore-Abstraktion, die Schlüssel im Backend-Keystore unter .keystore/ (als Docker-Volume) persistiert. Jeder Schlüssel wird unter einem Key aus Nutzer-ID und Anbieter-Namen gespeichert.

Die Verschlüsselung verwendet AES-256-GCM mit einem serverseitigen Schlüsselmaterial. Der Ciphertext wird im Base64-Layout gespeichert, was eine sichere Aufbewahrung der sensiblen API-Schlüssel gewährleistet.

Diese Implementierung mit Client-ID und Keystore ermöglicht eine nutzerspezifische Schlüsselverwaltung ohne aufwändige Nutzerkonten oder Authentifizierungssysteme , was die Benutzerfreundlichkeit erheblich steigert und den Einstieg in das Tool vereinfacht.

## 6.4 Integration externer Dienste

Die Funktionalität der Anwendung beruht maßgeblich auf der zuverlässigen Integration mehrerer externer Dienste. Dieser Abschnitt beschreibt die technische Anbindung der Metadatenquellen, LLM-Anbieter und des AnyStyle-Parsers unter besonderer Berücksichtigung von Fehlerbehandlung, Konsistenzsicherung und Performance.

Metadatenquellen. Die Ermittlung potenzieller Kandidaten für den Abgleich erfolgt über verschiedene heterogene Metadaten-APIs (Crossref, OpenAlex, Semantic Scholar, Europe PMC, arXiv). Um trotz unterschiedlicher Schnittstellendefinitionen konsistente Ergebnisse zu erzielen, wurde für jede Datenbank ein spezifischer Adapter implementiert, der drei zentrale Aufgaben erfüllt:

- -Transformation der Anfrage : Konvertierung der internen CSL-JSON-Referenz in das von der externen API erwartete Abfrageformat
- -Ausführung der HTTP-Kommunikation : Durchführung der API-Abfrage unter Berücksichtigung von Rate-Limits, Timeouts und Zugriffsbeschränkungen
- -Normalisierung der Antwort : Umwandlung der heterogenen API-Antworten in das interne, einheitliche Kandidatenformat (CSL-JSON)

Fehler wie Rate-Limit-Überschreitungen oder Timeouts werden im Adapter abgefangen und protokolliert. Der Search-Service behandelt solche Fälle robust, indem er das Fehlschlagen einer Abfrage als 'kein Kandidat' interpretiert und eine leere Ergebnisliste zurückgibt. Zur Einhaltung der Nutzungsbedingungen werden anbieterspezifische Anforderungen umgesetzt, etwa korrekte User-Agent -Header für Crossref oder feste Verzögerungen zwischen Anfragen für arXiv.

LLM-Anbieter. Die Integration der LLM-Anbieter (OpenAI, Anthropic, Google Gemini, DeepSeek) folgt einem vereinheitlichten, OpenAI-kompatiblen Ansatz. Basierend auf den vom Frontend mitgesendeten CSL-JSON-Feldern wird dynamisch ein JSON-Schema generiert, das über response\_format=json\_schema an die Anbieter-API übergeben wird. Dieser Mechanismus stellt sicher, dass das LLM keine zusätzlichen Felder erfindet und exakt die gewünschte Struktur zurückgibt.

Ein abgestimmtes Prompt-Paar liefert präzise Instruktionen für die Extraktion und weist die KI explizit an, keinerlei Veränderungen oder Normalisierungen am Originaltext vorzunehmen. Diese strikte Texttreue gewährleistet, dass das nachfolgende Matching nicht durch vorherige Bearbeitung beeinflusst wird.

Die Antwort des LLM wird anschließend mittels Zod validiert, um die konforme Struktur der extrahierten Metadaten sicherzustellen. API-Schlüssel werden nicht im Client gespeichert, sondern der Server lädt den verschlüsselten Schlüssel pro Nutzer und Anbieter zur Laufzeit. Für nicht JSON-Schema unterstützende Anbieter wird ein Fallback auf json\_object mit anschließender Zod-Validierung implementiert.

AnyStyle-API. Die AnyStyle-API wird als eigenständiger Microservice auf RubyBasis betrieben, da die AnyStyle-Bibliothek nur in dieser Programmiersprache verfügbar ist und nicht direkt in die Node.js-basierte Haupt-API integriert werden kann. Der AnyStyle-Service in der Hono-API dient als Vermittler zwischen der Haupt-API und dem Ruby-Service.

Die AnyStyle-API bietet zwei zentrale Funktionen über spezifische Endpunkte:

- -POST /parse : Führt eine Referenz-Tokenisierung durch und zerlegt eingegebene Referenztexte in einzelne Bestandteile (Tokens), denen semantische Labels wie Autor, Titel oder Jahr zugewiesen werden.
- -POST /convert-to-csl : Überführt die erzeugten Token-Label-Paare in das standardisierte CSL-JSON-Format.

Der Tokenisierungsprozess analysiert die Referenztexte und identifiziert automatisch die verschiedenen Komponenten wissenschaftlicher Referenzen. Für die Konvertierung werden die tokenisierten Referenzen in das einheitliche Austauschformat CSL-JSON transformiert, das im gesamten System verwendet wird.

Diese technologische Entkopplung isoliert die Haupt-API gegenüber möglichen Instabilitäten des Parsers und erlaubt unabhängige Skalierung sowie Aktualisierung der Komponenten, was Wartbarkeit und Fehlerisolation verbessert.

Diese Architektur gewährleistet eine robuste, skalierbare und typensichere Integration externer Systeme und erfüllt damit die Anforderungen an Verlässlichkeit (NFR-01), Performance (NFR-02) und Wartbarkeit (NFR-10).

## 6.5 Zusammenfassung

Dieses Kapitel hat die technische Umsetzung der in Kapitel 5 konzipierten BrowserErweiterung zur Referenzverifikation dargestellt. Auf Basis der konzeptionellen Vorgaben wurde ein funktionsfähiger, typsicherer Prototyp entwickelt, der die wesentlichen funktionalen und nicht-funktionalen Anforderungen erfüllt.

Die Implementierung folgte einem iterativ-inkrementellen Ansatz mit modernem Technologiestack (Vue 3, TypeScript, Hono.js) und resultierte in einer Architektur mit klarer Trennung der Zuständigkeiten zwischen komponentenbasierter BrowserErweiterung (Frontend) und modularer Hono-API (Backend). Die Integration des mehrstufigen Workflows (Extraktion, Bearbeitung, Verifikation) gelang durch eine geführte Benutzeroberfläche mit umfassenden Konfigurationsmöglichkeiten.

Die Architektur operationalisierte die zentralen nicht-funktionalen Anforderungen durch durchgängige Type-Safety und eine defensive Integration externer Dienste mit Fehlertoleranz. Zudem sorgt die clientseitige Orchestrierung für eine transparente Steuerung des Verifikationsprozesses. Ergänzend stellen modulare API-Services eine wartbare und erweiterbare Backend-Logik sicher.

Die implementierte Lösung bildet eine technisch stabile, konzeptionell konsistente und praxistaugliche Grundlage für die systematische Evaluation in Kapitel 7. Der Prototyp demonstriert die Machbarkeit des konzipierten Systems und ermöglicht eine umfassende Bewertung der Referenzverifikation in realen Anwendungsszenarien.

## 7 Evaluation

Dieses Kapitel stellt die systematische Evaluation der Browser-Erweiterung zur formalen Referenzverifikation aus technischer Perspektive dar. Im Mittelpunkt steht die Überprüfung, inwieweit das entwickelte Tool die definierten funktionalen und nicht-funktionalen Anforderungen (Kapitel 5) hinsichtlich Korrektheit, Performance und Robustheit erfüllt. Die Evaluation konzentriert sich auf die technische Leistungsfähigkeit des Systems anhand quantitativer Messungen.

Die Struktur des Kapitels gliedert sich wie folgt: Zunächst werden in Abschnitt 7.1 die Evaluationsziele und -kriterien definiert. Abschnitt 7.2 beschreibt das methodische Vorgehen inklusive Evaluationssetup, Datensätzen und Konfiguration. Darauf folgt in Abschnitt 7.3 die Präsentation der Ergebnisse, strukturiert entlang vier zentraler Dimensionen: Verifikationsgenauigkeit, Robustheit gegenüber Störungen, Erkennung nicht-existenter Quellen und Systemperformance. Den Abschluss bildet ein Gesamtfazit in Abschnitt 7.4.

## 7.1 Evaluationsziele und Kriterien

Die Evaluation des Tools orientiert sich an den in der Konzeption (Kapitel 5) definierten funktionalen (REQ-Fxx) und nicht-funktionalen Anforderungen (NFRxx). Zur systematischen Überprüfung werden zentrale Evaluationskriterien festgelegt:

Korrektheit. Dieses Kriterium beschreibt die Präzision und Vollständigkeit der Referenzextraktion, die korrekte Normalisierung in das Zielformat (CSL-JSON) sowie die Konsistenz beim Abgleich mit externen Metadatenquellen. Relevante Anforderungen sind insbesondere REQ-F01, REQ-F02, REQ-F03, REQ-F04, REQF08, REQ-F09, REQ-F10 sowie NFR-01, NFR-13 und NFR-15.

Effizienz. Unter Effizienz wird der Grad der zeitlichen Entlastung bei der Quellenprüfung verstanden. Als Messgrößen dienen Bearbeitungsdauer und Durchsatz. Abgedeckt werden Anforderungen wie REQ-F12, REQ-F14, NFR-02, NFR-03 und NFR-09.

Performance. Dieses Kriterium bezieht sich auf Antwortzeiten, Stabilität und Robustheit des Tools unter verschiedenen Eingabe- und Lastszenarien. Es adressiert Anforderungen wie REQ-F05, REQ-F06, REQ-F07, REQ-F09, REQ-F10, REQ-F15 sowie NFR-02, NFR-03, NFR-05, NFR-09, NFR-11 und NFR-12.

Die genannten Kriterien bilden die Grundlage der nachfolgenden Evaluationsschritte. Sie werden in den folgenden Abschnitten methodisch präzisiert und empirisch überprüft.

## 7.2 Methodisches Vorgehen

Die Evaluation folgte einem quantitativen, experimentellen Ansatz. Das Evaluationssetup wurde entwickelt, um die Referenzverifikation unter kontrollierten, jedoch praxisnahen Bedingungen zu prüfen. Grundlage bildeten drei kuratierte Datensätze, die unterschiedliche Anwendungsszenarien und Fehlerquellen abdecken.

## Evaluationsdatensätze.

- -Datensatz echter Referenzen: Dieser bestand aus 11 Teil-Datensätzen mit jeweils 200 bibliografischen Einträgen real existierender Publikationen, einem für jeden der folgenden Zitierstile: APA, MLA, Chicago, Harvard, Vancouver, IEEE, Nature, American Chemical Society (ACS), American Medical Association (AMA), Springer und Oxford. Jeder Teil-Datensatz enthielt acht Publikationstypen (Buch, Buchkapitel, Dissertation, Zeitschriftenartikel, Monografie, Preprint, Konferenzbeitrag, Bericht) mit jeweils 25 Einträgen. Diese Datensätze dienten der Messung der Genauigkeit der Verifikationspipeline unter idealen Bedingungen und der Untersuchung des Einflusses des Zitierstils.
- -Datensatz modifizierter Referenzen: Basierend auf echten APA-Referenzen wurde ein zweiter Datensatz mit 200 Einträgen erstellt, die typische manuelle Fehler enthielten, etwa Tippfehler in Titeln oder Autorennamen, geringfügige Abweichungen im Erscheinungsjahr (±1-2 Jahre) sowie inkonsistente Formatierungen. Dieser Datensatz diente der Untersuchung der Robustheit gegenüber fehlerhaften Eingabedaten.
- -Datensatz synthetischer Referenzen: Zur Analyse der Fähigkeit des Tools, KIgenerierte Halluzinationen zu erkennen, wurde ein dritter Datensatz mit 200 formal korrekten, jedoch inhaltlich nicht existierenden APA-Referenzen erzeugt. Die korrekte Klassifikation dieser Einträge als 'nicht verifizierbar' stellte ein zentrales Erfolgskriterium dar.

Zur Sicherstellung einer fokussierten Evaluation der Kerngenauigkeit lagen alle Referenzen als klar voneinander getrennte, wohlgeformte Einzeltexte vor. Dies umgeht die zusätzliche Herausforderung der 'Reference Segmentation', also dem automatischen Trennen eines durchgehenden Literaturverzeichnisses in einzelne Referenzen. Zugleich schafft es eine optimale Ausgangsbasis für die Extraktionsalgorithmen (AnyStyle und LLM).

Beispielhafte Einträge aus allen drei Datensatztypen sind im Anhang B.1 aufgeführt. Die vollständigen Datensätze sind auf der beiliegenden CD enthalten.

Datensatzgenerierung. Die Datensätze wurden automatisiert unter Einhaltung wissenschaftlicher Standards erzeugt. Für die echten Referenzen wurden pro Publikationstyp jeweils 25 DOIs über die Crossref-Works-API gezogen. Die Stichprobenziehung erfolgte mit Typ-Filtern, Sortierung nach Zitierhäufigkeit (bei Preprints nach Veröffentlichungsdatum) und Duplikatentfernung via DOI.

Zu jedem DOI wurden formatierte Quellenangaben per Content-Negotiation ( Accept: text/x-bibliography ) in 11 Zitierstilen abgerufen und als wohlgeformte Einzeltexte abgelegt (pro Stil 8×25 = 200 Einträge).

Der Datensatz modifizierter Referenzen entstand aus den APA-Einträgen durch deterministische, seed-basierte Perturbation mit kontrollierten Fehlerwahrscheinlichkeiten (Tippfehler, Titelvarianten, Jahresabweichungen ±1-2, Autoreninitialen, Interpunktion, DOI-Varianten). Ein detaillierter Bericht zu allen vorgenommenen Modifikationen befindet sich auf der beiliegenden CD. Der synthetische Datensatz wurde programmgesteuert über Vorlagen für plausible APA-Einträge mit formal validen, jedoch nicht existierenden DOIs erzeugt.

Bewertungsmetriken. Die Bewertung der Verifikationsergebnisse erfolgte anhand der folgenden quantitativen Metriken:

- -Ähnlichkeits-Score: Der zentrale, gewichtete Score (0 % bis 100 %) aus dem MatchingAlgorithmus, der die Übereinstimmung zwischen Eingabereferenz und dem besten Kandidaten aus den Metadatenquellen quantifiziert.
- -Verifikationsklassen: Basierend auf konfigurierbaren Schwellenwerten wurden die Referenzen in vier Klassen eingeteilt:
- -Exact Match ( S = 100 %): Volle Übereinstimmung.
- -Strong Match ( S ≥ 85 %): Hohe Übereinstimmung.
- -Possible Match ( S ≥ 70 %): Geringe Übereinstimmung.
- -No Match ( S &lt; 70 %): Keine ausreichende Übereinstimmung.
- -Performance-Kennzahlen: Es wurden die durchschnittliche Ausführungszeit für die gesamte Verifikationspipeline sowie für einzelne Prozessschritte (Extraktion, Suche in verschiedenen Datenbanken, Matching) gemessen. Daraus wurde der Durchsatz in Referenzen pro Minute abgeleitet, um die Praxistauglichkeit zu beurteilen.

Jeder Datensatz wurde vollständig durch die Verifikationspipeline verarbeitet. Die Ergebnisse wurden automatisch protokolliert und aggregiert, um die nachfolgende Analyse zu ermöglichen.

Konfiguration der Browser-Erweiterung. Um die Reproduzierbarkeit der Evaluationsergebnisse sicherzustellen, wurde die Browser-Erweiterung für alle Durchläufe mit einer einheitlichen, festen Konfiguration betrieben. Diese wurde so gewählt, dass sie einen ausgewogenen Kompromiss zwischen Verifikationsgenauigkeit und Performance darstellt und repräsentativ für einen typischen Standard-Nutzungsfall ist.

## -Extraktion:

- Die LLM-gestützte Extraktionspipeline wurde mit dem Anbieter OpenAI und dem Modell GPT-4.1 konfiguriert.
- Für die Extraktion wurden folgende CSL-JSON-Felder aktiviert: author , title , issued , container-title , publisher , volume , issue , page , DOI und URL . Diese Auswahl gewährleistet die Erfassung aller für eine umfassende Verifikation relevanten Metadaten.

## -Suche und Metadatenquellen:

- Es wurden folgende Metadatenquellen in dieser priorisierten Reihenfolge aktiviert: 1. Crossref , 2. OpenAlex , 3. Semantic Scholar , 4. Europe PMC , 5. arXiv .
- Die Suchstrategie war sequenziell , wobei die Suche bei der ersten Datenbank begann und nur bei Nichtauffinden eines Treffers zur nächsten in der Prioritätsliste fortgesetzt wurde.
- Die Early Termination war aktiviert mit einem Schwellenwert von 90 %. Sobald also in einer Datenbank ein Kandidat mit einem Ähnlichkeits-Score von mindestens 90 % gefunden wurde, wurde die Suche für diese Referenz abgebrochen, um die Gesamtperformance zu optimieren.

## -Matching und Scoring:

- -Aktivierte Felder und Gewichtung: Für den feldweisen Vergleich und die ScoreBerechnung wurden die folgenden Felder mit ihren konfigurierten Gewichtungen verwendet (Summe = 100%):
- title
- issue
- -Normalisierungsmodus: Es wurden alle Normalisierungsregeln aktiviert, um eine maximale Toleranz gegenüber Formatierungsvarianten zu gewährleisten.
- -Klassifikationsschwellen: Die Schwellenwerte für die Verifikationsklassen waren wie folgt definiert: Exact Match = 100%, Strong Match ≥ 85%, Possible

: 20 %

- author

: 18 %

- DOI

: 16 %

- container-title

: 12 %

- issued

: 10 %

- page

: 6 %

- volume

: 6 %

- publisher

: 5 %

- URL : 4 %

: 3 %

<!-- formula-not-decoded -->

Hypothesen. Auf Grundlage der in Abschnitt 7.1 definierten Kriterien wurden folgende überprüfbare Hypothesen formuliert. Diese operationalisieren die übergeordneten Ziele der Korrektheit (H1) und Performance (H2) in konkrete, quantifizierbare Messgrößen:

- -H1: Das Tool erzielt bei der Referenzprüfung eine durchschnittliche MatchingGenauigkeit von mindestens 90 %.
- -H2: Die mittlere Bearbeitungszeit pro Referenz liegt unter 3 s.

Diese Werte wurden wie folgt begründet: Die in H1 geforderte Genauigkeit von mindestens 90 % stellt aus Nutzersicht eine hohe Verlässlichkeit dar und adressiert damit die in der Vorstudie als absolut priorisiert identifizierte Anforderung. Die in H2 geforderte Bearbeitungszeit von unter 3 s gewährleistet, dass der Prüfaufwand pro Quelle im Vergleich zum in der Vorstudie erhobenen manuellen Zeitaufwand nahezu eliminiert wird und eine flüssige Nutzererfahrung entsteht.

Diese Hypothesen bilden die Grundlage für die empirische Überprüfung der technischen Leistungsfähigkeit des Systems.

## 7.3 Ergebnisse

Dieser Abschnitt präsentiert die empirischen Ergebnisse der technischen Evaluation. Die Analyse gliedert sich in vier klar voneinander abgegrenzte Dimensionen: Zunächst wird in Abschnitt 7.3.1 die Verifikationsgenauigkeit systematisch untersucht, beginnend mit einer detaillierten Analyse am Beispiel APA-Referenzen und erweitert um einen Vergleich über verschiedene Zitierstile hinweg. Anschließend wird in Abschnitt 7.3.2 die Robustheit des Systems gegenüber gestörten Eingabedaten analysiert, gefolgt von der Evaluation der Fähigkeit zur Erkennung nicht-existenter Quellen in Abschnitt 7.3.3. Den Abschluss bildet in Abschnitt 7.3.4 eine umfassende Performance-Analyse, die alle zuvor betrachteten Szenarien zusammenführt und die Systemeffizienz unter verschiedenen Betriebsbedingungen bewertet.

Ein Auszug der im Rahmen der Evaluation generierten Ergebnisdaten, exemplarisch für den APA-Zitierstil im echten Datensatz, ist in Anhang B.2 dargestellt. Die dort abgebildeten Tabellen illustrieren den Aufbau und die Struktur der automatisch erzeugten Auswertungsdateien.

Die vollständigen Statistiken, Rohdaten und Detailauswertungen aller Stil- und Datensatzkombinationen sind auf der beiliegenden CD enthalten und ermöglichen die vollständige Nachvollziehbarkeit sämtlicher Analysen.

## 7.3.1 Verifikationsgenauigkeit

Die Evaluation der Genauigkeit erfolgte zunächst anhand des Datensatzes mit 200 echten APA-Referenzen unter idealen Bedingungen, gefolgt von einer erweiterten Analyse über 11 verschiedene Zitierstile hinweg. Die Ergebnisse demonstrieren die hohe Verlässlichkeit des entwickelten Systems und erlauben einen direkten Vergleich der beiden Extraktionspipelines.

Gesamtgenauigkeit am Beispiel APA. Die Auswertung der 200 Referenzen zeigt für beide Extraktionspipelines eine sehr hohe Genauigkeit, jedoch mit charakteristischen Unterschieden (Tabelle 10). Die LLM-gestützte Verifikationspipeline erzielte einen mittleren Ähnlichkeits-Score von 99 , 11% (Median: 100%), während die AnyStyle-basierte Verifikationspipeline 96 , 61 % erreichte (Median: 100 %).

Die Verteilung der Verifikationsklassen unterstreicht den Trade-off zwischen Robustheit und Geschwindigkeit: Während die LLM-Pipeline mit 186 (93 , 0%) Exact Matches eine höhere Präzision erreicht, klassifiziert die AnyStyle-Pipeline 154 (77 , 0 %) der Referenzen als Exact Match . Die Anzahl der Strong Matches ist bei der AnyStylePipeline mit 26 (13 , 0 %) ähnlich hoch wie bei der LLM-Pipeline (10, 5 , 0 %). Dennoch bleibt die Gesamtleistung beider Pipelines für den praktischen Einsatz sehr hoch.

Diese Ergebnisse bestätigen Hypothese H1 für beide Extraktionspipelines. Mit 99 , 11% (LLM) bzw. 96 , 61% (AnyStyle) wird das Ziel einer durchschnittlichen Matching-Genauigkeit von mindestens 90 % in beiden Fällen deutlich übertroffen.

Tabelle 10 Gesamtgenauigkeit der Verifikation echter APA-Referenzen

| Pipeline   | Ø-Score   | Median   | Exact   | Strong   | Possible   | No   |
|------------|-----------|----------|---------|----------|------------|------|
|            | %         | %        | n       | n        | n          | n    |
| LLM        | 99 , 11   | 100 , 00 | 186     | 10       | 3          | 1    |
| AnyStyle   | 96 , 61   | 100 , 00 | 154     | 26       | 15         | 5    |

Anmerkung. Die Verifikationsergebnisse wurden mit aktivierter DOI-Suche ermittelt. Die Schwellenwerte für die Klassifikation waren: Exact Match = 100 %, Strong Match ≥ 85 %, Possible Match ≥ 70 %, No Match &lt; 70 %.

Genauigkeit nach Publikationstyp. Eine differenzierte Betrachtung der APAReferenzen nach Publikationstypen (Tabelle 11) offenbart charakteristische Unterschiede in der Verifikationsqualität. Während die meisten Publikationstypen in beiden Pipelines exzellente Ergebnisse erzielen, zeigt sich bei Buchkapiteln eine signifikant niedrigere Treffergenauigkeit.

In der LLM-Pipeline wurden nur 19 der 25 Buchkapitel (76 %) als Exact Match klassifiziert, in der AnyStyle-Pipeline waren es 13 (52 %). Dies steht im Kontrast zu

21 bis 25 Exact Matches (84 % bis 100 %) bei anderen Publikationstypen. Besonders auffällig ist der Unterschied bei Preprints, wo die LLM-Pipeline mit 24 Exact Matches deutlich robuster abschneidet als AnyStyle mit 10 Exact Matches.

Tabelle 11 Genauigkeit der Verifikation nach Publikationstyp für APA-Referenzen

| Publikationstyp      | LLM      | LLM   | AnyStyle   | AnyStyle   |
|----------------------|----------|-------|------------|------------|
|                      | Ø-Score  | Exact | Ø-Score    | Exact      |
|                      | %        | n     | %          | n          |
| Buch                 | 100 , 00 | 25    | 99 , 84    | 24         |
| Dissertation         | 99 , 96  | 24    | 96 , 08    | 19         |
| Zeitschriftenartikel | 99 , 88  | 23    | 98 , 16    | 23         |
| Monografie           | 99 , 64  | 24    | 98 , 24    | 23         |
| Konferenzbeitrag     | 99 , 64  | 23    | 99 , 32    | 21         |
| Bericht              | 99 , 32  | 24    | 98 , 48    | 21         |
| Preprint             | 98 , 96  | 24    | 92 , 20    | 10         |
| Buchkapitel          | 95 , 48  | 19    | 90 , 52    | 13         |

Anmerkung. Die Verifikationsergebnisse wurden mit aktivierter DOI-Suche ermittelt. Die Schwellenwerte für die Klassifikation waren: Exact Match = 100 %, Strong Match ≥ 85 %, Possible Match ≥ 70 %, No Match &lt; 70 %.

Einfluss der DOI auf die Verifikationsgenauigkeit. Um den Einfluss eindeutiger Identifikatoren zu bewerten, wurde der Verifikationsprozess zusätzlich ohne Nutzung der DOI-Suche durchgeführt. Wie Tabelle 12 zeigt, führte dies in beiden Pipelines zu einem Rückgang der Gesamtgenauigkeit, der bei der AnyStyle-Pipeline jedoch signifikant stärker ausfiel.

Tabelle 12 Vergleich der Genauigkeit mit und ohne DOI-Suche

| Szenario   | LLM     | LLM   | AnyStyle   | AnyStyle   |
|------------|---------|-------|------------|------------|
|            | Ø-Score | Exact | Ø-Score    | Exact      |
|            | %       | n     | %          | n          |
| Mit DOI    | 99 , 11 | 186   | 96 , 61    | 154        |
| Ohne DOI   | 98 , 56 | 184   | 91 , 59    | 139        |

Anmerkung. Die Schwellenwerte für die Klassifikation waren: Exact Match = 100 %, Strong Match ≥ 85 %, Possible Match ≥ 70 %, No Match &lt; 70 %.

Bei der LLM-Pipeline sank der mittlere Score von 99 , 11% auf 98 , 56%, bei der AnyStyle-Pipeline von 96 , 61% auf 91 , 59%. Besonders betroffen waren erneut Buchkapitel, deren mittlerer Score in der AnyStyle-Pipeline von 90 , 52 % auf 80 , 04 % fiel. Die Anzahl der Exact Matches reduzierte sich in der LLM-Pipeline von 186 auf 184, in der AnyStyle-Pipeline von 154 auf 139. Diese Ergebnisse unterstreichen die überragende Bedeutung eindeutiger Identifikatoren für die Verifikationsqualität, zeigen aber gleichzeitig, dass das System, insbesondere die LLM-Pipeline, auch auf reiner Metadatenbasis eine sehr hohe Robustheit aufweist.

Diskussion der Ergebnisse. Die durchweg hohen Scores bei den meisten Publikationstypen bestätigen die Effektivität des gewählten Matching-Algorithmus und der konfigurierten Feldgewichtung. Die herausragende Performance bei Büchern (100 %) und Dissertationen (99 , 96 %) in der LLM-Pipeline lässt sich durch deren in der Regel konsistente und vollständige Metadatenerfassung in wissenschaftlichen Datenbanken erklären.

Die vergleichsweise schlechteren Ergebnisse bei Buchkapiteln sind auf mehrere strukturelle Faktoren zurückzuführen. Erstens erschwert die komplexe Metadatenstruktur mit mehrdeutigem Container-Titel die eindeutige Zuordnung. Während bei Zeitschriftenartikeln der Container-Titel eindeutig der Zeitschriftenname ist, kann bei Buchkapiteln der Container-Titel den Buchtitel, den Reihentitel oder beides beinhalten. In Zitationsangaben wird typischerweise der Buchtitel angegeben, in Metadatenbanken ist jedoch häufig die Reihe als Container-Titel hinterlegt. Diese Diskrepanz führt zu einer geringeren Übereinstimmung im Container-Titel-Feld. Zweitens tragen heterogene Erfassungspraktiken und häufig längere Titel mit Untertiteln zur Problematik bei. Untertitel nach Doppelpunkten werden in Datenbanken variierend erfasst (gekürzt, weggelassen oder mit unterschiedlicher Interpunktion), was für Menschen irrelevante Unterschiede sind, beim automatischen Abgleich jedoch zu Punktabzügen führt. Drittens wirken fehlende eindeutige Identifikatoren und formatierungsanfällige Felder als zusätzliche Fehlerquelle. Buchkapitel verfügen seltener über DOIs als Zeitschriftenartikel. Ohne diesen starken Anker müssen andere Felder wie Seitenangaben (mit variierenden Strichen 49-60 vs. 49-59) und URLs (Verlagsseiten vs. Plattformen wie JSTOR) die Identifikation leisten, die jedoch formatierungsanfällig sind. Viertens wird die Herausgeberinformation häufig nicht erfasst oder im Abgleich nicht genutzt, wodurch ein wichtiges Unterscheidungsmerkmal verloren geht.

Die besondere Betroffenheit der AnyStyle-Pipeline bei Buchkapiteln und bei Deaktivierung der DOI-Suche unterstreicht dessen höhere Abhängigkeit von hochqualitativen, standardkonformen Eingabedaten. Die LLM-Pipeline zeigt sich hier robuster gegenüber Metadaten-Unschärfen.

Vergleich der Genauigkeit über verschiedene Zitierstile. Um die Robustheit des Extraktions- und Normalisierungsmoduls umfassend zu evaluieren, wurde die Verifikationsgenauigkeit über 11 gängige wissenschaftliche Zitierstile hinweg analysiert. Tabelle 13 stellt die Gesamtergebnisse beider Extraktionspipelines im direkten Vergleich dar und zeigt eine hierarchische Sortierung nach der durchschnittlichen Genauigkeit der LLM-Pipeline.

Tabelle 13 Vergleich der Verifikationsgenauigkeit über alle Zitierstile

| Zitierstil   | LLM     | LLM   | AnyStyle   | AnyStyle   |
|--------------|---------|-------|------------|------------|
|              | Ø-Score | Exact | Ø-Score    | Exact      |
|              | %       | n     | %          | n          |
| Oxford       | 99 , 40 | 188   | 95 , 16    | 145        |
| APA          | 99 , 11 | 186   | 96 , 61    | 154        |
| ACS          | 99 , 07 | 186   | 71 , 86    | 5          |
| IEEE         | 99 , 05 | 183   | 90 , 35    | 55         |
| AMA          | 98 , 96 | 181   | 74 , 39    | 5          |
| Chicago      | 98 , 91 | 184   | 93 , 57    | 137        |
| Nature       | 98 , 69 | 180   | 71 , 96    | 4          |
| Vancouver    | 97 , 67 | 172   | 74 , 47    | 6          |
| Harvard      | 97 , 19 | 161   | 92 , 69    | 136        |
| Springer     | 97 , 06 | 166   | 90 , 08    | 67         |
| MLA          | 95 , 19 | 97    | 93 , 92    | 135        |

Anmerkung. Die Verifikationsergebnisse wurden mit aktivierter DOI-Suche ermittelt. Die Zitierstile sind nach der Genauigkeit der LLM-Pipeline absteigend sortiert.

Die Ergebnisse zeigen charakteristische Leistungsmuster, die in drei Gruppen unterteilt werden können:

Die erste Gruppe umfasst hochpräzise Stile mit einem Ø-Score der LLM-Pipeline von über 98 , 5%. Oxford, APA, ACS, IEEE, AMA, Chicago und Nature erzielen hier durchweg exzellente Ergebnisse mit über 90 % Exact Matches . Während Oxford, APA, IEEE und Chicago auch in der AnyStyle-Pipeline hohe Genauigkeit erreichen (Ø-Score &gt; 90 %), zeigen ACS, AMA und Nature dort deutlich reduzierte Leistungen mit mittleren Scores um 72 % und lediglich 2 bis 5 Exact Matches . Diese Diskrepanz deutet darauf hin, dass insbesondere diese drei Stile besondere Herausforderungen für den statistisch trainierten AnyStyle-Parser darstellen.

Die zweite Gruppe bilden robuste Stile mit ausgewogener Leistung, die in der LLM-Pipeline Ø-Scores zwischen 97 , 0 % bis 97 , 7 % erreichen. Vancouver, Harvard und Springer zeigen hier eine etwas geringere, aber weiterhin sehr hohe Treffergenauigkeit. Auffällig ist, dass AnyStyle bei Harvard und Springer vergleichbare Ergebnisse erzielt (Ø-Score &gt; 90 %), während Vancouver in beiden Pipelines die niedrigsten Werte dieser Gruppe aufweist. Die erhöhte Anzahl von Strong Matches in beiden Pipelines legt nahe, dass typische Formatierungsvarianten dieser Stile zu kleinen Abweichungen in der Metadatenzuordnung führen.

Die dritte Gruppe stellt einen Sonderfall dar, repräsentiert durch den MLA-Stil. Dieser zeigt mit 95 , 19% den niedrigsten mittleren Ø-Score der LLM-Pipeline und weist eine bimodale Verteilung auf (48 , 5 % Exact Matches , 48 , 0 % Strong Matches ). Gleichzeitig erzielt AnyStyle mit 93 , 92 % einen nahezu identischen Wert, jedoch mit mehr Exact Matches (135 vs. 97). Dieses Verhalten erklärt sich durch die unterschiedlichen Extraktionsansätze: AnyStyle arbeitet sequenzstatistisch und extrahiert konservativ nur Felder, die das CRF-Modell mit hoher Sicherheit zuordnen kann. Bei MLA-spezifischen Besonderheiten wie dem Verlagsignal 'Crossref' oder 'et al. '-Verkürzungen in Autorenlisten lässt AnyStyle unsichere Felder unbesetzt und vermeidet so Punktabzüge. Der LLM-Ansatz hingegen befüllt mehr Felder, interpretiert 'Crossref' jedoch fälschlich als Verlagsangabe und übernimmt 'et al.' wörtlich als Autoreneintrag. Diese systematischen Fehler führen zu einer Häufung von Strong Matches statt Exact Matches und erklären damit die charakteristische bimodale Verteilung.

Über alle Zitierstile hinweg zeigt sich zusätzlich ein quellenübergreifendes Muster. Buchkapitel stellen unabhängig vom Stil eine konsistente Herausforderung dar. Die differenzierte Analyse nach Publikationstypen bestätigt das bereits in der APAAuswertung identifizierte Bild. In den meisten Zitierstilen liegen die Exact Match -Raten der AnyStyle-Pipeline bei Buchkapiteln deutlich unter denen der LLM-Pipeline, besonders ausgeprägt bei AMA (0 % vs. 76 %), Nature (8 % vs. 76 %) und IEEE (8 % vs. 92 %). Diese konsistente Schwierigkeit über alle elf untersuchten Stile und beide Extraktionspipelines hinweg verdeutlicht, dass die Ursache in der strukturellen Komplexität von Buchkapitel-Metadaten liegt und nicht in Besonderheiten einzelner Zitierstile.

Fazit zur Verifikationsgenauigkeit. Die Analyse über elf Zitierstile hinweg bestätigt die generelle Robustheit und Zuverlässigkeit des Verifikationssystems, zeigt jedoch charakteristische Unterschiede zwischen den Extraktionspipelines. Während die LLM-Pipeline durchweg hohe Genauigkeit über alle Stile hinweg erreicht (Ø-Score &gt; 95 , 19 %), zeigt die AnyStyle-Pipeline eine stärkere Abhängigkeit vom Zitierstil mit Scores zwischen 71 , 86 % (ACS) und 96 , 61 % (APA).

Über alle Zitierstile hinweg bleibt die durchschnittliche Genauigkeit beider Pipelines deutlich über dem in Hypothese H1 geforderten Schwellenwert von 90 %, was die allgemeine Gültigkeit der Hypothese unterstreicht. Die identifizierte Herausforderung bei Buchkapiteln stellt eine domänenspezifische Limitation dar, die auf strukturelle Eigenschaften dieser Publikationsform zurückzuführen ist und beide Extraktionspipelines in ähnlicher Weise betrifft, wenn auch in unterschiedlichem Ausmaß.

## 7.3.2 Robustheit gegenüber Störungen

Um die praktische Tauglichkeit des Systems unter realen Bedingungen zu evaluieren, wurde ein Datensatz mit 200 modifizierten APA-Referenzen verwendet, die bewusst mit typischen, manuellen Fehlern versehen wurden. Diese umfassen Tippfehler, leichte Abweichungen im Erscheinungsjahr (±1 bis 2 Jahre), Inkonsistenzen in der Autorenformatierung sowie kleinere Formatierungsänderungen, also Fehler, wie sie im wissenschaftlichen Arbeitsalltag regelmäßig auftreten. Die Evaluation wurde für beide Extraktionspipelines durchgeführt, um deren Robustheit gegenüber Störungen zu vergleichen.

Gesamtrobustheit. Wie Tabelle 14 zeigt, erzielte das System bei den modifizierten Referenzen in der LLM-Pipeline einen mittleren Score von 96 , 22%, verglichen mit 99 , 11 % bei den unveränderten APA-Referenzen. In der AnyStyle-Pipeline sank der mittlere Score von 96 , 61 % auf 94 , 06 %.

Während die Anzahl der Exact Matches in der LLM-Pipeline von 186 auf 135 (67 , 5 %) sank, blieb die Gesamtverifikationsqualität mit 182 Referenzen (91 , 0 %) als zumindest Strong Match weiterhin sehr hoch. In der AnyStyle-Pipeline reduzierte sich die Anzahl der Exact Matches von 154 auf 110 (55 , 0 %), wobei 167 Referenzen (83 , 5 %) als zumindest Strong Match klassifiziert wurden.

Die LLM-Pipeline zeigt sich damit robuster gegenüber Störungen, was sich in einer geringeren Reduktion der Exact Matches (25 , 5 % vs. 28 , 6 %) und einem höheren Anteil an Strong Matches widerspiegelt.

Tabelle 14 Vergleich der Verifikationsgenauigkeit - Original vs. modifizierte APA-Referenzen

| Szenario          | Ø-Score   | Exact   | Strong   | Possible   | No   |
|-------------------|-----------|---------|----------|------------|------|
|                   | %         | n       | n        | n          | n    |
| LLM-Pipeline      |           |         |          |            |      |
| Original APA      | 99 , 11   | 186     | 10       | 3          | 1    |
| Modifizierte APA  | 96 , 22   | 135     | 47       | 13         | 5    |
| AnyStyle-Pipeline |           |         |          |            |      |
| Original APA      | 96 , 61   | 154     | 26       | 15         | 5    |
| Modifizierte APA  | 94 , 06   | 110     | 57       | 22         | 11   |

Anmerkung. Die Verifikationsergebnisse wurden mit aktivierter DOI-Suche ermittelt. Die Schwellenwerte für die Klassifikation waren: Exact Match = 100 %, Strong Match ≥ 85 %, Possible Match ≥ 70 %, No Match &lt; 70 %.

Robustheit nach Publikationstyp. Die Analyse der modifizierten APA-Referenzen nach Publikationstypen (Tabelle 15) zeigt charakteristische Unterschiede in der Widerstandsfähigkeit gegenüber Störungen. In beiden Pipelines erwiesen sich Dissertationen und Berichte als besonders robust mit den höchsten Ø-Scores von über 95 %. Monografien und Preprints zeigten dagegen die größten Einbußen mit Ø-Scores um 91 % bzw. 90 %.

Besonders auffällig ist die Performance bei Buchkapiteln, die in der AnyStylePipeline mit 89 , 60 % den niedrigsten Wert aller Publikationstypen erreichen, während sie in der LLM-Pipeline mit 94 , 60 % deutlich robuster abschneiden.

Tabelle 15 Robustheit nach Publikationstyp - modifizierte APA-Referenzen

| Publikationstyp      | Ø-Score   | Ø-Score   |
|----------------------|-----------|-----------|
|                      | LLM       | AnyStyle  |
|                      | %         | %         |
| Dissertation         | 99 , 80   | 95 , 76   |
| Bericht              | 97 , 84   | 96 , 60   |
| Buch                 | 98 , 64   | 98 , 60   |
| Zeitschriftenartikel | 98 , 56   | 96 , 96   |
| Konferenzbeitrag     | 96 , 68   | 96 , 40   |
| Buchkapitel          | 94 , 60   | 89 , 60   |
| Preprint             | 92 , 56   | 87 , 16   |
| Monografie           | 91 , 12   | 91 , 36   |

Anmerkung. Die Verifikationsergebnisse wurden mit aktivierter DOI-Suche ermittelt. Die Publikationstypen sind nach der Robustheit der LLM-Pipeline absteigend sortiert.

Kritische Abhängigkeit von eindeutigen Identifikatoren. Die Deaktivierung der DOI-Suche führte bei den modifizierten Referenzen zu einer signifikant stärkeren Verschlechterung als bei den unveränderten Referenzen. In der LLM-Pipeline sank der mittlere Score von 96 , 22% auf 93 , 53%, während in der AnyStyle-Pipeline ein stärkerer Rückgang von 94 , 06% auf 88 , 47% zu verzeichnen war. Die Anzahl der No Matches stieg in der LLM-Pipeline von 5 auf 15 (7 , 5%) und in der AnyStylePipeline von 11 auf 28 (14 , 0 %). Besonders betroffen waren erneut Monografien und Buchkapitel.

Diskussion der Robustheitsergebnisse. Die Ergebnisse demonstrieren eine hohe allgemeine Robustheit des Verifikationssystems gegenüber typischen manuellen Fehlern. Die Reduktion der Exact Matches um 25 , 5 % in der LLM-Pipeline und um 28 , 6 % in der AnyStyle-Pipeline ist im Kontext der absichtlich eingeführten Störungen als moderat zu bewerten. Besonders hervorzuheben ist, dass in der LLM-Pipeline weiterhin über 90 % und in der AnyStyle-Pipeline über 80 % der Referenzen als zuverlässige Treffer ( Strong oder Exact Match ) klassifiziert wurden.

Die unterschiedliche Betroffenheit der Publikationstypen lässt sich durch deren charakteristische Metadatenstruktur erklären: Dissertationen sind oft durch eindeutige Autoren-Jahr-Kombinationen gut identifizierbar. Monografien hingegen leiden stärker unter Titelfehlern, da deren Titel zentral für die Identifikation ist.

Die AnyStyle-Pipeline zeigt eine höhere Sensitivität gegenüber Störungen, was auf die geringere Flexibilität des sequenzstatistischen, CRF-basierten Ansatzes im Vergleich zum LLM-gestützten Verfahren zurückzuführen ist. Die verstärkte Abhängigkeit von DOIs unter Störbedingungen unterstreicht die Bedeutung eindeutiger Identifikatoren als 'Anker' in der Verifikation, insbesondere wenn andere Metadaten fehlerbehaftet sind.

Fazit. Das System zeigt eine praxistaugliche Robustheit gegenüber typischen Fehlern, wie sie in wissenschaftlichen Arbeitsprozessen auftreten. Die bewusste Reduktion der Extraktions- und Matching-Qualität durch die künstlichen Störungen bleibt in einem Rahmen, der die praktische Nutzbarkeit nicht gefährdet, bestätigt aber gleichzeitig die Erwartung, dass sorgfältig erfasste Metadaten die Verifikationsqualität signifikant steigern. Die LLM-Pipeline erweist sich dabei als robuster gegenüber Störungen als die AnyStyle-Pipeline, was den Trade-off zwischen Robustheit (LLM) und Geschwindigkeit (AnyStyle) weiter untermauert.

## 7.3.3 Erkennung nicht-existenter Quellen

Zur Evaluation der Fähigkeit, KI-generierte Halluzinationen zu identifizieren, wurde ein Datensatz mit 200 synthetischen APA-Referenzen verwendet, die formal korrekt strukturiert, aber inhaltlich nicht existent sind. Diese Evaluation stellt einen kritischen Test für den praktischen Nutzen des Tools im Kontext von KI-gestützter wissenschaftlicher Arbeit dar. Die Evaluation wurde für beide Extraktionspipelines durchgeführt, um deren Leistungsfähigkeit bei dieser anspruchsvollen Aufgabe zu vergleichen.

Erkennungsgenauigkeit. Die Ergebnisse demonstrieren eine perfekte Erkennungsleistung in beiden Pipelines: Wie in Tabelle 16 dargestellt, wurden alle 200 synthetischen Referenzen (100 %) korrekt als 'No Match' klassifiziert.

In der LLM-Pipeline betrug der mittlere Ähnlichkeits-Score 31 , 18%, in der AnyStyle-Pipeline 21 , 00 %. Beide Werte liegen deutlich unter dem Schwellenwert für Possible Matches (70 %) und belegen die klare Trennung zwischen existenten und nicht-existenten Quellen.

Score-Verteilung und -Charakteristik. Die Ähnlichkeits-Scores der synthetischen Referenzen zeigen charakteristische Verteilungen in beiden Pipelines. In der Anmerkung. Die Verifikationsergebnisse wurden mit aktivierter DOI-Suche ermittelt. Die Schwellenwerte für die Klassifikation waren: Exact Match = 100 %, Strong Match ≥ 85 %, Possible Match ≥ 70 %, No Match &lt; 70 %.

Tabelle 16 Erkennung nicht-existenter Quellen

| Pipeline   | Ø-Score   | Median   | Exact   | Strong   | Possible   | No   |
|------------|-----------|----------|---------|----------|------------|------|
|            | %         | %        | n       | n        | n          | n    |
| LLM        | 31 , 18   | 28 , 50  | 0       | 0        | 0          | 200  |
| AnyStyle   | 21 , 00   | 20 , 00  | 0       | 0        | 0          | 200  |

LLM-Pipeline lagen die mittleren fünfzig Prozent der Ergebnisse im Bereich von 24 , 0 % bis 35 , 0 %, in der AnyStyle-Pipeline im Bereich von 15 , 0 % bis 25 , 0 %.

Die höchsten Scores erzielten in beiden Pipelines Monografien (LLM: Ø 36 , 84 %, AnyStyle: Ø 26 , 84%) und Berichte (LLM: Ø 40 , 76%, AnyStyle: Ø 21 , 08%), was darauf hindeutet, dass diese Publikationstypen in Metadatenbanken breiter repräsentiert sind und somit eher zu partiellen Übereinstimmungen führen. Die niedrigsten Scores fanden sich bei Konferenzbeiträgen (LLM: Ø 26 , 48%, AnyStyle: Ø 17 , 84%) und Dissertationen (LLM: Ø 26 , 72 %, AnyStyle: Ø 17 , 64 %).

Interessanterweise führte die Deaktivierung der DOI-Suche in beiden Pipelines zu einem Anstieg der mittleren Scores (LLM: auf 36 , 30%, AnyStyle: auf 24 , 34%), da das System ohne eindeutige Identifikatoren auf reine Metadaten-Ähnlichkeit zurückgreifen muss und dabei höhere, aber weiterhin deutlich unterschwellige Scores generiert.

Diskussion und Implikationen. Die 100 %-ige Erkennungsrate nicht-existenter Quellen in beiden Pipelines stellt einen zentralen Erfolg des entwickelten Systems dar. Sie bestätigt, dass das Tool in der Lage ist, die in der Einleitung identifizierte Kernherausforderung von KI-Halluzinationen wirksam zu adressieren.

Die niedrigeren Scores in der AnyStyle-Pipeline (21 , 00 % vs. 31 , 18 %) deuten darauf hin, dass der sequenzstatistische, CRF-basierte Parser konservativere Extraktionen vornimmt, was in diesem speziellen Anwendungsfall von Vorteil ist, da die Trennung zwischen existenten und nicht-existenten Quellen noch deutlicher ausfällt.

Die beobachteten Scores im Bereich von 15 % bis 45 % sind charakteristisch für den Abgleich mit zufällig ähnlichen, aber nicht identischen Publikationen in wissenschaftlichen Datenbanken. Diese Werte sind hoch genug, um eine funktionierende Metadatenrecherche zu belegen, aber gleichzeitig niedrig genug, um eine klare Trennung von echten Treffern zu gewährleisten.

Fazit. Das System erweist sich als hocheffektiv bei der Erkennung KI-generierter Halluzinationen. Die perfekte Trefferquote von 100 % in beiden Pipelines bei synthetischen Referenzen, kombiniert mit der hohen Genauigkeit bei echten Referenzen, demonstriert die Fähigkeit des Tools, zuverlässig zwischen existenten und nichtexistierenden Quellen zu unterscheiden.

Besonders bemerkenswert ist, dass beide Extraktionspipelines diese Aufgabe gleichermaßen zuverlässig bewältigen, was die Robustheit des zugrundeliegenden Such- und Matching-Algorithmus unterstreicht. Diese Eigenschaft ist entscheidend für den praktischen Einsatz in einer zunehmend von KI-gestützten Tools geprägten wissenschaftlichen Landschaft.

## 7.3.4 Systemperformance

Die Performance des Verifikationssystems wurde umfassend über alle elf Zitierstile und drei Datensatztypen (echt, modifiziert, synthetisch) hinweg evaluiert. Die Analyse der durchschnittlichen Verarbeitungszeiten, Standardabweichungen und Durchsatzraten liefert ein detailliertes Bild der Systemeffizienz unter verschiedenen Betriebsbedingungen. Dieser Abschnitt konsolidiert alle Performance-Ergebnisse, die zuvor über mehrere Unterkapitel verteilt waren, um einen einheitlichen Überblick über die Systemleistung zu bieten.

Performance unter idealen Bedingungen. Die Performance-Messungen unter idealen Bedingungen zeigen ein klares Bild des Trade-offs zwischen Genauigkeit und Geschwindigkeit. Wie Tabelle 17 verdeutlicht, benötigte die LLM-basierte Verifikationspipeline für eine einzelne Referenz im Durchschnitt 2 , 58 s (mit DOI), was einem Durchsatz von etwa 23 Referenzen / min entspricht. Die AnyStyle-Pipeline war mit 2 , 34 s pro Referenz (ca. 26 Referenzen / min) etwas schneller.

Damit wird Hypothese H2, die eine Bearbeitungszeit von unter 3 s pro Referenz forderte, für beide Pipelines bestätigt. Ein typisches Literaturverzeichnis mit 50 Quellen könnte somit in etwa 2 min verifiziert werden.

Tabelle 17 Vereinfachte Performance-Kennzahlen am Beispiel APA-Referenzen

| Kennzahl                 | LLM-Pipeline   | AnyStyle-Pipeline   |
|--------------------------|----------------|---------------------|
|                          | s              | s                   |
| Extraktion               | 2 , 07         | 0 , 05              |
| Metadaten-Suche (gesamt) | 0 , 51         | 2 , 29              |
| Matching                 | 0 , 003        | 0 , 003             |
| Gesamt                   |                |                     |
| mit DOI                  | 2 , 58         | 2 , 34              |
| ohne DOI                 | 3 , 10         | 3 , 88              |

Die Analyse der einzelnen Pipeline-Schritte offenbart charakteristische Muster:

Die LLM-Extraktion stellt mit durchschnittlich 2 , 07s den dominanten Zeitfaktor dar, während die AnyStyle-Extraktion mit 0 , 05s (Parsen und Konvertieren) um Größenordnungen schneller ist. Die Metadaten-Suche zeigt den entgegengesetzten Trend. Hier ist die AnyStyle-Pipeline mit 2 , 29s deutlich langsamer als die LLMPipeline mit 0 , 51 s, was auf die unterschiedliche Qualität der extrahierten Metadaten und die daraus resultierende Effektivität der Suchanfragen hindeutet.

Die Verifikationszeit in der LLM-basierten Pipeline variierte je nach Zitierstil zwischen 2 , 58s (APA) und 4 , 49s (Springer) für existierende Quellen (Tabelle 18). Dies entspricht einem Durchsatz von 13 , 38 Referenzen / min bis 23 , 26 Referenzen / min. Die AnyStyle-Pipeline zeigte charakteristische Performance-Muster mit Verifikationszeiten zwischen 2 , 34s (APA) und 16 , 68s (AMA), was einem Durchsatz von 3 , 60 Referenzen / min bis 25 , 64 Referenzen / min entspricht.

Die effizientesten Zitierstile in der LLM-Pipeline waren APA (2 , 58 s, 23 , 26 Referenzen / min), AMA (2 , 80s, 21 , 43Referenzen / min) und Nature (2 , 82s, 21 , 28Referenzen / min). In der AnyStyle-Pipeline zeigten APA (2 , 34s, 25 , 64Referenzen / min), Oxford (4 , 15s, 14 , 46 Referenzen / min) und Harvard (4 , 23 s, 14 , 18 Referenzen / min) die beste Performance.

Tabelle 18 Performance-Vergleich der Verifikationspipeline nach Zitierstil

| Zitierstil   | LLM     | LLM       | AnyStyle   | AnyStyle   |
|--------------|---------|-----------|------------|------------|
|              | Zeit    | Durchsatz | Zeit       | Durchsatz  |
|              | s       | Ref/min   | s          | Ref/min    |
| APA          | 2 , 58  | 23 , 26   | 2 , 34     | 25 , 64    |
| modifiziert  | 4 , 62  | 12 , 99   | 4 , 04     | 14 , 85    |
| synthetisch  | 23 , 58 | 2 , 54    | 21 , 48    | 2 , 79     |
| AMA          | 2 , 80  | 21 , 43   | 16 , 68    | 3 , 60     |
| Nature       | 2 , 82  | 21 , 28   | 15 , 78    | 3 , 80     |
| Oxford       | 2 , 93  | 20 , 48   | 4 , 15     | 14 , 46    |
| IEEE         | 3 , 10  | 19 , 35   | 6 , 44     | 9 , 32     |
| ACS          | 3 , 20  | 18 , 75   | 15 , 64    | 3 , 84     |
| Chicago      | 3 , 37  | 17 , 80   | 4 , 33     | 13 , 86    |
| Vancouver    | 3 , 71  | 16 , 18   | 15 , 27    | 3 , 93     |
| Harvard      | 3 , 88  | 15 , 46   | 4 , 23     | 14 , 18    |
| MLA          | 4 , 02  | 14 , 93   | 4 , 22     | 14 , 22    |
| Springer     | 4 , 49  | 13 , 38   | 5 , 89     | 10 , 19    |

Anmerkung. Die Performance-Messungen wurden mit aktivierter DOI-Suche durchgeführt. Die Zitierstile sind nach der Performance der LLM-Pipeline aufsteigend sortiert.

Die Standardabweichungen der Gesamtverarbeitungszeit lagen durchgängig in derselben Größenordnung wie die Mittelwerte, was auf eine hohe Varianz in den Antwortzeiten externer Dienste hinweist. Dies ist ein charakteristisches Merkmal verteilter Systeme mit multiplen API-Abhängigkeiten.

Performance unter erschwerten Bedingungen. Die Performance unter erschwerten Bedingungen wurde für zwei Szenarien analysiert: modifizierte Referenzen mit typischen manuellen Fehlern und synthetische, nicht-existente Referenzen.

Die Verarbeitung künstlich verfälschter Referenzen erforderte in der LLM-Pipeline signifikant mehr Zeit (+79% bei APA: 2 , 58s → 4 , 62s). Die AnyStyle-Pipeline verlangsamte sich um +72 % (APA: 2 , 34 s → 4 , 04 s). Diese Verlangsamung resultiert aus der komplexeren unscharfen Suche, da verrauschte Metadaten weniger präzise Treffer in den Datenbanken lieferten und die Early Termination seltener ausgelöst wurde.

Die Erkennung synthetischer, nicht-existenter Quellen erwies sich als rechenintensivste Operation mit durchschnittlich 23 , 58 s pro Referenz in der LLM-Pipeline und 21 , 48 s in der AnyStyle-Pipeline. Dies entspricht einer Verlangsamung um den Faktor 9,1 bzw. 9,2 gegenüber existenten Quellen. Diese massive Performance-Einbuße erklärt sich durch die umfassende Suchstrategie: Während bei existenten Quellen die Early Termination die Suche früh beendet, müssen bei nicht-existierenden Quellen alle konfigurierten Metadatenquellen vollständig durchsucht werden, bevor ein 'No Match' festgestellt werden kann.

Die Deaktivierung der DOI-Suche führte unter Störbedingungen zu einer weiteren Verlangsamung, wobei die LLM-Pipeline auf 5 , 69s und die AnyStyle-Pipeline auf 6 , 00s anstieg. Dies unterstreicht die Bedeutung eindeutiger Identifikatoren für die Performance insbesondere bei fehlerhaften Eingabedaten.

Performance-Analyse nach Systemkomponenten. Die Analyse der über alle Zitierstile gemittelten Verarbeitungszeiten (Tabelle 19) zeigt charakteristische Leistungsprofile und erhebliche Unterschiede zwischen den Extraktionspipelines.

In der Extraktionsphase war die sequenzstatistische, CRF-basierte AnyStyleExtraktion mit durchschnittlich 0 , 10 s um mehr als eine Größenordnung schneller als die LLM-gestützte Extraktion mit 2 , 20s. Dieser deutliche Geschwindigkeitsvorteil wird in vielen Fällen jedoch durch längere Suchzeiten in nachgelagerten Verarbeitungsschritten wieder kompensiert.

Bei den Metadatenbank-Abfragen zeigten sich ebenfalls klare Unterschiede. Die Suchzeiten in Crossref fielen in der LLM-Pipeline mit 0 , 28s deutlich geringer aus als in der AnyStyle-Pipeline mit 0 , 84s, während sich bei Europe PMC ein umgekehrtes Verhältnis ergab. arXiv erwies sich als langsamste Quelle in beiden Pipelines (LLM: 13 , 79 s, AnyStyle: 14 , 03 s). Der Grund für diese Verzögerung ist eine bewusst implementierte Wartezeit von 3 s zwischen den Anfragen, die sicherstellt, dass arXivRichtlinien eingehalten werden und eine zuverlässige Nutzung ohne Blockierungen Anmerkung. Die Verarbeitungszeiten wurden als Durchschnitt über alle Zitierstile mit aktivierter DOI-Suche ermittelt.

Tabelle 19 Durchschnittliche Verarbeitungszeiten pro Systemkomponente

| Systemkomponente    | LLM-Pipeline   | AnyStyle-Pipeline   |
|---------------------|----------------|---------------------|
|                     | s              | s                   |
| Extraktion          |                |                     |
| LLM-Extraktion      | 2 , 20         | -                   |
| AnyStyle-Parsing    | -              | 0 , 10              |
| Metadatenbank-Suche |                |                     |
| Crossref            | 0 , 28         | 0 , 84              |
| OpenAlex            | 0 , 74         | 0 , 88              |
| Europe PMC          | 0 , 37         | 0 , 35              |
| Semantic Scholar    | 2 , 41         | 1 , 98              |
| arXiv               | 13 , 79        | 14 , 03             |
| Matching            | 0 , 005        | 0 , 005             |

möglich bleibt.

Der eigentliche Matching-Algorithmus trug hingegen kaum zur Gesamtlatenz bei. Mit durchschnittlich 0 , 005 s pro Referenz zeigte er in beiden Pipelines eine exzellente Performance und stellte zu keinem Zeitpunkt einen relevanten Engpass dar.

Einflussfaktoren auf die Performance. Die aktivierte Early-TerminationOptimierung mit einem Schwellenwert von 90 % Score erwies sich als entscheidender Performance-Faktor. Wie der direkte Vergleich der Performance mit und ohne Early Termination für APA-Referenzen mit DOI in Tabelle 20 zeigt, reduzierte sich die Verifikationszeit durch Early Termination um 85 % bis 90 %. Konkret beschleunigte sich die LLM-Pipeline von 21 , 17 s auf 2 , 58 s pro Referenz, was einer Reduktion von 88 % entspricht, während die AnyStyle-Pipeline von 17 , 47 s auf 2 , 34 s pro Referenz beschleunigt wurde, was einem Rückgang von 87 % gleichkommt. Trotz dieser drastischen Beschleunigung blieb die Verifikationsqualität praktisch unverändert, mit minimalen Score-Reduktionen von weniger als 0 , 1% in beiden Pipelines. In der praktischen Auswirkung bedeutet dies für ein typisches Literaturverzeichnis mit 50 Referenzen mit DOI, dass die Verifikationszeit von ursprünglich 17 , 6 min bis 21 , 2 min ohne Early Termination auf ein für den Arbeitsalltag akzeptables Maß von nur noch 2 , 0 min bis 2 , 5 min mit Early Termination sinkt. Diese Ergebnisse validieren die Architekturentscheidung für Early Termination als essenziell für die Praxistauglichkeit, da sie die Verifikationszeit drastisch reduziert, ohne die Genauigkeit signifikant zu beeinträchtigen.

Ein weiterer bedeutender Faktor war der Vergleich zwischen DOI-basierter und Metadaten-basierter Suche . Die Deaktivierung der DOI-Suche führte durchgängig zu Anmerkung. Die Performance-Messungen wurden am echten APA-Referenzen-Datensatz mit aktivierter DOI-Suche durchgeführt. Die Early Termination war mit einem Schwellenwert von 90 % konfiguriert.

Tabelle 20 Vergleich der Systemperformance mit und ohne Early Termination

| Pipeline               | Ø-Zeit/Ref. s   | Durchsatz Ref/min   | Ø-Score %   |
|------------------------|-----------------|---------------------|-------------|
| LLM                    |                 |                     |             |
| Ohne Early Termination | 21 , 17         | 2 , 83              | 99 , 19     |
| Mit Early Termination  | 2 , 58          | 23 , 26             | 99 , 11     |
| AnyStyle               |                 |                     |             |
| Ohne Early Termination | 17 , 47         | 3 , 43              | 96 , 76     |
| Mit Early Termination  | 2 , 34          | 25 , 64             | 96 , 61     |

längeren Gesamtverarbeitungszeiten über alle Zitierstile hinweg, wobei der Effekt in der AnyStyle-Pipeline stärker ausfiel. Besonders signifikant war der PerformanceEinbruch bei APA in der AnyStyle-Pipeline mit einer Erhöhung um 66 % von 2 , 34 s auf 3 , 88 s, bei IEEE in der LLM-Pipeline mit einem Anstieg um 32 % von 3 , 10 s auf 4 , 11 s sowie bei Chicago in der LLM-Pipeline mit einer Verlängerung um 21 % von 3 , 37 s auf 4 , 07 s. Diese Ergebnisse unterstreichen die Bedeutung eindeutiger Identifikatoren nicht nur für die Verifikationsqualität, sondern auch für die Systemperformance.

Praxisrelevanz und Implikationen. Die gemessenen Performance-Kennzahlen bestätigen die Praxistauglichkeit des Systems für den wissenschaftlichen Arbeitsalltag. Bei einem typischen Literaturverzeichnis mit 20-50 Referenzen beträgt die vollständige Verifikation in der LLM-Pipeline unter idealen Bedingungen nur etwa 1 min bis 4 min bei einem Durchsatz von 13 , 38 Referenzen / min bis 23 , 26 Referenzen / min, während die AnyStyle-Pipeline unter denselben Bedingungen 1 min bis 14 min bei einer Bandbreite von 3 , 60Referenzen / min bis 25 , 64Referenzen / min benötigt. Unter anspruchsvolleren Bedingungen mit verrauschten Daten in der LLM-Pipeline erhöht sich die Verifikationszeit auf etwa 2 min bis 4 min bei 12 , 99 Referenzen / min. Für die kritische Qualitätskontrolle in der LLM-Pipeline sind 8 min bis 20 min bei einem reduzierten Durchsatz von 2 , 54Referenzen / min erforderlich. Der bewusste Trade-off zwischen Vollständigkeit und Geschwindigkeit bei der Identifikation nichtexistenter Quellen erscheint dabei gerechtfertigt, da maximale Verlässlichkeit in diesem kritischen Anwendungsfall priorisiert werden muss.

Fazit zur Systemperformance. Das entwickelte Verifikationssystem erreicht eine praxistaugliche Performance, die den Anforderungen an die Integration in wissenschaftliche Workflows entspricht. Die durchschnittliche Verarbeitungszeit von 2 , 58 s bis 4 , 49 s pro Referenz in der LLM-Pipeline für existierende Quellen stellt eine signifikante Effizienzsteigerung gegenüber manueller Überprüfung dar, selbst bei umfangreichen Literaturverzeichnissen.

Die Performance-Analyse offenbart charakteristische Unterschiede zwischen den Extraktionspipelines: Während die AnyStyle-Pipeline in der Extraktionsphase deutlich schneller ist, kann er in der Suchphase aufgrund weniger präziser Metadatenextraktion länger benötigen. Dieser Trade-off unterstreicht die Bedeutung der Wahl der Extraktionspipeline in Abhängigkeit vom Anwendungsfall. AnyStyle eignet sich insbesondere für standardkonforme Referenzen mit hohem Performance-Bedarf, während LLM bei komplexen oder fehlerhaften Referenzen Vorteile bietet, wenn hohe Genauigkeitsanforderungen im Vordergrund stehen.

Die durchgängig niedrigen Bearbeitungszeiten in der LLM-Pipeline für existierende Quellen bestätigen damit Hypothese H2. Die architektonischen Entscheidungen, insbesondere die duale Extraktionsstrategie mit klarem Performance-Trade-off, die prioritätsbasierte sequentielle Suche mit Early Termination und die clientseitige Orchestrierung, erweisen sich als leistungsoptimierend.

Damit erfüllt das System die nicht-funktionalen Anforderungen NFR-02 (geringe Antwortzeit) und NFR-03 (hoher Durchsatz) aus der Konzeption und bietet gleichzeitig die für den wissenschaftlichen Einsatz notwendige Balance zwischen Geschwindigkeit und Verlässlichkeit.

## 7.4 Fazit und Zusammenfassung

Die umfassende technische Evaluation validiert die Leistungsfähigkeit des entwickelten Verifikationssystems und bestätigt beide zugrundeliegenden Hypothesen. Die strukturierte Analyse entlang der vier Dimensionen Verifikationsgenauigkeit, Robustheit, Erkennung nicht-existenter Quellen und Systemperformance ermöglichte eine systematische Bewertung.

Die Ergebnisse belegen die Erfüllung von Hypothese H1 (Mindestgenauigkeit von 90 %) in beiden Extraktionspipelines. Die LLM-Pipeline übertrifft diese Anforderung bei idealen Eingabedaten mit durchschnittlich über 99 % deutlich, während die AnyStyle-Pipeline je nach Zitierstil zwischen 71 , 86% und 96 , 61% erreicht. Auch unter erschwerten Bedingungen beweist das System Robustheit, wobei die LLMPipeline mit 96 , 22% gegenüber modifizierten Referenzen stabiler abschneidet als die AnyStyle-Pipeline mit 94 , 06%. Als herausragendes Ergebnis ist die perfekte Erkennung von KI-generierten Halluzinationen in beiden Pipelines zu werten.

Ebenso wird Hypothese H2 (praxistaugliche Performance) empirisch bestätigt. Die durchschnittliche Verifikationszeit pro Referenz liegt in der LLM-Pipeline bei 2 , 58 s bis 4 , 49 s für existente Quellen, in der AnyStyle-Pipeline zwischen 2 , 34 s und 16 , 68 s in Abhängigkeit vom Zitierstil. Diese Ergebnisse unterstreichen die Praxistauglichkeit für den wissenschaftlichen Arbeitsalltag und offenbaren den charakteristischen Performance-Trade-off zwischen beiden Extraktionspipelines.

Die Evaluation belegt die Effektivität der dualen Architektur: Die LLM-Pipeline erweist sich als optimale Wahl für anspruchsvolle Anwendungsfälle mit hohen Genauigkeitsanforderungen, insbesondere bei variierenden Zitierstilen und fehlerhaften Eingabedaten. Die AnyStyle-Pipeline bietet hingegen maximale Effizienz für standardkonforme Referenzen und ist vorteilhaft für Nutzer mit Datenschutzbedenken oder ohne Zugang zu KI-Diensten.

Methodisch erwiesen sich die kuratierten Testdatensätze als wertvolles Instrument zur systematischen Messung. Die identifizierten Leistungscharakteristika entsprechen den Erwartungen an ein verteiltes System mit multiplen externen Abhängigkeiten, wobei die implementierten Resilienzmechanismen und der effiziente Kernalgorithmus ihre Wirksamkeit unter Beweis stellten.

Die durchgängige Erfüllung der nicht-funktionalen Anforderungen NFR-01 (Zuverlässigkeit), NFR-02 (Antwortzeit) und NFR-03 (Durchsatz) belegt die technische Reife der Lösung. Damit bilden die Evaluationsergebnisse eine solide Grundlage für die Diskussion der wissenschaftlichen und praktischen Implikationen im folgenden Kapitel, in denen diese technische Leistungsfähigkeit in den breiteren Kontext der Referenzverifikation im Zeitalter generativer KI-Systeme eingeordnet wird.

## 8 Diskussion

Dieses Kapitel diskutiert die zentralen Ergebnisse der vorliegenden Arbeit im Kontext der Forschungsfragen und des wissenschaftlichen Umfelds. Aufbauend auf den empirischen Befunden der Evaluation (Kapitel 7) werden die Implikationen der entwickelten Browser-Erweiterung zur Referenzverifikation analysiert, kritisch reflektiert und in den weiteren Forschungskontext eingeordnet. Die Diskussion beginnt in Abschnitt 8.1 mit einer Zusammenfassung und Interpretation der zentralen Ergebnisse vor dem Hintergrund der ursprünglichen Forschungsziele und Nutzeranforderungen aus der Vorstudie. Darauf aufbauend erfolgt in Abschnitt 8.2 die Einordnung der Ergebnisse in den theoretischen Rahmen von ER sowie die Positionierung im Vergleich zum Stand der Technik. Abschnitt 8.3 widmet sich einer kritischen Würdigung der technischen Stärken des Systems und analysiert systematisch die identifizierten Limitationen. Den Abschluss bildet Abschnitt 8.4, in dem konkrete Implikationen für die wissenschaftliche Praxis sowie Perspektiven für zukünftige Forschung abgeleitet werden. Durch diese strukturierte Analyse wird ein umfassendes Verständnis der Bedeutung, Reichweite und Grenzen der entwickelten Lösung erreicht.

## 8.1 Zusammenfassung und Interpretation der zentralen Ergebnisse

Die technische Evaluation der entwickelten Browser-Erweiterung demonstriert eine hohe Leistungsfähigkeit in der formalen Referenzverifikation, offenbart jedoch einen charakteristischen Trade-off zwischen den beiden implementierten Extraktionspipelines. Die überragende Matching-Genauigkeit der LLM-gestützten Pipeline von durchschnittlich 99 , 11 % bei APA-Referenzen (Tabelle 10) übertrifft die in Hypothese H1 postulierte Mindestanforderung von 90 % deutlich und belegt die Effektivität dieses robusten, KI-gestützten Ansatzes. Die CRF-basierte AnyStyle-Pipeline erreicht mit 96 , 61 % ebenfalls ein exzellentes Niveau, das die Hypothese klar bestätigt, zeigt jedoch eine stärkere Abhängigkeit von standardkonformen Eingabedaten.

Diese Spitzenwerte sind insbesondere auf das konfigurierbare, gewichtete ScoringModell zurückzuführen, das die unterschiedliche diskriminierende Kraft bibliografischer Metadaten systematisch berücksichtigt. Die Analyse über elf Zitierstile hinweg unterstreicht die überlegene Robustheit der LLM-Pipeline, die durchweg hohe Genauigkeit (Ø &gt; 95 , 19 %) erzielt, während die Leistung des AnyStyle-Parsers stark variiert (Ø 71 , 86 % bis 96 , 61 %) und für bestimmte Stile wie ACS oder AMA deutlich einbricht. Dieser fundamentale Unterschied operationalisiert den Zielkonflikt zwischen maximaler Flexibilität (LLM) und deterministischer, datensparsamer Verarbeitung (AnyStyle).

Besonders hervorzuheben ist die perfekte Erkennungsrate von 100 % für nichtexistente, KI-generierte Referenzen in beiden Pipelines. Dieses Ergebnis adressiert unmittelbar die in der Einleitung identifizierte Kernherausforderung von KIHalluzinationen. Interessanterweise liefert die AnyStyle-Pipeline dabei durchweg niedrigere Ähnlichkeits-Scores (Ø 21 , 00% vs. 31 , 18% bei der LLM-Pipeline), was die Trennung zwischen existenten und halluzinierten Quellen zusätzlich verstärkt.

Die Performance-Messungen bestätigen die Praxistauglichkeit des Systems, verdeutlichen jedoch den genannten Trade-off. Mit einer durchschnittlichen Verifikationszeit von 2 , 58s (LLM) bzw. 2 , 34s (AnyStyle) pro Referenz wird Hypothese H2 (unter 3 s) klar erfüllt. Eine differenzierte Betrachtung offenbart, dass die extrem schnelle AnyStyle-Extraktion (Ø 0 , 05 s) oft durch längere Suchzeiten in nachgelagerten Schritten kompensiert wird, während der langsamere LLM-Extraktionsschritt (Ø 2 , 07 s) häufig zu qualitativ hochwertigeren Suchanfragen und damit effizienterer Gesamtperformance führt.

Die in der Vorstudie (Kapitel 4) identifizierten Nutzerbedarfe werden durch die entwickelte Lösung in vollem Umfang adressiert: Die drei Hauptprobleme der Befragten umfassen zeitintensive manuelle Suche (62 , 8 %), inkonsistente Formatierung (42 , 4 %) und nicht-existierende Referenzen (40 , 0 %). Diese werden durch die Automatisierung des Prüfprozesses, die duale und damit robuste Extraktionspipeline und die zuverlässige Erkennung halluzinierter Quellen systematisch gelöst. Die konfigurierbare Wahl zwischen den Pipelines erlaubt es Nutzenden zudem, je nach Anforderung (Geschwindigkeit vs. Robustheit) den für sie optimalen Workflow zu wählen.

## 8.2 Einordnung in den Stand der Technik und theoretischen Rahmen

Die architektonische Konzeption der Verifikationspipeline bestätigt und erweitert das etablierte ER-Paradigma für den speziellen Anwendungsfall der Referenzverifikation. Die vier Phasen: Extraktion und Normalisierung, Kandidatengenerierung, Vergleich und Bewertung sowie Klassifikation und Verifikation erwiesen sich als tragfähiges Fundament für eine deterministische und reproduzierbare Verifikation. Die Evaluationsergebnisse belegen, dass der gewählte Ansatz nicht nur für die Verknüpfung variierender Darstellungen existierender Entitäten geeignet ist, sondern insbesondere auch für die Identifikation halluzinierter Referenzen, was angesichts der zunehmenden Verbreitung generativer KI-Systeme in der Wissenschaft von besonderer Relevanz ist.

Im Vergleich zu bestehenden Lösungen hebt sich die entwickelte Erweiterung durch mehrere innovative Aspekte ab. Erstens kombiniert die duale Extraktionsstrategie die deterministische Robustheit eines CRF-basierten Parsers mit der Adaptivität LLM-gestützter Verfahren und bietet damit eine bisher nicht verfügbare Flexibilität. Zweitens gewährleistet die Integration multipler Metadatenquellen eine hohe Abdeckung über verschiedene Fachdomänen hinweg, wobei die clientseitige Orchestrierung mit Early-Termination-Mechanismus eine optimale Balance zwischen Performance und Verlässlichkeit ermöglicht. Drittens erlaubt das konfigurierbare Scoring-Modell mit seinen Feldgewichtungen und Schwellenwerten eine Anpassung an unterschiedliche wissenschaftliche Domänen und adressiert damit eine zentrale Limitation vieler existierender Tools.

Im Unterschied zu DOI-zentrierten Prüfungen oder reinen Metadaten-APIs verbindet das entwickelte Artefakt Extraktion und Normalisierung mit einer kontrollierten Kandidatensuche, einer feldweisen Ähnlichkeitsbewertung und einer nachvollziehbaren Entscheidungsfindung zu einem konsistenten Gesamtprozess. Die Evaluation belegt die Mehrwerte dieses integrierten Ansatzes durch die hohe Verifikationsgenauigkeit über verschiedene Zitierstile und Publikationstypen hinweg, die zuverlässige Erkennung nicht existenter Quellen sowie praxistaugliche Laufzeiten.

## 8.3 Kritische Würdigung von Stärken und Limitationen

Die Evaluation offenbart ein differenziertes Bild von bemerkenswerten Stärken und systematisch identifizierbaren Limitationen. Die herausragende Gesamtperformance des Systems lässt sich auf mehrere fundierte Designentscheidungen zurückführen. Das gewichtete Scoring-Modell erweist sich als besonders effektiv, da es die unterschiedliche diskriminierende Kraft bibliografischer Metadaten systematisch berücksichtigt. Die duale Extraktionsstrategie erweist sich als zentrale architektonische Stärke, die unterschiedliche Nutzerbedarfe adressiert und charakteristische Leistungsprofile bietet. Die clientseitige Orchestrierung des Verifikationsprozesses mit ihrem EarlyTermination-Mechanismus ermöglicht zudem eine signifikante Effizienzsteigerung gegenüber manuellen Prüfverfahren.

Trotz der exzellenten Gesamtperformance zeigen sich in der Evaluation konsistente Schwächen bei bestimmten Publikationstypen. Die vergleichsweise niedrigere Verifikationsgenauigkeit für Buchkapitel stellt eine systematische Limitation dar, die beide Extraktionspipelines betrifft, wenn auch in unterschiedlichem Ausmaß. Zwar demonstrieren Nachoptimierungen der Feldgewichtung die Anpassungsfähigkeit des Systems, dennoch bleibt die Verifikation von Buchkapiteln ohne DOI eine strukturelle Herausforderung.

Ein weiterer kritischer Aspekt ist der signifikante Performance-Unterschied zwischen der Verifikation existenter und nicht-existenter Referenzen. Dieser Trade-off zwischen Vollständigkeit und Geschwindigkeit ist durch die notwendige vollständige Durchsuchung aller Metadatenquellen bedingt und stellt eine praktische Limitation für die Skalierbarkeit bei sehr großen Literaturverzeichnissen dar.

Weitere systemische Limitationen ergeben sich aus der Abhängigkeit von externen Diensten, sowohl von Metadatenquellen als auch von LLM-Anbietern, sowie aus der datenbankzentrierten Architektur, die keine Aussage über Quellen außerhalb kuratierter wissenschaftlicher Metadatenbanken treffen kann.

Zudem ist zu berücksichtigen, dass die hervorragenden Evaluationsergebnisse zur Extraktionsgenauigkeit auf einem Datensatz bereits segmentierter und wohlgeformter Einzelreferenzen basieren, während in der Praxis mit unstrukturierten Textblöcken gerechnet werden muss, was die Genauigkeit verringern könnte.

Neben diesen technischen Limitationen sind auch methodische Einschränkungen der durchgeführten Evaluation zu benennen. Die Konzentration auf eine technische Evaluation der Kernfunktionalität führte dazu, dass bewusst auf eine UsabilityEvaluation mit realen Nutzern verzichtet wurde, obwohl die Benutzerfreundlichkeit in der Vorstudie als wichtiges Kriterium identifiziert wurde. Ebenfalls nicht Gegenstand dieser Arbeit war eine vergleichende Nutzerstudie, die die hypothetische Zeitersparnis empirisch unter realen Arbeitsbedingungen validiert hätte. Schließlich bleiben Fragen zur externen Validität unter realen Nutzungsbedingungen, da die verwendeten Testdatensätze nur einen Ausschnitt möglicher Fehlervarianten abdecken und die Übertragbarkeit auf andere Fachdomänen weiter untersucht werden müsste.

## 8.4 Implikationen für Forschung und Praxis

Die entwickelte Browser-Erweiterung zur Referenzverifikation und deren umfassende Evaluation haben bedeutende Implikationen für die wissenschaftliche Praxis. Sie liefert ein unmittelbar einsetzbares Werkzeug, das signifikante Verbesserungen in zentralen wissenschaftlichen Arbeitsprozessen verspricht. Für Forschende und Studierende bietet die Erweiterung eine effiziente Lösung zur Qualitätssicherung von Literaturverzeichnissen, die den dokumentierten Zeitaufwand für manuelle Quellenprüfungen von durchschnittlich 5 min pro Referenz auf wenige Sekunden reduziert. Die duale Extraktionsstrategie ermöglicht dabei eine anwendungsspezifische Optimierung zwischen Geschwindigkeit und Robustheit. Besonders im Betreuungskontext wissenschaftlicher Arbeiten, einem von 69 , 4 % der Befragten als besonders nützlich erachteten Anwendungskontext, kann das Tool dazu beitragen, die Integrität von Quellenangaben zu gewährleisten und gleichzeitig den Betreuungsaufwand zu verringern. Im Kontext der zunehmenden Nutzung generativer KI-Systeme positioniert sich die entwickelte Lösung zudem als essentielles Werkzeug zur Risikominimierung, indem sie die perfekte Erkennungsrate für nicht-existente Referenzen bietet und nahtlos in browserbasierte Workflows integriert ist.

Die gewonnenen Erkenntnisse eröffnen mehrere vielversprechende Forschungsrichtungen. Die identifizierte Herausforderung bei der Verifikation von Buchkapiteln verweist auf einen grundlegenden Forschungsbedarf zur Verbesserung der Metadatenerfassung und -standardisierung für diese Publikationsform. Zukünftige Arbeiten könnten erweiterte Parsing-Ansätze untersuchen, die spezifisch auf die komplexe Struktur von Buchkapiteln zugeschnitten sind. Ebenso bietet sich die Entwicklung domänenspezifischer Matching-Algorithmen als weiterer Forschungspfad an. Die erfolgreiche Ad-hoc-Optimierung für Buchkapitel durch Konfigurationsanpassung legt zudem die Entwicklung adaptiver Matching-Strategien nahe und identifiziert die systematische Untersuchung optimaler Feldgewichtungen, Trade-offs bei der Feldauswahl und domänenspezifischer Klassifikationsschwellenwerte als zentrale Forschungsdesiderate.

Die beobachtete Performance-Disparität zwischen existenten und nicht-existenten Quellen weist auf die Notwendigkeit effizienterer Suchstrategien für negative Verifikationen hin. Forschungsarbeiten könnten hier intelligente Heuristiken entwickeln, die basierend auf Metadaten-Qualitätsindikatoren frühere Abbruchkriterien ermöglichen. Die architektonische Entscheidung für eine clientseitige Orchestrierung wirft zudem Fragen nach der Skalierbarkeit auf, die durch die Untersuchung hybrider Ansätze addressiert werden könnten.

Ergänzend zu diesen technischen Forschungsfragen ergeben sich aus den methodischen Einschränkungen dieser Arbeit konkrete Ansatzpunkte für ergänzende Evaluationsstudien, insbesondere Usability-Studien mit repräsentativen Nutzergruppen und kontrollierte Vergleichsstudien zur Quantifizierung der Effizienzsteigerung. Die in der Vorstudie von einer kleineren Gruppe geäußerte Forderung nach inhaltlichen Plausibilitätsprüfungen weist schließlich auf eine langfristige Vision hin, die über den Rahmen dieser Arbeit hinausgeht und die entwickelte formale Verifikation um semantische Analysen zur inhaltlichen Relevanz und kontextuellen Passgenauigkeit erweitern könnte.

## 9 Fazit

Diese Masterarbeit verfolgte das Ziel, eine wissenschaftlich fundierte und nutzerzentrierte Browser-Erweiterung zur automatisierten Verifikation bibliografischer Referenzen zu entwickeln und zu evaluieren. Die zentralen, einleitend formulierten Forschungsfragen können auf Basis der erzielten Ergebnisse wie folgt beantwortet werden:

Auf die erste Forschungsfrage, wie ein System zur automatisierten Referenzverifikation konzipiert werden muss, um reproduzierbare und nachvollziehbare Entscheidungen zu gewährleisten , gibt die Arbeit eine umfassende Antwort, die auf mehreren fundierten Gestaltungsentscheidungen basiert. Entscheidend ist die konsequente Modellierung des Problems als ER-Prozess, operationalisiert durch eine deterministische Vier-Phasen-Pipeline aus Extraktion, Kandidatensuche, feldweisem Matching und schwellwertbasierter Klassifikation. Die geforderte Nachvollziehbarkeit wird durch eine transparente Evidenzdarstellung erreicht, die dem Nutzer die Score-Berechnung und Entscheidungsfindung detailliert offenlegt.

Die zweite Forschungsfrage zielte auf die nutzerzentrierten Anforderungen und die größten Hebel für Effizienz und Qualität . Die empirische Vorstudie identifizierte die Automatisierung der zeitintensiven manuellen Suche als zentralen Effizienzhebel und die zuverlässige Warnung vor nicht existenten Quellen als qualitätskritischen Hebel. Die Konzeption und Implementierung adressierte diese Punkte durch eine duale Extraktionsstrategie, eine konfigurierbare Multi-Source-Suche sowie eine klare, farbcodierte Klassifikation, die den Nutzer gezielt auf potenzielle Probleme hinweist.

Die dritte Forschungsfrage untersuchte die Genauigkeit, Robustheit und Effizienz des Tools unter praxisnahen Bedingungen . Die Evaluation belegt eine hohe Leistungsfähigkeit: Bei echten APA-Referenzen wurden 93 % als exakte Treffer identifiziert (Ø-Score: 99 , 11 %), die Pipeline erwies sich als robust gegenüber Formatierungsfehlern (Ø-Score modifizierter Referenzen: 96 , 22%) und erkannte synthetische, nicht existente Quellen zuverlässig (100 %). Mit einer durchschnittlichen Verarbeitungszeit von unter drei Sekunden pro Referenz ist das System für den praktischen Einsatz effizient genug.

Damit wurde das übergeordnete Forschungsziel erreicht. Die Arbeit leistet einen belastbaren Beitrag, indem sie eine methodische Lücke zwischen einfachen DOIValidierungen und einer ganzheitlichen, theoriegeleiteten Verifikationslösung schließt. Das entwickelte Tool demonstriert, dass die Risiken KI-generierter Quellenhalluzinationen durch einen skalierbaren, ER-basierten Ansatz wirksam adressiert werden können.

Die Aussagekraft der Ergebnisse ist durch die Verwendung kuratierter Datensätze und die Abhängigkeit von externen Metadatenquellen begrenzt. Herausforderungen wie Autorennamensambiguitäten oder domänenspezifische Zitierkonventionen bleiben bestehen. Gerade diese Grenzen zeigen jedoch konkrete Anknüpfungspunkte für die weitere Forschung auf.

Eine vielversprechende Perspektive liegt in der Erweiterung der Evaluationsbasis auf breitere und heterogenere Testdaten, um die Generalisierbarkeit der hohen Verifikationsgenauigkeit für weitere wissenschaftliche Domänen und weniger verbreitete Publikationstypen systematisch zu untermauern. Gleichzeitig erscheint die vertiefte Integration in etablierte wissenschaftliche Workflows als logischer nächster Schritt, um die Akzeptanz und praktische Tauglichkeit der Lösung in alltäglichen Forschungsund Lehrszenarien, wie sie in der Vorstudie als kritisch identifiziert wurden, weiter zu steigern. Um den Fortschritt auf diesem Gebiet langfristig vergleichbar und messbar zu machen, besteht zudem ein klarer Bedarf an der Etablierung standardisierter Benchmarks für die Bewertung von Referenzverifikationssystemen und deren Fähigkeit zur Erkennung halluzinierter Quellen. Abschließend könnten Feldevaluationen in realen Anwendungskontexten wertvolle Erkenntnisse über die Nutzerakzeptanz und die tatsächliche entlastende Wirkung im wissenschaftlichen Arbeitsalltag liefern.

Insgesamt unterstreicht diese Arbeit den Nutzen einer theoretisch fundierten, empirisch informierten und gestaltungsorientierten Entwicklung. Sie schafft eine solide Grundlage, um die Nachvollziehbarkeit und Integrität wissenschaftlicher Arbeit im Zeitalter generativer KI-Systeme nachhaltig zu stärken.

## Literaturverzeichnis

- Agrawal, A., Suzgun, M., Mackey, L., &amp; Kalai, A. T. (2023). Do Language Models Know When They're Hallucinating References? EACL 2024 - 18th Conference of the European Chapter of the Association for Computational Linguistics, Findings of EACL 2024 , 912-928. https://arxiv.org/abs/2305.18248v3
- Aljamaan, F., Temsah, M. H., Altamimi, I., Al-Eyadhy, A., Jamal, A., Alhasan, K., Mesallam, T. A., Farahat, M., &amp; Malki, K. H. (2024). Reference Hallucination Score for Medical Artificial Intelligence Chatbots: Development and Usability Study. JMIR medical informatics , 12 . https://doi.org/10.2196/54345
- Alkaissi, H., &amp; McFarlane, S. I. (2023). Artificial Hallucinations in ChatGPT: Implications in Scientific Writing. Cureus . https://doi.org/10.7759/CUREUS.35179
- Allen Institute for AI. (2025a). About Semantic Scholar. https://www.semanticscholar. org/about
- Allen Institute for AI. (2025b). Semantic Scholar Academic Graph API. https: //www.semanticscholar.org/product/api
- Allen Institute for AI. (2025c). TLDR Feature - Automatically generated singlesentence summaries. https://www.semanticscholar.org/product/tldr
- AnyStyle Project. (2025). AnyStyle: Bibliographic Reference Parser. https://anystyle. io/
- Anzaroot, S., &amp; Mccallum, A. (2013). A New Dataset for Fine-Grained Citation Field Extraction. http://iesl.cs.umass.
- Aria, M., Le, T., Cuccurullo, C., Belfiore, A., &amp; Choe, J. (2023). openalexR: An R-Tool for Collecting Bibliometric Data from OpenAlex. R Journal , 15 (4), 167-180. https://doi.org/10.32614/RJ-2023-089/
- Bennett, F. (2025). citeproc-js: A JavaScript implementation of the Citation Style Language (CSL). https://citeproc-js.readthedocs.io/
- Bilenko, M., Mooney, R., Cohen, W., Ravikumar, P., &amp; Fienberg, S. (2003). Adaptive name matching in information integration. IEEE Intelligent Systems , 18 (5), 16-23. https://doi.org/10.1109/MIS.2003.1234765
- Binette, O., &amp; Steorts, R. C. (2022). (Almost) all of entity resolution. Science advances , 8 (12). https://doi.org/10.1126/SCIADV.ABI8021
- Chelli, M., Descamps, J., Lavoué, V., Trojani, C., Azar, M., Deckert, M., Raynier, J. L., Clowez, G., Boileau, P., &amp; Ruetsch-Chelli, C. (2024). Hallucination Rates and Reference Accuracy of ChatGPT and Bard for Systematic Reviews: Comparative Analysis. J Med Internet Res 2024;26:e53164 https://www.jmir.org/2024/1/e53164 , 26 (1), e53164. https://doi.org/10.2196/ 53164
- Christen, P. (2012). Data matching: Concepts and techniques for record linkage, entity resolution, and duplicate detection . https://doi.org/10.1007/978-3-642-31164-2

- Cioffi, A., &amp; Peroni, S. (2022). Structured references from PDF articles: assessing the tools for bibliographic reference extraction and parsing. https://arxiv. org/pdf/2205.14677
- Citation Style Language. (2025a). Citation Style Language (CSL) - Home. https: //citationstyles.org/
- Citation Style Language. (2025b). CSL Specification. https://docs.citationstyles.org/ en/stable/specification.html
- Citation Style Language. (2025c). CSL-JSON Schema. https://github.com/citationstyle-language/schema
- Citation.js. (2025a). Citation.js - Home. https://citation.js.org/
- Citation.js. (2025b). Output formats and CSL plugin. https://citation.js.org/api/0. 7/plugin-csl.html
- Creswell, J. W., &amp; Clark, V. L. P. (2017). Designing and Conducting Mixed Methods Research, 520. https://collegepublishing.sagepub.com/products/designingand-conducting-mixed-methods-research-3-241842
- Crossref. (2021). Tips for using the Crossref REST API. https://www.crossref.org/ documentation/retrieve-metadata/rest-api/tips-for-using-the-crossref-restapi/
- Crossref. (2025a). Content Registration. https://www.crossref.org/services/contentregistration/
- Crossref. (2025b). Metadata Retrieval. https://www.crossref.org/services/metadataretrieval/
- Crossref. (2025c). REST API: Retrieve metadata. https://www.crossref.org/ documentation/retrieve-metadata/rest-api/
- Crossref. (2025d). Simple Text Query. https://www.crossref.org/documentation/ retrieve-metadata/simple-text-query/
- DataCite. (2025a). Mission &amp; Vision. https://datacite.org/mission/
- DataCite. (2025b). REST API Guide. https://support.datacite.org/docs/api
- DataCite Metadata Working Group. (2024). DataCite Metadata Schema Documentation for the Publication and Citation of Research Data and Other Research Outputs - DataCite Metadata Schema 4.6 documentation. https://datacitemetadata-schema.readthedocs.io/en/4.6/
- DBLP. (2025a). dblp computer science bibliography. https://dblp.org/
- DBLP. (2025b). How accurate is the data in dblp? https://dblp.org/faq/How+ accurate+is+the+data+in+dblp.html
- DBLP. (2025c). How does dblp handle homonyms and synonyms? https://dblp.org/ faq/How+does+dblp+handle+homonyms+and+synonyms.html
- DBLP. (2025d). How to cite the dblp data set? https://dblp.org/faq/4621382

- F. J. Pinzolits, R. (2023). AI in academia: An overview of selected tools and their areas of application. MAP Education and Humanities , 4 (1), 37-50. https: //doi.org/10.53880/2744-2373.2023.4.37
2. Fernández-Molina, J.-C., &amp; De La Rosa, F. E. (2024). Copyright and Text and Data Mining: Is the Current Legislation Sufficient and Adequate? Libraries and the Academy , 24 (3), 653-672.
3. Fiil-Flynn, S. M., Butler, B., Carroll, M., Cohen-Sasson, O., Craig, C., Guibault, L., Jaszi, P., Jütte, B. J., Katz, A., Quintais, J. P., Margoni, T., de Souza, A. R., Sag, M., Samberg, R., Schirru, L., Senftleben, M., Tur-Sinai, O., &amp; Contreras, J. L. (2022). Legal reform to enhance global text and data mining research. Science , 378 (6623), 951-953. https://doi.org/10.1126/SCIENCE. ADD6124/ASSET/E3B815DE-C8A3-4698-B226-A9E82E215098/ASSETS/ GRAPHIC/SCIENCE.ADD6124-F2.SVG
4. Forschungsgemeinschaft, D. (2025, Januar). Guidelines for Safeguarding Good Research Practice. Code of Conduct. https://doi.org/10.5281/zenodo.14281892
5. Fu, A. (2021). Vitesse-webext: WebExtension Vite Starter Template. https://github. com/antfu-collective/vitesse-webext
6. Gazzarri, L. (2021). End-to-end Task Based Parallelization for Entity Resolution on Dynamic Data.
7. Glynn, A. (2025). Guarding against artificial intelligence-hallucinated citations: the case for full-text reference deposit. European Science Editing , 51 . https: //doi.org/10.3897/ese.2025.e153973
8. Grennan, M., &amp; Beel, J. (2019). 1 Billion Citation Dataset and Deep Learning Citation Extraction.
9. GROBID Developers. (2025). GROBID: Automatic extraction of scholarly document structure and references. https://github.com/kermitt2/grobid
10. Hevner, A. R., March, S. T., Park, J., &amp; Ram, S. (2004). DESIGN SCIENCE IN INFORMATION SYSTEMS RESEARCH 1. Design Science in IS Research MIS Quarterly , 28 (1), 75.
11. Hosseini, A., Ghavimi, B., Boukhers, Z., &amp; Mayr, P. (2019). EXCITE: A toolchain to extract, match and publish open literature references. Proceedings of the Joint Conference on Digital Libraries (JCDL) . https://philippmayr.github.io/ papers/JCDL2019-EXCITE-demo.pdf
12. Koller, H. R., &amp; Damerau, F. J. (1964). A technique for computer detection and correction of spelling errors. Communications of the ACM , 7 (3), 171-176. https://doi.org/10.1145/363958.363994
13. LimeSurvey GmbH. (2025). LimeSurvey: An open-source survey tool. https://www. limesurvey.org

- Lopez-Cozar, E. D., Robinson-Garcia, N., &amp; Torres-Salinas, D. (2012). Manipulating Google Scholar Citations and Google Scholar Metrics: simple, easy and tempting. https://arxiv.org/pdf/1212.0638
- Maharjan, P. (2024). Benchmark for Evaluation and Analysis of Citation Recommendation Models. Proceedings of ACM Conference (Conference'17) , 1 . https: //arxiv.org/abs/2412.07713v1
- Marchant, N. G. (2021). Statistical Approaches for Entity Resolution under Uncertainty.
- Martín-Martín, A., &amp; López-Cózar, E. D. (2021). Large coverage fluctuations in Google Scholar: a case study. 18th International Conference on Scientometrics and Informetrics, ISSI 2021 , 771-781. https://arxiv.org/pdf/2102.07571
- Martín-Martín, A., Thelwall, M., Orduna-Malea, E., &amp; Delgado López-Cózar, E. (2021). Google Scholar, Microsoft Academic, Scopus, Dimensions, Web of Science, and OpenCitations' COCI: a multidisciplinary comparison of coverage via citations. Scientometrics , 126 (1), 871-906. https://doi.org/10.1007/ S11192-020-03690-4
- MAXQDA. (2025, August). MAXQDA Official Site | All-In-One tool for qualitative data analysis. https://www.maxqda.com/
- Moslemi, M. H., Mousavi, A., Behkamal, B., &amp; Milani, M. (2025). Heterogeneity in Entity Matching: A Survey and Experimental Analysis. https://arxiv.org/ pdf/2508.08076
- OpenAI. (2025). ChatGPT. https://openai.com/chatgpt/overview/
- OpenAlex. (2024a). OpenAlex Snapshot (Download all data). https://docs.openalex. org/download-all-data/openalex-snapshot
- OpenAlex. (2024b). Snapshot data format. https://docs.openalex.org/download-alldata/snapshot-data-format
- OpenAlex. (2025). API Overview. https://docs.openalex.org/how-to-use-the-api/apioverview
- OurResearch. (2025a). OpenAlex technical documentation - Overview. https:// docs.openalex.org/
- OurResearch. (2025b). Topics - OpenAlex technical documentation. https://docs. openalex.org/api-entities/topics
- Panda, S., &amp; Kaur, N. (2024). Exploring the role of generative AI in academia: Opportunities and challenges. IP Indian Journal of Library Science and Information Technology , 9 (1), 12-23. https://doi.org/10.18231/J.IJLSIT. 2024.003
- Papadakis, G., Skoutas, D., Thanos, E., &amp; Palpanas, T. (2019). A Survey of Blocking and Filtering Techniques for Entity Resolution. arXiv preprint arXiv:1905.06167 . https://doi.org/10.1145/nnnnnnn

- Peffers, K., Tuunanen, T., Rothenberger, M. A., &amp; Chatterjee, S. (2007). A Design Science Research Methodology for Information Systems Research. Journal of Management Information Systems , 24 (3), 45-77. https://doi.org/10.2753/ MIS0742-1222240302
- Priem, J., Piwowar, H., &amp; Orr, R. (2022). OpenAlex: A fully-open index of scholarly works, authors, venues, institutions, and concepts. https://arxiv.org/pdf/ 2205.01833
- Ramadan, B., Christen, P., Liang, H., Gayler, R. W., &amp; Hawking, D. (2013). Dynamic Similarity-Aware Inverted Indexing for Real-Time Entity Resolution. Lecture Notes in Computer Science (including subseries Lecture Notes in Artificial Intelligence and Lecture Notes in Bioinformatics) , 7867 LNAI , 47-58. https: //doi.org/10.1007/978-3-642-40319-4{\_}5
- Saier, T., Luan, M., &amp; Färber, M. (2021). A Blocking-Based Approach to Enhance Large-Scale Reference Linking. https://scholar.google.com/.
- Sauvayre, R. (2022). Types of Errors Hiding in Google Scholar Data. Journal of Medical Internet Research , 24 (5), e28354. https://doi.org/10.2196/28354
- Schloss Dagstuhl - Leibniz Center for Informatics. (2025). dblp Computer Science Bibliography. https://www.dagstuhl.de/en/dblp
- Tang, J., Zuo, Y., Cao, L., &amp; Madden, S. (2022). Generic Entity Resolution Models. NeurIPS 2022 First Table Representation Workshop .
- Tang, X., Duan, X., &amp; Cai, Z. G. (2025). Large Language Models for Automated Literature Review: An Evaluation of Reference Generation, Abstract Writing, and Review Composition. http://arxiv.org/abs/2412.13612
- Tkaczyk, D., Collins, A., Sheridan, P., &amp; Beel, J. (2018). Evaluation and Comparison of Open Source Bibliographic Reference Parsers: A Business Use Case. https: //doi.org/10.48550/arXiv.1802.01168
- Tkaczyk, D., Szostek, P., Fedoryszak, M., Dendek, P. J., &amp; Bolikowski, Ł. (2015). CERMINE: Automatic extraction of structured metadata from scientific literature. International Journal on Document Analysis and Recognition , 18 (4). https://doi.org/10.1007/s10032-015-0249-8
- Ventura, S. L., Nugent, R., &amp; Fuchs, E. R. (2013). Methods Matter: Rethinking Inventor Disambiguation with Classification &amp; Labeled Inventor Records. Academy of Management Proceedings , 2013 (1), 14537. https://doi.org/10. 5465/AMBPP.2013.14537ABSTRACT
- Willighagen, L. G. (2019). Citation.js: A format-independent, modular bibliography tool for the browser and command line. PeerJ Computer Science , 2019 (8). https://doi.org/10.7717/PEERJ-CS.214
- Wu, K., Wu, E., Wei, K., Zhang, A., Casasola, A., Nguyen, T., Riantawan, S., Shi, P., Ho, D., &amp; Zou, J. (2025). An automated framework for assessing how well

LLMs cite relevant medical references. Nature Communications 2025 16:1 , 16 (1), 1-10. https://doi.org/10.1038/s41467-025-58551-6

- Ye, H., Liu, T., Zhang, A., Hua, W., &amp; Jia, W. (2023). Cognitive Mirage: A Review of Hallucinations in Large Language Models. CEUR Workshop Proceedings , 3818 , 14-36. https://arxiv.org/abs/2309.06794v1
- Zhang, X., Zou, J., Le, D. X., &amp; Thoma, G. R. (2011). A structural SVM approach for reference parsing. BMC Bioinformatics , 12 (Suppl 3), S7. https://doi.org/ 10.1186/1471-2105-12-S3-S7
- Zotero. (2025). Zotero Style Repository (CSL Styles). https://www.zotero.org/styles

## A Vorstudie

## A.1 Beispielhafte Kodierungen

Im Folgenden sind exemplarische Kodierlisten der Freitextangaben dargestellt. Die Tabellen zeigen jeweils ausgewählte Originalsegmente, die zugehörigen Dokument- und Positionsangaben sowie die im Rahmen der qualitativen Inhaltsanalyse zugewiesenen Codes. Orthografie und Ausdruck der Antworten wurden unverändert übernommen.

## A.1.1 Fachrichtungen

Die folgende Tabelle zeigt eine exemplarische Auswahl kodierter Freitextangaben zu den angegebenen Fachrichtungen der Teilnehmenden.

Tabelle A.1 Exemplarische Kodierungsliste - Fachrichtungen

| Codierte Segmente                | Dokument    | Codes                          |
|----------------------------------|-------------|--------------------------------|
| Mathematik                       | 17, Pos. 1  | Naturwiss.                     |
| Reine Infofmatik                 | 36, Pos. 1  | Ingenieur- und Technik- wiss.  |
| Pädagogik                        | 44, Pos. 1  | Geistes- und Sozialwiss.       |
| Gesundheitswesen                 | 45, Pos. 1  | Gesundheitswesen               |
| Planungswissenschaften           | 83, Pos. 1  | Ingenieur- und Technik- wiss.  |
| Humanmedizin                     | 152, Pos. 1 | Gesundheitswesen               |
| Theologie                        | 210, Pos. 1 | Geistes- und Sozialwiss.       |
| Geowissenschaften / Geographie   | 262, Pos. 1 | Naturwiss.                     |
| Rechtswissenschaft               | 294, Pos. 1 | Rechts- und Wirtschafts- wiss. |
| Veterinärmedizin (Pharmakologie) | 454, Pos. 1 | Gesundheitswesen               |

Anmerkung. Exemplarische Auswahl von zehn kodierten Freitextangaben zu angegebenen Fachrichtungen. Orthografie unverändert; keine Mehrfachkodierung.

## A.1.2 Rollen

Die folgende Tabelle enthält exemplarische Kodierungen der Rollen, in denen die Teilnehmenden in Forschung oder Lehre tätig sind.

Tabelle A.2 Exemplarische Kodierungsliste - Rollen

| Codierte Segmente                                                            | Dokument    | Codes     |
|------------------------------------------------------------------------------|-------------|-----------|
| Lehrbeauftragter                                                             | 210, Pos. 2 | Lehrkraft |
| Projektwissenschaftler                                                       | 271, Pos. 1 | Sonstiges |
| nicht Wissenschaftliche Mitarbeiterin                                        | 290, Pos. 1 | Sonstiges |
| Wissenschaftlicher Mitarbei- ter/Habilitierender Postdoc mit Lehr- tätigkeit | 454, Pos. 2 | Wiss. MA  |

Anmerkung. Exemplarische Auswahl von vier kodierten Freitextangaben zu angegebenen Rollen. Orthografie unverändert; Mehrfachkodierung möglich.

## A.1.3 Methoden der Quellenüberprüfung

Die folgende Tabelle zeigt exemplarische Angaben zu genutzten Methoden, mit denen Teilnehmende Quellenangaben überprüfen.

Tabelle A.3 Exemplarische Kodierungsliste - Methoden zur Überprüfung von Quellenangaben

| Codierte Segmente                                                                                                                                                                   | Dokument               | Codes                                                                                 |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------|---------------------------------------------------------------------------------------|
| Quelle im Original lesen Ich nehme die Quellenangabe direkt von der ursprünglichen Quelle (ACM, IEEE, Springer etc.) anstatt von einer Drittquelle (ChatGPT, Google                 | 23, Pos. 1 41, Pos. 1  | Originalquelle Lesen Verlagswebseite                                                  |
| Scholar, Wikipedia). Suchmaschine (z. B. Google) Nutzung von KI mit 'echter' Litera- tur wie Elicit etc. Archivdatenbanken wie invenio, Ar- cinsys eigene Kenntnisse des Themas und | 97, Pos. 1             | Akademische                                                                           |
| der Forschungsliteratur; Bibliotheks- kataloge                                                                                                                                      | 123, Pos. 1 84, Pos. 1 | Manuelle Suchmaschine Tools/Suchmaschinen                                             |
|                                                                                                                                                                                     | 171, Pos. 1            | Online- Datenbanken/Bibliotheken Online- Datenbanken/Bibliotheken; Stichprobe/Eigenes |
| Klicken der DOI; Aufruf des Journals auf dessen eigener Webseite                                                                                                                    | 314, Pos. 1            | DOI-Überprüfung; Ver-                                                                 |
| Prompbasiertes Nachfragen innerhalb des LLM, um erste Unstimmigkeiten                                                                                                               |                        | lagswebseite                                                                          |
| aufzudecken                                                                                                                                                                         | 411, Pos. 1            | Sonstiges                                                                             |

| Codierte Segmente                                                                                                        | Dokument    | Codes                         |
|--------------------------------------------------------------------------------------------------------------------------|-------------|-------------------------------|
| unsystematische Prüfung mit einem der angegebenen Werkzeuge. Aber noch nie systematisch für alle Quel- len einer Arbeit. | 489, Pos. 1 | Keine systematische Prü- fung |
| Eigene Literaturkenntnis lässt 'faule' Quellen auffallen.                                                                | 498, Pos. 1 | Stichprobe/Eigenes Wis- sen   |

Anmerkung. Exemplarische Auswahl von zehn kodierten Freitextangaben zu genutzten Methoden der Quellenüberprüfung. Orthografie unverändert; Mehrfachkodierung möglich.

## A.1.4 Probleme bei der Quellenüberprüfung

Die folgende Tabelle führt exemplarische Kodierungen zu typischen Problemen auf, die Teilnehmende bei der Überprüfung von Quellenangaben beschrieben haben.

Tabelle A.4 Exemplarische Kodierungsliste - Probleme bei der Überprüfung von Quellenangaben

| Codierte Segmente                                                          | Dokument    | Codes                                              |
|----------------------------------------------------------------------------|-------------|----------------------------------------------------|
| keine. Citavi und Endnote sorgen für automatisierte Überprüfung            | 22, Pos. 1  | Keine Pro- blem/Erfahrung                          |
| Zeitaufwändiges Auffinden von zitier- ten Textpassagen in Quellen ohne DOI | 28, Pos. 2  | Zeitintensive manuelle Suche; Datenlücken/- fehler |
| Universität Siegen hat keinen Zugriff auf das vollständige Dokument        | 58, Pos. 1  | Zugangsbeschränkung                                |
| Fehlende und fehlerhafte DOI                                               | 191, Pos. 1 | Datenlücken/-fehler                                |
| falscher Inhalt                                                            | 202, Pos. 2 | Falscher Inhalt                                    |
| Doppelzitationen vom Artikel und selben Artikel auf arXiv                  | 228, Pos. 1 | Doppelzitationen                                   |
| Quelle existiert, aber passt nicht mit den Aussagen der KI zusammen        | 376, Pos. 1 | Falscher Inhalt                                    |
| Klare Zitationsstandards (vorgege- ben) aber nicht richtige Anwendung      | 382, Pos. 2 | Sonstiges                                          |
| Inwiefern handelt es sich um wissen- schaftlich anerkannte Quellen         | 409, Pos. 1 | Qualitäts- /Relevanzprobleme                       |
| Verzicht auf Überprüfung (Zeitman- gel!)                                   | 498, Pos. 2 | Zeitintensive manuelle Suche                       |

Anmerkung. Exemplarische Auswahl von zehn kodierten Freitextangaben zu typischen Problemen bei der Überprüfung von Quellenangaben. Orthografie unverändert; Mehrfachkodierung möglich.

## A.1.5 Arbeitsschritte mit Relevanz für die Quellenüberprüfung

Die folgende Tabelle zeigt exemplarische Kodierungen zu Arbeitsschritten, in denen Teilnehmende eine Überprüfung von Quellenangaben als besonders nützlich empfinden.

Tabelle A.5 Exemplarische Kodierungsliste - Arbeitsschritte

| Codierte Segmente                                                                                                                    | Dokument    | Codes                          |
|--------------------------------------------------------------------------------------------------------------------------------------|-------------|--------------------------------|
| Beim Offline Lesen von Publikatio- nen, bitte kein Browser-Addon!                                                                    | 28, Pos. 3  | Beim Lesen                     |
| Overleaf                                                                                                                             | 253, Pos. 1 | Beim Schreiben                 |
| Recherche mit KI                                                                                                                     | 153, Pos. 1 | KI-gestützte Arbeits- schritte |
| Direkt beim interagieren mit Chat- bots (z. B. ChatGPT)!                                                                             | 421, Pos. 2 | KI-gestützte Arbeits- schritte |
| Beim Recherchieren von Quellen mittels KI                                                                                            | 376, Pos. 2 | KI-gestützte Arbeits- schritte |
| Masterarbeiten etc.                                                                                                                  | 134, Pos. 1 | In der Lehre                   |
| Bewertung von Hausarbeiten und Abschlussarbeiten (PDF Import not- wendig)                                                            | 466, Pos. 2 | In der Lehre                   |
| Die Zeitschriften sollten es automa- tisch kontrollieren. Mir interessieren nur die Quelle, falls ich ein Resultat drin suchen will. | 338, Pos. 1 | Sonstige                       |
| In der systematischen Literaturre- cherche hier gibt es bisher kein Tool, das alle benötigten Funktionen um- fänglich unterstützt    | 411, Pos. 3 | Sonstige                       |
| Die Industrie nutzt kein LaTeX also Finger weg!                                                                                      | 213, Pos. 2 | Sonstige                       |

Anmerkung. Exemplarische Auswahl von zehn kodierten Freitextangaben zu Arbeitsschritten, in denen eine Überprüfung von Quellenangaben als nützlich empfunden wird. Orthografie unverändert; keine Mehrfachkodierung.

## A.1.6 Wünsche an ein Tool zur Überprüfung von Quellenangaben

Die folgende Tabelle enthält exemplarische Kodierungen zu geäußerten Wünschen in Bezug auf Systeme zur Quellenüberprüfung.

Tabelle A.6 Exemplarische Kodierungsliste - Wünsche an ein Tool zur Überprüfung von Quellenangaben

| Codierte Segmente                                                                                                                                                                                                                                                                                                                                                                                                                        | Dokument     | Codes                                                                                                                                  |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|----------------------------------------------------------------------------------------------------------------------------------------|
| Die Möglichkeit Quellenangaben von bestehenden Studienarbeiten oder Papern direkt aus einer PDF zu überprüfen. Als Basisfunktion die Prüfung der Existenz der zitier- ten Quelle und der Richtigkeit der Zitation (Autoren, (u.a. korrekte Rei- henfolge), Seiten, Journal, Jahr, etc.). Als erweiterte Funktion wäre eine Plausibilitätsprüfung oder sogar eine konkrete Prüfung, ob zitierte Stellen im Dokument inhaltlich der Quelle | 25, Pos. 1   | PDF-Importfunktion; Inhaltsbasierte Prüfung; Metadaten-Validierung                                                                     |
| Stand-Alone Lösung ohne direkte Anbindung an Browser/Word. Daten- schutzfreundlich. Einfache Bedienung, am besten mit PDF-Import Funkti- on. Wie docoloc nur inkl. KI-Lizenz und möglichst schneller und ergänzt um eine Abbildungs-Überprüfung.                                                                                                                                                                                         | 28, Pos. 4-7 | Medienprüfung (Bil- der/Tabellen); Benutzer- freundlichkeit; Schnel- ligkeit/Zeitersparnis; PDF-Importfunktion; Datenschutz; Sonstiges |
| Es sollte automatisch alle Quellen dahingehend überprüfen, ob sie echt sind.                                                                                                                                                                                                                                                                                                                                                             | 33, Pos. 2   | Quellenangaben prüfen (automatisch)                                                                                                    |
| Flagging fehlerhafter Referenzen, An- zeige wenn die Referenz u.U. falsch platziert ist. d.H. die im Text an- gegebene Information nicht oder al- ternativ in der Reference diskutiert wird. (z. B. Fehlinterpretation, falsch eingefügte Referenz)                                                                                                                                                                                      | 91, Pos. 1   | Inhaltsbasierte Prüfung; Warnung                                                                                                       |
| Schnelle, unkomplizierte Überprü- fung der Quellen eines vorliegenden Papers, Hausarbeit etc. auf Echt- heit. Nett wäre auch, die bibilogra- phischen Angaben dann vollständig exportieren zu können.                                                                                                                                                                                                                                    | 172, Pos. 2  | Schnelligkeit/Zeitersparnis; Tool-Integration                                                                                          |

| Codierte Segmente                                                                                                                                                                                                                                                                                        | Dokument      | Codes                                                        |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|--------------------------------------------------------------|
| Zuverlässigkeit (richtige Ergebnis- se), Vollständigkeit (möglichst alle Quellen sollten überprüfbar sein) und Transparenz (wo wurde der Artikel gefunden), ggf. noch eine Einschät- zung wie relvant die Quelle (oder das Journal) ist.                                                                 | 123, Pos. 2   | Transparenz/Nachvollziehbarkeit; Zuverlässigkeit; Warnung    |
| Die Möglichkeiten mit vielfältigen Eingaben arbeiten zu können. Al- so nur der Autor oder der Ort und gegebenenfalls Alternativen bei Jah- reszahlen wegen Tippfehlern                                                                                                                                   | 126, Pos. 2   | Zuverlässigkeit; Flexibili- tät/Adaptierbarkeit              |
| Ich würde es vor allem zur Über- prüfung von studentischen Arbeiten nutzen, beim wissenschaftlichen Pu- blizieren lese ich jede Quelle. Daher sollte das Tool PDFs einlesen können und Hinweise geben, welche Quellen möglicherweise KI generiert sind und welche Online-Datenbanken über- prüft wurden. | 201, Pos. 1   | Transparenz/Nachvollziehbarkeit; PDF-Importfunktion; Warnung |
| - dass Anonymität gewahrt bleibt (meine Daten sollen nirgends ge- speichert werden) - möglichst keine falschen Antworten - einfache Hand- habung                                                                                                                                                         | 450, Pos. 1-3 | Benutzerfreundlichkeit; Datenschutz; Zuverlässig- keit       |
| Am besten wäre einfach ein Symbol, welches nach Markierung der Quelle erscheint: Grüner Haken, wenn es die Quelle gibt + evtl Link zur Quelle, roter Haken wenn sie nicht existiert etc.                                                                                                                 | 477, Pos. 1   | Direktlink zur Quelle; Warnung                               |

Anmerkung. Exemplarische Auswahl von zehn kodierten Freitextangaben zu gewünschten Funktionen/Qualitäten eines Tools. Orthografie unverändert; Mehrfachkodierung möglich.

## A.1.7 Risiken durch den Einsatz von KI-Systemen

Die folgende Tabelle zeigt exemplarische Kodierungen zu wahrgenommenen Risiken beim Einsatz von KI-Systemen in der wissenschaftlichen Literaturrecherche.

Tabelle A.7 Exemplarische Kodierungsliste - Risiken durch den Einsatz von KI in der wissenschaftlichen Literaturrecherche

| Codierte Segmente                                                                                                                                                                                                                                                                                                                                                                                             | Dokument             | Codes                                                                                                                                         |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| Blindes Vertrauen auf Richtigkeit der Aussagen der KI; hier liegt das größte Problem. Darüber hinaus wird die Existenz der Quellen selbst evtl. häufig nicht geprüft und wenn doch, dann wird die Existenz des wiederge- gebenen Inhalts innerhalb der Quelle nicht geprüft. Generell erscheinen so durch Quellen belegte Aussagen zunächst wissenschaftlich gut recher- chiert, sind jedoch schlicht falsch. | 6, Pos. 2, Pos. 1    | Blindes Vertrau- en/Unkritische Nut- zung; Halluzination/Fake Quellen; Qualitäts- verlust/Wiss. Integri- tät; Kompetenzver- lust/Abhängigkeit |
| 1) Es können gefälschte Studien ent- stehen, deren Schlussfolgerungen zwar falsch sind, aber von anderen benutzt werden. Das kann gravie- rende Folgen z. B. in der Medizin haben. 2) Studienabschlüsse können erworben werden, ohne dass die be- treffende Person die erforderlichen                                                                                                                         | 33, Pos. 3-4, Pos. 9 | Halluzination/Fake Quellen; Kompetenz- verlust/Abhängigkeit; Betrug/Fälschung                                                                 |
| Kernkompetenzen hat. 'Ketten-KI-Halluzinationen', d. h. dass sich eine nicht existierende Quel-                                                                                                                                                                                                                                                                                                               | 69, Pos. 2, Pos. 23  | Halluzination/Fake Quel- len                                                                                                                  |
| fortsetzt Übersehen wichtiger Quellen die ein normaler Mensch locker gefunden hätte. KI legt sich viel zu schnell auf paar Quellen fest und beschreibt dann nur diese. Und meistens sind das dann Reviews und keeine Origi- nalartikel.                                                                                                                                                                       | 131, Pos. 3, Pos. 47 | Bias/Verzerrung                                                                                                                               |
| Zwei zentrale Risiken: 1. Bezug auf Quellen, die nicht existieren; 2. Fehl- interpretation von Quellen durch KI-generierte Zusammenfassungen oder Textabschnitte                                                                                                                                                                                                                                              | 225, Pos. 2, Pos. 83 | Halluzination/Fake Quellen; Qualitätsver- lust/Wiss. Integrität                                                                               |

| Codierte Segmente                                                                                                                                                                                                                                                                    | Dokument               | Codes                                                                                                      |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------|------------------------------------------------------------------------------------------------------------|
| Dass die KI keinen Zugriff auf das deep-Web / Datenbankinhalte hat, nur in begrenzten Teilen des Inter- nets nach Quellen sucht und dadurch relevante Titel nicht findet und/oder keine vollständige Literaturrecherche leisten kann (aber suggeriert wird, dass dies leistbar ist). | 252, Pos. 2, Pos. 92   | Systematische Limitie- rungen                                                                              |
| 1) Dass es zu noch mehr 'gedan- kenlosem Mainstream' kommt (zi- tieren was 'man halt so zitiert') . . . 2) mehr Zitationen aus Quellen mit geringer Qualitätskontrolle . . . 3) komplett erfundene Referenzen                                                                        | 254, Pos. 6-8, Pos. 94 | Blindes Vertrau- en/Unkritische Nut- zung; Halluzination/Fake Quellen; Qualitätsver- lust/Wiss. Integrität |
| Die hohe Fehlerrate macht eine ma- nuelle Überprüfung notwendig und spart am Ende kaum Zeit.                                                                                                                                                                                         | 325, Pos. 2, Pos. 113  | Pragmatische Herausfor- derungen                                                                           |
| KI gibt lieber eine falsche Antwort als gar keine. Training der nächsten KI-Modelle wird mit KI generierten Daten stattfinden                                                                                                                                                        | 366, Pos. 2, Pos. 133  | Halluzination/Fake Quel- len                                                                               |
| Quellenangaben werden übernommen ohne deren Ursprung und Qualität zu erfassen. . . . statt das Original- Paper zu lesen, fehlt oft der Kontext. Dies kann zu falschen Interpretatio- nen und Schlüssen führen.                                                                       | 460, Pos. 2, Pos. 165  | Halluzination/Fake Quellen; Qualitätsver- lust/Wiss. Integrität                                            |

Anmerkung. Exemplarische Auswahl von zehn kodierten Freitextangaben zu wahrgenommenen Risiken. Orthografie unverändert; Mehrfachkodierung möglich.

## A.2 Rekodierung der Freitextangaben

Zur Vereinheitlichung der offenen Freitextangaben wurden inhaltliche Rekodierungen vorgenommen. Die Zuordnung der Antworten zu übergeordneten Hauptkategorien ermöglichte eine quantitative Auswertung und Aggregation der Ergebnisse. Die folgenden Tabellen dokumentieren die jeweiligen Rekodierungen für Fachrichtungen, Rollen, Methoden, Probleme und Arbeitsschritte.

## Tabelle A.8

Zuordnung von Fachrichtungs-Codes → Hauptkategorien

| Code                         | Hauptkategorie                          |   n |
|------------------------------|-----------------------------------------|-----|
| Naturwiss.                   | Naturwissenschaften ‡                   |   6 |
| Ingenieur- und Technikwiss.  | Ingenieur- und Technikwissen- schaften  |   3 |
| Rechts- und Wirtschaftswiss. | Rechts- und Wirtschaftswis- senschaften |   1 |
| Geistes- und Sozialwiss.     | Geistes- und Sozialwissen- schaften     |   5 |
| Gesundheitswesen             | Gesundheitswesen †                      |  14 |
| Summe rekodiert              |                                         |  29 |

Anmerkung. Freitextliche Angaben wurden auf vordefinierte Hauptkategorien rekodiert; keine Mehrfachkodierung. n = Anzahl rekodierter Nennungen.

‡ Die Antwortoption 'Wirtschaftsinformatik' ( n = 2) wurde der Hauptkategorie 'Naturwissenschaften' zugeordnet.

† Neu gebildete Hauptkategorie (nicht als Antwortoption vorgegeben).

## Tabelle A.9

Zuordnung von Rollen-Codes → Hauptkategorien

| Code            | Hauptkategorie                          |   n |
|-----------------|-----------------------------------------|-----|
| Lehrkraft       | Lehrkräfte                              |   1 |
| Wiss. MA        | Wiss. Mitarbeiten- de / Doktorand:innen |   1 |
| Sonstiges       | Sonstiges                               |   2 |
| Summe rekodiert |                                         |   4 |

Anmerkung. Freitextliche Angaben zu Rollen wurden auf vordefinierte Hauptkategorien rekodiert; keine Mehrfachkodierung. n = Anzahl rekodierter Nennungen.

Tabelle A.10 Zuordnung von Methoden-Codes → Hauptkategorien

| Code                                     | Hauptkategorie                            |   n |
|------------------------------------------|-------------------------------------------|-----|
| Online-                                  | Online-Datenbanken                        |  14 |
| Datenbanken/Bibliotheken DOI-Überprüfung | DOI-Überprüfung                           |   1 |
| Keine systematische Prüfung              | Keine systematische Prüfung               |   1 |
| Akademische Tools / Suchma- schinen      | Recherche mit Fachtools/Metasuchmaschinen |   9 |
| Manuelle Überprüfung                     | Manuelle Plausibilitätsprüfung †          |  17 |
| Originalquelle lesen                     | Abgleich mit der Primärquelle †           |  11 |
| Stichprobe / Eigenes Wissen              | Erfahrungsbasierter Plausibilitätscheck † |  13 |
| Verlagswebsite / Ursprungsort            | Abgleich mit Verlags- /Datenbankeintrag † |   7 |
| Sonstiges                                | Sonstiges                                 |   3 |
| Summe rekodiert                          |                                           |  76 |

Anmerkung. Freitextliche Angaben zu genutzten Methoden der Quellenüberprüfung wurden auf Hauptkategorien rekodiert; Mehrfachkodierung möglich. n = Anzahl Codes pro Hauptkategorie. † Neu gebildete Hauptkategorie (nicht als Antwortoption vorgegeben).

## Tabelle A.11

Zuordnung von Problem-Codes → Hauptkategorien

| Code                         | Hauptkategorie                                     |   n |
|------------------------------|----------------------------------------------------|-----|
| Zeitintensive manuelle Suche | Zeitintensive manuelle Suche                       |   3 |
| Doppelzitationen             | Unklare Zitationsstandards                         |   1 |
| Falscher Inhalt              | Inhaltliche Abweichungen †                         |   5 |
| Datenlücken/-fehler          | Unvollständige oder fehlerhaf- te Quellenangaben † |  14 |
| Zugangsbeschränkungen        | Zugangsbeschränkungen †                            |   5 |
| Qualitäts-/Relevanzprobleme  | Qualität/Relevanz †                                |   2 |
| Keine Probleme / Erfahrung   | Keine Probleme / Erfahrung †                       |   9 |
| Sonstiges                    | Sonstiges                                          |   3 |
| Summe rekodiert              |                                                    |  42 |

Anmerkung. Freitextliche Angaben zu Problemen bei der Überprüfung von Quellenangaben wurden auf Hauptkategorien rekodiert; Mehrfachkodierung möglich. n = Anzahl rekodierter Nennungen. † Neu gebildete Hauptkategorie (nicht als Antwortoption vorgegeben).

Tabelle A.12 Zuordnung von Arbeitsschritt-Codes → Hauptkategorien

| Code                         | Hauptkategorie                 |   n |
|------------------------------|--------------------------------|-----|
| Beim Lesen                   | Beim Lesen von Papers          |   1 |
| Beim Schreiben               | Beim Schreiben von Arbeiten    |   1 |
| In der Lehre                 | In der Lehre                   |   4 |
| KI-gestützte Arbeitsschritte | KI-gestützte Arbeitsschritte † |   5 |
| Sonstiges                    | Sonstiges                      |   6 |
| Summe rekodiert              |                                |  17 |

Anmerkung. Freitextliche Angaben zu relevanten Arbeitsschritten wurden auf Hauptkategorien rekodiert; keine Mehrfachkodierung. n = Anzahl Codes pro Hauptkategorie.

† Neu gebildete Hauptkategorie (nicht als Antwortoption vorgegeben).

## B Evaluation

## B.1 Beispielhafte Referenzen je Datensatztyp

Für jede der acht Publikationsarten wurde jeweils ein Beispiel aus dem echten, modifizierten und synthetischen Datensatz ausgewählt. Die Beispiele zeigen typische Eingaben, wie sie in der Evaluation der Extraktions- und Verifikationspipeline verwendet wurden.

## B.1.1 Echter Datensatz

```
[Buch] Lakowicz, J. R. (Ed.). (2006). Principles of Fluorescence Spectroscopy. Springer US. https://doi.org/10.1007/978-0-387-46312-4 [Buchkapitel] Presenting information on landscape and visual effects. (2013). Guidelines for Landscape and Visual Impact Assessment, 149-168. https://doi.org/10.4324/9780203436295-16 [Dissertation] Pfalz, A. (n.d.). Generating Audio Using Recurrent Neural Networks. https://doi.org/10.31390/gradschool_dissertations.4601 [Zeitschriftenartikel] Prybylowski, K., & Wenthold, R. J. (2004). N-Methyl-D-aspartate Receptors: Subunit Assembly and Trafficking to the Synapse.
```

Journal of Biological Chemistry, 279(11), 9673-9676. https://doi.org/10.1074/jbc.r300029200 [Monografie] Lakowicz, J. R. (1999). Principles of Fluorescence Spectroscopy. Springer US. https://doi.org/10.1007/978-1-4757-3061-6 [Preprint] Wu, C., Chen, M., Zhang, Y., Dai, J., Zhou, Q., Guo, Q., Zhou, Y., &amp; Song, J. (2025). The Role of Help-Seeking Motivation in Diagnostic Delay Among Patients with Schizophrenia: A Mixed-Methods Study. https://doi.org/10.21203/rs.3.rs-7518536/v1 [Konferenzbeitrag] He, K., Gkioxari, G., Dollar, P., &amp; Girshick, R. (2017). Mask R-CNN. 2017 IEEE International Conference on Computer Vision (ICCV). https://doi.org/10.1109/iccv.2017.322 [Bericht] Johnson, D., Perkins, C., &amp; Arkko, J. (2004). Mobility Support in IPv6. RFC Editor. https://doi.org/10.17487/rfc3775 B.1.2 Modifizierter Datensatz [Buch] Lakowicz, J. R. (Ed.). (2006). Principles of Fluorescence Spectroscopy. Springer US. https://doi.org/10.1007/978-0-387-46312-4 [Buchkapitel] Presenting information on landscape and visual effevts. (2011). Guidelines for and Landscape Visual Impact Assessment, 149-168. https://doi.org/10.4324/9780203436295-16 [Dissertation] Pfalz, A. (n.d.). Gejerating Audio Using Recurrent Neural Networks.

## [Zeitschriftenartikel]

Prybylowski, K., &amp; Wenthold, R. J. (2004).

N Methyl D aspartate Receptors: Subunit Assembly and Trafficking to the Synapse. Journal of Biological Chemistry, 279(11), 9673-9676.

https://doi.org/10.1074/jbc.r300029200

## [Monografie]

Lakowicz, J. E. (1999).

Principles of Fluorescence Spectroscopy.

Springer US.

https://doi.org/10.1007/978-1-4757-3061-6

## [Preprint]

Wu, C., Chen, M., Zhang, Y., Dai, J., Zhou, Q., Guo, Q., Zhou, H., &amp; Song, J. (2025).

The Role of Help Seeking Motivation in Diagnostic Delay Among Patients with

Schizophrenia: A Mixed Methods Study.

https://doi.org/10.21203/rs.3.rs-7518536/v1

## [Konferenzbeitrag]

He, K., Gkioxari, G., Dollar, P., &amp; Girshick, R. (2016).

mask R-CNN.

2017 IEEE International Conference on Computer Vision (ICCV). https://doi.org/10.1109/iccv.2017.322

## [Bericht]

Johnson, D., Perkins, C., &amp; Arkko, J. (2004). Mobility Support in IPv6.

RFC Editoe.

https://doi.org/10.17487/rfc3775

## B.1.3 Synthetischer Datensatz

## [Buch]

Heinrich, F., Stein, Z., &amp; Schröder, O. L. (1998). Foundations of modern analytics. Fintree Publishing. https://doi.org/10.55555/dr.9fyv.1998.51

## [Buchkapitel]

Klein, L., &amp; D'Amico, R. (2011).

Probabilistic inference: Challenges and opportunities.

In E. H. González &amp; K. López-García Jr. (Eds.), WP-2024-209).

Methods in empirical computing (pp. 67-78). Springwell Press. https://doi.org/10.54321/38.3avb.2011.76 [Dissertation] Arnold, L. L. (2002). Approximate model selection: A multi-site comparison (Doctoral dissertation, Technische Universität Westtal). https://doi.org/10.99999/ds.br.2002.05.8192 [Zeitschriftenartikel] Löfgren, M. H., &amp; Meier, C. (2007). Multi-modal inference: An empirical study. Pattern Recognition Letters, 18(2), e68808. https://doi.org/10.1137/ja/2007/1scm [Monografie] Schäfer, M. L., &amp; Seidel, M. E. (1999). Learning-based optimization. Westlake University Press. https://doi.org/10.1007/n8.4pb8.1999.101 [Preprint] König, L., Klein, N., &amp; Jansen, A. A. (1994, February 17). Robust inference -a simulation-based analysis. Zenodo Preprints. https://example.org/preprint/1994/3519 https://doi.org/10.1101/pc/1994/151p0q [Konferenzbeitrag] Öztürk, A. H., Peters, M., Tavares, K. C., Roth, N., Heinrich, L. M., &amp; Novák, K. (2023). Scalable search: An empirical study. In International Conference on Emerging Analytics (ICEA) (pp. 101-121). Broadview Academic. https://doi.org/10.1137/pa/2023/26ogw [Bericht] O'Connor, P., Fernández, A. A., &amp; Järvinen, A. (2024). Scalable inference: Foundations and applications (White Paper No. Broadview Academic. https://doi.org/10.42424/rp.2024.126.6l1-xdco

Anmerkung. Die echten Referenzen stammen aus realen Quellen, die modifizierten enthalten gezielte Formatierungs- oder Inhaltsabweichungen, während die synthetischen algorithmisch generiert wurden, um nicht existierende, aber formal plausible Referenzen zu

## B.2 Beispielhafte Evaluationsdaten

Die nachfolgenden Tabellen zeigen exemplarisch die im Rahmen der Evaluation erhobenen Kennwerte für den APA-Zitierstil im echten Datensatz unter Verwendung der LLM-basierten Extraktionspipeline . Der Datensatz umfasst insgesamt 200 Referenzen mit je 25 Einträgen pro Publikationstyp. Sie illustrieren den Aufbau und die Art der automatisch generierten Auswertungsdaten, wie sie für alle Zitierstile und Datensatztypen ( echt , modifiziert , synthetisch ) vorliegen.

Die vollständigen, im Markdown-Format exportierten Evaluationsstatistiken befinden sich auf der beiliegenden CD.

## B.2.1 Matching mit DOI

Tabelle B.1 Ø-Score nach Publikationstyp

| Typ                  | Ø-Score   | Median   | Q1       | Q3       | Anzahl   |
|----------------------|-----------|----------|----------|----------|----------|
|                      | %         | %        | %        | %        | n        |
| Buch                 | 100 , 00  | 100 , 00 | 100 , 00 | 100 , 00 | 25       |
| Buchkapitel          | 95 , 48   | 100 , 00 | 100 , 00 | 100 , 00 | 25       |
| Dissertation         | 99 , 96   | 100 , 00 | 100 , 00 | 100 , 00 | 25       |
| Zeitschriftenartikel | 99 , 88   | 100 , 00 | 100 , 00 | 100 , 00 | 25       |
| Monografie           | 99 , 64   | 100 , 00 | 100 , 00 | 100 , 00 | 25       |
| Preprint             | 98 , 96   | 100 , 00 | 100 , 00 | 100 , 00 | 25       |
| Konferenzbeitrag     | 99 , 64   | 100 , 00 | 100 , 00 | 100 , 00 | 25       |
| Bericht              | 99 , 32   | 100 , 00 | 100 , 00 | 100 , 00 | 25       |
| Ø gesamt             | 99 , 11   | 100 , 00 | 100 , 00 | 100 , 00 | 200      |

Tabelle B.2 Score-Verteilung nach Publikationstyp

| Typ                  | Exact   | Strong   | Possible   | No   |
|----------------------|---------|----------|------------|------|
|                      | n       | n        | n          | n    |
| Buch                 | 25      | 0        | 0          | 0    |
| Buchkapitel          | 19      | 4        | 1          | 1    |
| Dissertation         | 24      | 1        | 0          | 0    |
| Zeitschriftenartikel | 23      | 2        | 0          | 0    |
| Monografie           | 24      | 1        | 0          | 0    |
| Preprint             | 24      | 0        | 1          | 0    |
| Konferenzbeitrag     | 23      | 2        | 0          | 0    |
| Bericht              | 24      | 0        | 1          | 0    |
| Ø gesamt             | 186     | 10       | 3          | 1    |

Anmerkung. Die Schwellenwerte für die Klassifikation waren: Exact Match = 100 %, Strong Match ≥ 85 %, Possible Match ≥ 70 %, No Match &lt; 70 %.

## B.2.2 Matching ohne DOI

Tabelle B.3 Ø-Score nach Publikationstyp

| Typ                  | Ø-Score   | Median   | Q1       | Q3       | Anzahl   |
|----------------------|-----------|----------|----------|----------|----------|
|                      | %         | %        | %        | %        | n        |
| Buch                 | 100 , 00  | 100 , 00 | 100 , 00 | 100 , 00 | 25       |
| Buchkapitel          | 92 , 72   | 100 , 00 | 92 , 00  | 100 , 00 | 25       |
| Dissertation         | 99 , 96   | 100 , 00 | 100 , 00 | 100 , 00 | 25       |
| Zeitschriftenartikel | 98 , 16   | 100 , 00 | 100 , 00 | 100 , 00 | 25       |
| Monografie           | 98 , 68   | 100 , 00 | 100 , 00 | 100 , 00 | 25       |
| Preprint             | 100 , 00  | 100 , 00 | 100 , 00 | 100 , 00 | 25       |
| Konferenzbeitrag     | 99 , 76   | 100 , 00 | 100 , 00 | 100 , 00 | 25       |
| Bericht              | 99 , 16   | 100 , 00 | 100 , 00 | 100 , 00 | 25       |
| Ø gesamt             | 98 , 56   | 100 , 00 | 100 , 00 | 100 , 00 | 200      |

Tabelle B.4 Score-Verteilung nach Publikationstyp

| Typ                  | Exact   | Strong   | Possible   | No   |
|----------------------|---------|----------|------------|------|
|                      | n       | n        | n          | n    |
| Buch                 | 25      | 0        | 0          | 0    |
| Buchkapitel          | 17      | 5        | 1          | 2    |
| Dissertation         | 24      | 1        | 0          | 0    |
| Zeitschriftenartikel | 22      | 2        | 1          | 0    |
| Monografie           | 23      | 1        | 1          | 0    |
| Preprint             | 25      | 0        | 0          | 0    |
| Konferenzbeitrag     | 24      | 1        | 0          | 0    |
| Bericht              | 24      | 0        | 1          | 0    |
| Ø gesamt             | 184     | 10       | 4          | 2    |

Anmerkung. Die Schwellenwerte für die Klassifikation waren: Exact Match = 100 %, Strong Match ≥ 85 %, Possible Match ≥ 70 %, No Match &lt; 70 %.

## B.2.3 Systemperformance

## Tabelle B.5

Performance der Pipeline

| System                 | Ø-Zeit   | StdAbw   | Durchsatz Ref/min   |
|------------------------|----------|----------|---------------------|
|                        | s        | s        |                     |
| Mit DOI                |          |          |                     |
| sourceTaster.extract   | 2 , 07   | 1 , 76   | 29 , 04             |
| pipeline.total         | 2 , 61   | 3 , 09   | 22 , 96             |
| search.crossref        | 0 , 20   | 0 , 21   | 307 , 67            |
| search.openalex        | 0 , 53   | 0 , 23   | 112 , 76            |
| search.semanticscholar | 1 , 33   | 1 , 15   | 45 , 21             |
| search.europepmc       | 0 , 35   | 0 , 11   | 173 , 29            |
| search.arxiv           | 12 , 81  | 7 , 50   | 4 , 68              |
| sourceTaster.match     | 0 , 00   | 0 , 00   | 19 584 , 57         |
| Ohne DOI               |          |          |                     |
| sourceTaster.extract   | 2 , 07   | 1 , 76   | 29 , 04             |
| pipeline.total         | 3 , 14   | 3 , 94   | 19 , 09             |
| search.crossref        | 0 , 37   | 0 , 87   | 160 , 36            |
| search.openalex        | 0 , 59   | 0 , 35   | 100 , 91            |
| search.semanticscholar | 1 , 95   | 1 , 45   | 30 , 79             |
| search.europepmc       | 0 , 32   | 0 , 12   | 187 , 37            |
| search.arxiv           | 10 , 46  | 7 , 53   | 5 , 74              |
| sourceTaster.match     | 0 , 00   | 0 , 00   | 16 153 , 85         |

Anmerkung. Ergebnisse basieren auf der LLM-basierten Extraktionspipeline.

## Eidesstattliche Erklärung

Hiermit erkläre ich, Jeff Nawroth, dass ich die vorliegende Arbeit selbstständig verfasst habe, dass ich sie zuvor an keiner anderen Hochschule und in keinem anderen Studiengang als Prüfungsleistung eingereicht habe und dass ich keine anderen als die angegebenen Quellen und Hilfsmittel benutzt habe. Alle Stellen der Arbeit, die wörtlich oder sinngemäß aus Veröffentlichungen oder aus anderweitigen fremden Äußerungen entnommen wurden, sind als solche kenntlich gemacht.

Ort, Datum

Unterschrift

## Eidesstattliche Erklärung

Hiermit erkläre ich, Eren Cicek, dass ich die vorliegende Arbeit selbstständig verfasst habe, dass ich sie zuvor an keiner anderen Hochschule und in keinem anderen Studiengang als Prüfungsleistung eingereicht habe und dass ich keine anderen als die angegebenen Quellen und Hilfsmittel benutzt habe. Alle Stellen der Arbeit, die wörtlich oder sinngemäß aus Veröffentlichungen oder aus anderweitigen fremden Äußerungen entnommen wurden, sind als solche kenntlich gemacht.

Ort, Datum

Unterschrift