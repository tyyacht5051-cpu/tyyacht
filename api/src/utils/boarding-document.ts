import PizZip from 'pizzip';
import fs from 'fs';
import path from 'path';

interface CellPosition {
  absStart: number;
  absEnd: number;
  content: string;
}

interface CompanionData {
  name: string;
  birthDate: string;
  gender: string;
  address: string;
  phone: string;
}

interface BoardingData {
  name: string;
  birth_date: string;
  gender: string;
  address: string;
  phone: string;
  experience_date: string;
  companions: CompanionData[];
  created_at: string;
}

/**
 * Find a cell's position and content in the XML by table/row/col indices
 */
function findCell(xml: string, tableIdx: number, rowIdx: number, colIdx: number): CellPosition | null {
  const tableRegex = /<w:tbl>[\s\S]*?<\/w:tbl>/g;
  const tables: Array<{ start: number; content: string }> = [];
  let m: RegExpExecArray | null;
  while ((m = tableRegex.exec(xml)) !== null) {
    tables.push({ start: m.index, content: m[0] });
  }
  if (tableIdx >= tables.length) return null;

  const table = tables[tableIdx];
  const rowRegex = /<w:tr[\s>][\s\S]*?<\/w:tr>/g;
  const rows: Array<{ start: number; content: string }> = [];
  while ((m = rowRegex.exec(table.content)) !== null) {
    rows.push({ start: m.index, content: m[0] });
  }
  if (rowIdx >= rows.length) return null;

  const row = rows[rowIdx];
  const cellRegex = /<w:tc[\s>][\s\S]*?<\/w:tc>/g;
  const cells: Array<{ start: number; content: string }> = [];
  while ((m = cellRegex.exec(row.content)) !== null) {
    cells.push({ start: m.index, content: m[0] });
  }
  if (colIdx >= cells.length) return null;

  const cell = cells[colIdx];
  const absStart = table.start + row.start + cell.start;
  return {
    absStart,
    absEnd: absStart + cell.content.length,
    content: cell.content,
  };
}

/**
 * Modify a cell's text content, preserving formatting
 */
function modifyCellContent(cellXml: string, newText: string): string {
  const hasRuns = /<w:r[\s>]/.test(cellXml);

  if (hasRuns) {
    const firstRunRPr = cellXml.match(/<w:r[^>]*>\s*<w:rPr>([\s\S]*?)<\/w:rPr>/);
    const rPrContent = firstRunRPr ? `<w:rPr>${firstRunRPr[1]}</w:rPr>` : '';
    const cellWithoutRuns = cellXml.replace(/<w:r[\s>][\s\S]*?<\/w:r>/g, '');
    const newRun = `<w:r>${rPrContent}<w:t xml:space="preserve">${newText}</w:t></w:r>`;
    return cellWithoutRuns.replace(/<\/w:p>/, newRun + '</w:p>');
  } else {
    const paraRPr = cellXml.match(/<w:pPr>[\s\S]*?<w:rPr>([\s\S]*?)<\/w:rPr>[\s\S]*?<\/w:pPr>/);
    const rPrContent = paraRPr ? `<w:rPr>${paraRPr[1]}</w:rPr>` : '';
    const newRun = `<w:r>${rPrContent}<w:t xml:space="preserve">${newText}</w:t></w:r>`;
    return cellXml.replace(/<\/w:p>/, newRun + '</w:p>');
  }
}

/**
 * Format birth date to YYYY.MM.DD
 */
function formatBirthDateDot(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}

/**
 * Calculate age from birth date
 */
function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Format gender to 남/여
 */
function formatGenderShort(gender: string): string {
  if (gender === 'M' || gender === 'male' || gender === '남') {
    return '남';
  }
  return '여';
}

/**
 * Format phone number to 010.XXXX.XXXX (dot separator)
 */
function formatPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 7)}.${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return phone;
}

/**
 * Format created_at date to YYYY.MM.DD for the 날짜(Date) field
 */
function formatDateDot(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}

/**
 * Fill the 날짜(Date) field in the document header paragraph
 * "날짜"와 "(Date) :" 가 별도 run에 있으므로 "(Date) :" run의 텍스트에 날짜 삽입
 */
function fillDateField(xml: string, dateStr: string): string {
  const dateText = formatDateDot(dateStr);
  return xml.replace(
    /(<w:t[^>]*>)\(Date\)[^<]*(<\/w:t>)/,
    `$1(Date) : ${dateText}$2`
  );
}

/**
 * Generate a filled boarding experience application document
 * Template: boarding experience.docx
 * Table0: Row0=header, Row1=column headers, Row2=representative, Row3~Row30=companions
 * Each Row: 순번, 성명, 생년월일, 나이, 성별, 주소, 연락처, 개인정보동의
 */
export function generateBoardingDocument(data: BoardingData): Buffer {
  const templatePath = path.join(__dirname, '..', 'templates', 'boarding experience.docx');
  const content = fs.readFileSync(templatePath);
  const zip = new PizZip(content);
  let xml = zip.file('word/document.xml')!.asText();

  const modifications: Array<{ start: number; end: number; newContent: string }> = [];

  // Row 2: 대표자 (index 0 in participant list)
  const repRow = 2;
  const repCells: Array<{ col: number; text: string }> = [
    { col: 0, text: '1' },
    { col: 1, text: data.name },
    { col: 2, text: formatBirthDateDot(data.birth_date) },
    { col: 3, text: String(calculateAge(data.birth_date)) },
    { col: 4, text: formatGenderShort(data.gender) },
    { col: 5, text: data.address || '' },
    { col: 6, text: formatPhone(data.phone) },
    { col: 7, text: 'O' },
  ];

  for (const cellDef of repCells) {
    const cell = findCell(xml, 0, repRow, cellDef.col);
    if (cell) {
      modifications.push({
        start: cell.absStart,
        end: cell.absEnd,
        newContent: modifyCellContent(cell.content, cellDef.text),
      });
    }
  }

  // Row 3~Row30: 동승자 (최대 28명)
  for (let i = 0; i < data.companions.length && i < 28; i++) {
    const companion = data.companions[i];
    const rowIdx = 3 + i;
    const companionCells: Array<{ col: number; text: string }> = [
      { col: 0, text: String(i + 2) },
      { col: 1, text: companion.name || '' },
      { col: 2, text: formatBirthDateDot(companion.birthDate) },
      { col: 3, text: String(calculateAge(companion.birthDate)) },
      { col: 4, text: formatGenderShort(companion.gender) },
      { col: 5, text: companion.address || '' },
      { col: 6, text: formatPhone(companion.phone) },
      { col: 7, text: 'O' },
    ];

    for (const cellDef of companionCells) {
      const cell = findCell(xml, 0, rowIdx, cellDef.col);
      if (cell) {
        modifications.push({
          start: cell.absStart,
          end: cell.absEnd,
          newContent: modifyCellContent(cell.content, cellDef.text),
        });
      }
    }
  }

  // Sort by position descending (apply from back to front to preserve positions)
  modifications.sort((a, b) => b.start - a.start);

  // Apply modifications
  for (const mod of modifications) {
    xml = xml.substring(0, mod.start) + mod.newContent + xml.substring(mod.end);
  }

  // 날짜(Date) 필드 채우기
  xml = fillDateField(xml, data.created_at);

  // Write back to zip
  zip.file('word/document.xml', xml);
  return zip.generate({ type: 'nodebuffer' }) as Buffer;
}
