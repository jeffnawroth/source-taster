import type { HttpResponse, Item, Work } from '@jamesgopsill/crossref-client/dist/cjs/definitions/interfaces'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import i18n from '~/plugins/i18n'

export async function generatePDFReport(
  dois: string[],
  valid: number,
  incomplete: number,
  invalid: number,
  works: HttpResponse<Item<Work>>[],
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  let page = pdfDoc.addPage()
  const { height, width } = page.getSize()
  let yOffset = height - 50 // Startposition oben auf der ersten Seite

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  page.setFont(font)

  // Titel
  page.setFontSize(22)
  page.drawText('The Source Taster', { x: 10, y: yOffset })
  yOffset -= 30

  page.setFontSize(18)
  page.drawText(i18n.global.t('report'), { x: 10, y: yOffset })
  yOffset -= 30

  // Übersichtsinformationen
  page.setFontSize(12)
  page.setFontColor(rgb(0, 0, 0)) // Schwarz
  const foundText = `${i18n.global.t('found')}: ${dois.length}`
  page.drawText(foundText, { x: 10, y: yOffset })

  // Dynamische Position basierend auf der Breite des vorherigen Textes
  const foundWidth = font.widthOfTextAtSize(foundText, 12) + 20

  page.setFontColor(rgb(0.29, 0.73, 0.31)) // Grün für Valid
  const validText = `${i18n.global.t('valid')}: ${valid}`
  page.drawText(validText, { x: 10 + foundWidth, y: yOffset })

  const validWidth = foundWidth + font.widthOfTextAtSize(validText, 12) + 20

  page.setFontColor(rgb(0.98, 0.55, 0.0)) // Orange für Incomplete
  const incompleteText = `${i18n.global.t('incomplete')}: ${incomplete}`
  page.drawText(incompleteText, { x: 10 + validWidth, y: yOffset })

  const incompleteWidth = validWidth + font.widthOfTextAtSize(incompleteText, 12) + 20

  page.setFontColor(rgb(0.69, 0.0, 0.12)) // Rot für Invalid
  const invalidText = `${i18n.global.t('invalid')}: ${invalid}`
  page.drawText(invalidText, { x: 10 + incompleteWidth, y: yOffset })

  page.setFontColor(rgb(0, 0, 0)) // Zurück zu Schwarz für den restlichen Text
  yOffset -= 30

  const splitTextIntoLines = (text: string, maxWidth: number, fontSize: number): string[] => {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const lineWidth = font.widthOfTextAtSize(testLine, fontSize)
      if (lineWidth < maxWidth) {
        currentLine = testLine
      }
      else {
        lines.push(currentLine)
        currentLine = word
      }
    }
    if (currentLine)
      lines.push(currentLine)

    return lines
  }

  // Einträge durchgehen und Seitenumbruch einfügen, falls nötig
  for (const [index, work] of works.entries()) {
    if (yOffset < 50) { // Überprüfen, ob Platz auf der Seite reicht, sonst neue Seite
      page = pdfDoc.addPage()
      page.setFont(font)
      yOffset = height - 50 // Neue Startposition für neue Seite
    }

    const maxLineWidth = width - 20 // Maximal erlaubte Breite für Text
    if (work.ok && work.content) {
      page.setFontColor(rgb(0, 0, 0)) // Schwarz
      page.setFontSize(14)
      const titleLines = splitTextIntoLines(`${index + 1}. ${work.content.message.title[0]}`, maxLineWidth, 14)
      titleLines.forEach((line) => {
        page.drawText(line, { x: 10, y: yOffset })
        yOffset -= 20
      })

      page.setFontSize(12)
      page.setFontColor(rgb(0.29, 0.73, 0.31)) // Grün
      page.drawText(`DOI: ${work.content.message.DOI}`, { x: 10, y: yOffset })
      yOffset -= 20

      page.setFontColor(rgb(0, 0, 0)) // Schwarz
      const url = work.content.message.URL
      page.drawText(`URL: ${url}`, { x: 10, y: yOffset })
    }
    else if (work.ok) {
      page.setFontColor(rgb(0.98, 0.55, 0.0)) // Orange
      page.setFontSize(14)
      const titleLines = splitTextIntoLines(`${index + 1}. ${dois[index]}`, maxLineWidth, 14)
      titleLines.forEach((line) => {
        page.drawText(line, { x: 10, y: yOffset })
        yOffset -= 20
      })

      page.setFontSize(12)
      page.setFontColor(rgb(0, 0, 0))
      page.drawText(`URL: ${(work as HttpResponse<Item<Work>>).url}`, { x: 10, y: yOffset })
      yOffset -= 20

      page.setFontColor(rgb(0, 0, 0)) // Schwarz
      page.drawText(`Info: ${i18n.global.t('doi-found-no-metadata')}.`, { x: 10, y: yOffset })
    }
    else {
      page.setFontColor(rgb(0.69, 0.0, 0.12)) // Rot
      page.setFontSize(14)
      const titleLines = splitTextIntoLines(`${index + 1}. ${dois[index]}`, maxLineWidth, 14)
      titleLines.forEach((line) => {
        page.drawText(line, { x: 10, y: yOffset })
        yOffset -= 20
      })

      page.setFontSize(12)
      page.setFontColor(rgb(0, 0, 0)) // Schwarz
      page.drawText(`Info: ${i18n.global.t('doi-not-found')} `, { x: 10, y: yOffset })
    }

    yOffset -= 30 // Abstand zwischen den Einträgen
  }

  // PDF in Bytes speichern und zurückgeben
  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}
