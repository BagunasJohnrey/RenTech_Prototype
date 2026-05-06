/**
 * Uses split logic to convert Gemini's plain text into an array of sections
 * for easier rendering. Assumes sections start with lines like "### 1. Title"
 * or numbered lists.
 */
export function parseReportSections(rawText) {
  const lines = rawText.split('\n');
  const sections = [];
  let currentSection = { title: '', bodyLines: [] };

  const isSectionHeading = (line) =>
    /^#{1,3}\s+/.test(line) || /^\d+\.\s+\*\*/.test(line) || /^[-*]\s+\*\*/.test(line);

  for (const line of lines) {
    if (isSectionHeading(line) && currentSection.bodyLines.length > 0) {
      sections.push({ ...currentSection });
      currentSection = { title: '', bodyLines: [] };
    }
    if (isSectionHeading(line)) {
      currentSection.title = line.replace(/^#{1,3}\s+/, '').replace(/\*\*/g, '');
    } else {
      currentSection.bodyLines.push(line);
    }
  }
  if (currentSection.title || currentSection.bodyLines.length > 0) {
    sections.push(currentSection);
  }
  return sections;
}