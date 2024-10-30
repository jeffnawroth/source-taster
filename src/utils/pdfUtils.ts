import type { HttpResponse, Item, Work } from '@jamesgopsill/crossref-client/dist/cjs/definitions/interfaces'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export async function generatePDFReport(
  dois: string[],
  passed: number,
  warning: number,
  failed: number,
  works: HttpResponse<Item<Work>>[],
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  let page = pdfDoc.addPage()
  const { height } = page.getSize()
  let yOffset = height - 50 // Startposition oben auf der ersten Seite

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  page.setFont(font)

  // Titel
  page.setFontSize(22)
  page.drawText('The Source Taster', { x: 10, y: yOffset })
  yOffset -= 30

  page.setFontSize(18)
  page.drawText('Report', { x: 10, y: yOffset })
  yOffset -= 30

  // Übersichtsinformationen
  page.setFontSize(12)
  page.setFontColor(rgb(0, 0, 0)) // Schwarz
  page.drawText(`Found: ${dois.length}`, { x: 10, y: yOffset })

  page.setFontColor(rgb(0.29, 0.73, 0.31)) // Grün für Passed
  page.drawText(`Passed: ${passed}`, { x: 80, y: yOffset })

  page.setFontColor(rgb(0.98, 0.55, 0.0)) // Orange für Warning
  page.drawText(`Warning: ${warning}`, { x: 140, y: yOffset })

  page.setFontColor(rgb(0.69, 0.0, 0.12)) // Rot für Failed
  page.drawText(`Failed: ${failed}`, { x: 200, y: yOffset })

  page.setFontColor(rgb(0, 0, 0)) // Zurück zu Schwarz für den restlichen Text
  yOffset -= 30

  // Einträge durchgehen und Seitenumbruch einfügen, falls nötig
  for (const [index, work] of works.entries()) {
    if (yOffset < 50) { // Überprüfen, ob Platz auf der Seite reicht, sonst neue Seite
      page = pdfDoc.addPage()
      page.setFont(font)
      yOffset = height - 50 // Neue Startposition für neue Seite
    }

    if (work.ok && work.content) {
      page.setFontColor(rgb(0.29, 0.73, 0.31)) // Grün
      page.setFontSize(14)
      const title = `${index + 1}. ${work.content.message.title[0]}`
      page.drawText(title, { x: 10, y: yOffset })
      yOffset -= 20

      page.setFontSize(12)
      page.setFontColor(rgb(0, 0, 0)) // Schwarz
      page.drawText(`DOI: ${work.content.message.DOI}`, { x: 10, y: yOffset })
      yOffset -= 20

      const url = work.content.message.URL
      page.drawText(`URL: ${url}`, { x: 10, y: yOffset })
    }
    else if (work.ok) {
      page.setFontColor(rgb(0.98, 0.55, 0.0)) // Orange
      page.setFontSize(14)
      const title = `${index + 1}. ${dois[index]}`
      page.drawText(title, { x: 10, y: yOffset })
      yOffset -= 20

      page.setFontSize(12)
      page.setFontColor(rgb(0, 0, 0))
      page.drawText(`URL: ${(work as HttpResponse<Item<Work>>).url}`, { x: 10, y: yOffset })
      yOffset -= 20

      page.drawText('Info: The DOI was found but the metadata could not be retrieved from the Crossref-Database.', { x: 10, y: yOffset })
    }
    else {
      page.setFontColor(rgb(0.69, 0.0, 0.12)) // Rot
      page.setFontSize(14)
      const title = `${index + 1}. ${dois[index]}`
      page.drawText(title, { x: 10, y: yOffset })
      yOffset -= 20

      page.setFontSize(12)
      page.setFontColor(rgb(0, 0, 0))
      page.drawText('Info: The DOI was not found.', { x: 10, y: yOffset })
    }

    yOffset -= 30 // Abstand zwischen den Einträgen
  }

  // PDF in Bytes speichern und zurückgeben
  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}
