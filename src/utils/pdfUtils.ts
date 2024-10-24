import type { HttpResponse, Item, Work } from '@jamesgopsill/crossref-client/dist/cjs/definitions/interfaces'
import jsPDF from 'jspdf'

export function generatePDFReport(dois: string[], passed: number, warning: number, failed: number, works: HttpResponse<Item<Work>>[]): void {
  // eslint-disable-next-line new-cap
  const doc = new jsPDF()

  // Title
  doc.setFontSize(22)
  doc.text('The Source Taster', 5, 10)

  doc.setFontSize(18)
  doc.text('Report', 10, 20)

  // Found, Passed, Warning, Failed in one line
  doc.setFontSize(12)
  doc.text(`Found: ${dois.length}`, 10, 30)

  // Set color for Passed (Green)
  doc.setTextColor('#4CAF50')
  doc.text(`Passed: ${passed}`, 50, 30)

  doc.setTextColor('#FB8C00')
  doc.text(`Warning: ${warning}`, 90, 30)

  // Set color for Failed (Red)
  doc.setTextColor('#B00020')
  doc.text(`Failed: ${failed}`, 130, 30)

  // Reset text color to black for the rest of the document
  doc.setTextColor(0, 0, 0)

  // Loop over the works and add each one to the PDF
  let yOffset = 40 // Start position for the list of works
  works.forEach((work, index) => {
    // Display work title or status message
    if (work.ok && work.content) {
      // Green for found work title
      doc.setTextColor('#4CAF50')
      doc.setFontSize(14)
      const title = doc.splitTextToSize(`${index + 1}. ${work.content.message.title[0]}`, 180) // 180 is the max width
      doc.text(title, 10, yOffset)
      yOffset += 10 * title.length / 1.5

      // DOI and clickable URL
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text(`DOI: ${work.content.message.DOI}`, 10, yOffset)
      yOffset += 10

      const url = `${work.content.message.URL}`
      doc.textWithLink(`URL: ${url}`, 10, yOffset, { url })
    }
    else if (work.ok) {
      // Orange for warning status
      doc.setTextColor('#FB8C00')
      doc.setFontSize(14)
      const title = doc.splitTextToSize(`${index + 1}. ${dois[index]}`, 180) // 180 is the max width
      doc.text(title, 10, yOffset)
      yOffset += 10 * title.length / 1.5

      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      const url = `${(work as HttpResponse<Item<Work>>).url}`
      doc.textWithLink(`URL: ${url}`, 10, yOffset, { url })

      yOffset += 10

      // Additional suggestion text
      doc.text('Info: The DOI was found but the metadata could not be retrieved from the Crossref-Database.', 10, yOffset)
    }
    else {
      // Red for not found work title
      doc.setTextColor('#B00020')
      doc.setFontSize(14)
      const title = doc.splitTextToSize(`${index + 1}. ${dois[index]}`, 180) // 180 is the max width
      doc.text(title, 10, yOffset)
      yOffset += 10 * title.length / 1.5

      // Reason why work was not found
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text('Info: The DOI was not found.', 10, yOffset)
    }

    // Add some space between the entries
    yOffset += 20

    // Check if the yOffset goes beyond the page height, add new page if necessary
    if (yOffset > 280) { // A4 page height limit
      doc.addPage()
      yOffset = 20 // Reset yOffset for new page
    }
  })

  // Save the PDF with a custom name
  doc.save('report.pdf')
}
