import type { HttpResponse, Item, Work } from '@jamesgopsill/crossref-client/dist/cjs/definitions/interfaces'
import i18n from '@/extension/plugins/i18n'
import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, rgb } from 'pdf-lib'
import { extractText, getDocumentProxy } from 'unpdf'
import NotoSans from '../../extension/assets/NotoSans-Regular.ttf'

export async function generatePDFReport(
  dois: string[],
  valid: number,
  invalid: number,
  works: HttpResponse<Item<Work>>[],
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)
  const fontBytes = await fetch(NotoSans).then(res => res.arrayBuffer())
  let page = pdfDoc.addPage()
  const { height, width } = page.getSize()
  let yOffset = height - 50 // Startposition oben auf der ersten Seite

  const font = await pdfDoc.embedFont(fontBytes)
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

  page.setFontColor(rgb(0.69, 0.0, 0.12)) // Rot für Invalid
  const invalidText = `${i18n.global.t('invalid')}: ${invalid}`
  page.drawText(invalidText, { x: 10 + validWidth, y: yOffset })

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
      page.setFontSize(14)

      page.setFontColor(rgb(0, 0, 0)) // Schwarz
      const indexText = `${index + 1}.`
      const indexWidth = font.widthOfTextAtSize(indexText, 14)
      page.drawText(indexText, { x: 10, y: yOffset })

      page.setFontColor(rgb(0.29, 0.73, 0.31)) // Grün
      const doiText = `${dois[index]}`
      const titleLines = splitTextIntoLines(doiText, maxLineWidth - indexWidth, 14) // Adjust width based on index text length
      titleLines.forEach((line) => {
        page.drawText(line, { x: 10 + indexWidth + 5, y: yOffset }) // 5 is a small padding to separate index and DOI
        yOffset -= 20
      })

      // Set URL text
      page.setFontColor(rgb(0.4, 0.6, 1)) // Blue
      page.setFontSize(12)
      const url = work.content.message.URL
      const urlText = `${url}`
      const urlX = 10 // x-position for the URL
      const urlY = yOffset

      // Draw URL text
      page.drawText(urlText, { x: urlX, y: urlY })

      // Calculate the width of the text for the underline
      const urlTextWidth = font.widthOfTextAtSize(urlText, 12)

      // Draw the underline
      page.drawLine({
        start: { x: urlX, y: urlY - 2 }, // Slightly below the text
        end: { x: urlX + urlTextWidth, y: urlY - 2 }, // End of the line based on text width
        thickness: 0.5, // Thickness of the line
        color: rgb(0.4, 0.6, 1), // Blue
      })

      yOffset -= 20
    }
    else if (work.ok) {
      page.setFontSize(14)
      // Set the index to be in black
      page.setFontColor(rgb(0, 0, 0)) // Schwarz
      const indexText = `${index + 1}.`
      const indexWidth = font.widthOfTextAtSize(indexText, 14)
      page.drawText(indexText, { x: 10, y: yOffset })

      page.setFontColor(rgb(0.29, 0.73, 0.31)) // Grün
      const doiText = `${dois[index]}`
      const titleLines = splitTextIntoLines(doiText, maxLineWidth - indexWidth, 14) // Adjust width based on index text length
      titleLines.forEach((line) => {
        page.drawText(line, { x: 10 + indexWidth + 5, y: yOffset }) // 5 is a small padding to separate index and DOI
        yOffset -= 20
      })

      // Set URL text
      page.setFontColor(rgb(0.4, 0.6, 1)) // Blue
      page.setFontSize(12)
      const urlText = `${(work as HttpResponse<Item<Work>>).url}`
      const urlX = 10 // X-position for the URL
      const urlY = yOffset // Y-position for the URL
      page.drawText(urlText, { x: urlX, y: urlY })

      // Calculate the width of the text for the underline
      const urlTextWidth = font.widthOfTextAtSize(urlText, 12)

      // Draw the underline
      page.drawLine({
        start: { x: urlX, y: urlY - 2 }, // Slightly below the text
        end: { x: urlX + urlTextWidth, y: urlY - 2 }, // End of the line based on text width
        thickness: 0.5, // Thickness of the line
        color: rgb(0.4, 0.6, 1), // Blue
      })
      yOffset -= 20
    }
    else {
      page.setFontSize(14)

      // Set the index to be in black
      page.setFontColor(rgb(0, 0, 0)) // Schwarz
      const indexText = `${index + 1}.`
      const indexWidth = font.widthOfTextAtSize(indexText, 14)
      page.drawText(indexText, { x: 10, y: yOffset })

      // Set the DOI to be in red and align next to the index
      page.setFontColor(rgb(0.69, 0.0, 0.12)) // Rot
      const doiText = `${dois[index]}`
      const titleLines = splitTextIntoLines(doiText, maxLineWidth - indexWidth, 14) // Adjust width based on index text length
      titleLines.forEach((line) => {
        page.drawText(line, { x: 10 + indexWidth + 5, y: yOffset }) // 5 is a small padding to separate index and DOI
        yOffset -= 20
      })

      // Note
      page.setFontColor(rgb(0, 0, 0)) // Schwarz
      page.setFontSize(12)
      const urlText = `${i18n.global.t('note')}: ${i18n.global.t('invalid-description')}`
      const urlX = 10 // x-position for the URL
      page.drawText(urlText, { x: urlX, y: yOffset })
      yOffset -= 20
    }

    yOffset -= 15 // Abstand zwischen den Einträgen
  }

  // PDF in Bytes speichern und zurückgeben
  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}

// Extract text from a PDF URL
export async function extractPdfTextFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    return await extractPDFText(buffer)
  }
  catch (error) {
    console.error('Error loading or extracting PDF:', error)
    return ''
  }
}

// Extract text from a PDF buffer
async function extractPDFText(buffer: ArrayBuffer): Promise<string> {
  try {
    const pdf = await getDocumentProxy(new Uint8Array(buffer))
    const { text } = await extractText(pdf, { mergePages: true })
    return text
  }
  catch (error) {
    console.error('Error extracting text from PDF:', error)
    return ''
  }
}

// Extract text from a PDF file
export async function extractTextFromPdfFile(file: File): Promise<string> {
  if (!file || file.type !== 'application/pdf')
    return ''
  try {
    const buffer = await file.arrayBuffer()
    return await extractPDFText(buffer)
  }
  catch (error) {
    console.error('Error extracting text:', error)
    return ''
  }
}
