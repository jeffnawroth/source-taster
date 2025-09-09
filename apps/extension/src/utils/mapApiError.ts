import type { ApiHttpError } from '@source-taster/types'

export function mapApiError(err: ApiHttpError): string {
  switch (err.error) {
    case 'bad_request':
      return 'Die Anfrage war ungültig. Bitte Eingaben prüfen.'
    case 'validation_error':
      return `Ungültige Eingabe: ${err.message}`
    case 'unauthorized':
      return 'Dein API-Key ist ungültig oder fehlt. Bitte prüfe die Einstellungen.'
    case 'forbidden':
      return 'Du hast keine Berechtigung, diese Aktion auszuführen.'
    case 'not_found':
      return 'Die angeforderte Ressource wurde nicht gefunden.'
    case 'conflict':
      return 'Es besteht ein Konflikt mit bestehenden Daten.'
    case 'unprocessable':
      return 'Die Anfrage konnte nicht verarbeitet werden.'
    case 'rate_limited':
      return 'Zu viele Anfragen. Bitte kurz warten und erneut versuchen.'
    case 'server_error':
    case 'internal_error':
      return 'Interner Serverfehler. Bitte später erneut versuchen.'
    case 'upstream_error':
      return 'Der externe Dienst ist momentan nicht erreichbar. Bitte später noch einmal probieren.'
    case 'handler_error':
      return 'Fehler im Fehler-Handler.'
    case 'app_error':
    default:
      return err.message || 'Es ist ein unbekannter Fehler aufgetreten.'
  }
}
