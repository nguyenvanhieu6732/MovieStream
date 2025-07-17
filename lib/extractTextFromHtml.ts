function extractTextFromHtml(html: string): string {
  if (typeof window !== "undefined") {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    return doc.body.textContent?.trim() || ""
  } else {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  }
}
export default extractTextFromHtml