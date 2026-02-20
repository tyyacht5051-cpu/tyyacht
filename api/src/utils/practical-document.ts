import PizZip from 'pizzip';
import fs from 'fs';
import path from 'path';

interface CellPosition {
  absStart: number;
  absEnd: number;
  content: string;
}

interface PracticalData {
  name: string;
  gender: string;
  birth_date: string;
  address: string;
  preferred_date: string | null;
  email: string;
  phone: string;
  license: string | null;
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

function formatBirthDate6(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

function formatDateKorean(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}년  ${d.getMonth() + 1}월  ${d.getDate()}일`;
}

function formatPreferredDates(datesStr: string | null): string {
  if (!datesStr) return '';
  let dates: string[] = [];
  try {
    const parsed = JSON.parse(datesStr);
    dates = Array.isArray(parsed) ? parsed : [datesStr];
  } catch {
    dates = [datesStr];
  }
  if (dates.length === 0) return '';
  const months = new Set<string>();
  for (const d of dates) {
    const date = new Date(d);
    if (!isNaN(date.getTime())) {
      months.add(`${date.getFullYear()}년 ${date.getMonth() + 1}월`);
    }
  }
  return Array.from(months).join(', ');
}

function formatLicense(license: string | null): string {
  if (!license || license.trim() === '') {
    return '일반조종 1급 □  2급 □  해당사항 없음 ☑';
  }
  const l = license;
  const has1 = l.includes('1급') || l === 'general1';
  const has2 = l.includes('2급') || l === 'general2';

  if (has1 && has2) {
    return '일반조종 1급 ☑  2급 ☑  해당사항 없음 □';
  } else if (has1) {
    return '일반조종 1급 ☑  2급 □  해당사항 없음 □';
  } else if (has2) {
    return '일반조종 1급 □  2급 ☑  해당사항 없음 □';
  } else {
    return `일반조종 1급 □  2급 □  해당사항 없음 □  (${license})`;
  }
}

function formatGender(gender: string): string {
  if (gender === 'M' || gender === 'male' || gender === '남') {
    return '☑남  □여';
  } else {
    return '□남  ☑여';
  }
}

function replaceParagraphByKeyword(xml: string, keyword: string, newText: string, searchAfter: number = 0): string {
  const searchXml = xml.substring(searchAfter);
  const pRegex = /<w:p[\s>][\s\S]*?<\/w:p>/g;
  let pm: RegExpExecArray | null;
  while ((pm = pRegex.exec(searchXml)) !== null) {
    const pContent = pm[0];
    if (!pContent.includes(keyword)) continue;

    const absStart = searchAfter + pm.index;
    const absEnd = absStart + pContent.length;

    const pPrMatch = pContent.match(/<w:pPr>[\s\S]*?<\/w:pPr>/);
    const pPr = pPrMatch ? pPrMatch[0] : '';
    const rPrMatch = pContent.match(/<w:r[^>]*>\s*<w:rPr>([\s\S]*?)<\/w:rPr>/);
    const rPr = rPrMatch ? `<w:rPr>${rPrMatch[1]}</w:rPr>` : '';
    const paraId = pContent.match(/w14:paraId="([^"]+)"/);
    const textId = pContent.match(/w14:textId="([^"]+)"/);
    const rsidR = pContent.match(/w:rsidR="([^"]+)"/);
    const pAttrs = [
      paraId ? `w14:paraId="${paraId[1]}"` : '',
      textId ? `w14:textId="${textId[1]}"` : '',
      rsidR ? `w:rsidR="${rsidR[1]}"` : '',
    ].filter(Boolean).join(' ');

    const newPara = `<w:p ${pAttrs}>${pPr}<w:r>${rPr}<w:t xml:space="preserve">${newText}</w:t></w:r></w:p>`;
    return xml.substring(0, absStart) + newPara + xml.substring(absEnd);
  }
  return xml;
}

function findTableBoundaries(xml: string): Array<{ start: number; end: number }> {
  const tableRegex = /<w:tbl>[\s\S]*?<\/w:tbl>/g;
  const boundaries: Array<{ start: number; end: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = tableRegex.exec(xml)) !== null) {
    boundaries.push({ start: m.index, end: m.index + m[0].length });
  }
  return boundaries;
}

function fillConsentSection(xml: string, name: string, dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const dateText = `${year}년  ${month}월  ${day}일`;

  const tables = findTableBoundaries(xml);
  if (tables.length < 4) return xml;

  const consentTexts = [
    '☞ 위와 같이 개인정보를 수집·이용하는데 동의하십니까?          ☑예  □아니오',
    '☞ 위와 같이 고유식별정보를 처리하는데 동의하십니까?          ☑예  □아니오',
    '☞ 위와 같이 개인정보를 제3자에게 제공하는데 동의하십니까?          ☑예  □아니오',
  ];

  const consentRegions = [
    { start: tables[1].end, end: tables[2].start },
    { start: tables[2].end, end: tables[3].start },
    { start: tables[3].end, end: xml.indexOf('</w:body>') },
  ];

  for (let i = consentRegions.length - 1; i >= 0; i--) {
    const region = consentRegions[i];
    const section = xml.substring(region.start, region.end);

    const pRegex = /<w:p[\s>][\s\S]*?<\/w:p>/g;
    let pm: RegExpExecArray | null;
    while ((pm = pRegex.exec(section)) !== null) {
      const textRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
      let fullText = '';
      let tm: RegExpExecArray | null;
      while ((tm = textRegex.exec(pm[0])) !== null) {
        fullText += tm[1];
      }

      if (fullText.includes('동의하십니까')) {
        const absStart = region.start + pm.index;
        const absEnd = absStart + pm[0].length;

        const pPrMatch = pm[0].match(/<w:pPr>[\s\S]*?<\/w:pPr>/);
        const pPr = pPrMatch ? pPrMatch[0] : '';
        const rPrMatch = pm[0].match(/<w:r[^>]*>\s*<w:rPr>([\s\S]*?)<\/w:rPr>/);
        const rPr = rPrMatch ? `<w:rPr>${rPrMatch[1]}</w:rPr>` : '';
        const paraId = pm[0].match(/w14:paraId="([^"]+)"/);
        const textId = pm[0].match(/w14:textId="([^"]+)"/);
        const rsidR = pm[0].match(/w:rsidR="([^"]+)"/);
        const pAttrs = [
          paraId ? `w14:paraId="${paraId[1]}"` : '',
          textId ? `w14:textId="${textId[1]}"` : '',
          rsidR ? `w:rsidR="${rsidR[1]}"` : '',
        ].filter(Boolean).join(' ');

        const newPara = `<w:p ${pAttrs}>${pPr}<w:r>${rPr}<w:t xml:space="preserve">${consentTexts[i]}</w:t></w:r></w:p>`;
        xml = xml.substring(0, absStart) + newPara + xml.substring(absEnd);
        break;
      }
    }
  }

  const signatureText = `${dateText}  신청인 : ${name} (서명)`;
  xml = replaceParagraphByKeyword(xml, '신청인', signatureText, tables[3].end);

  return xml;
}

/**
 * Generate a filled practical training application document
 */
export function generatePracticalDocument(data: PracticalData): Buffer {
  const templatePath = path.join(__dirname, '..', 'templates', 'practical training.docx');
  const content = fs.readFileSync(templatePath);
  const zip = new PizZip(content);
  let xml = zip.file('word/document.xml')!.asText();

  const cellMods: Array<{ table: number; row: number; col: number; text: string }> = [
    { table: 0, row: 2, col: 2, text: data.name },
    { table: 0, row: 2, col: 4, text: formatGender(data.gender) },
    { table: 0, row: 3, col: 2, text: formatBirthDate6(data.birth_date) },
    { table: 0, row: 4, col: 2, text: data.address },
    { table: 0, row: 5, col: 2, text: '☑ 요트실기' },
    { table: 0, row: 5, col: 4, text: formatPreferredDates(data.preferred_date) },
    { table: 0, row: 6, col: 4, text: data.email || '' },
    { table: 0, row: 7, col: 4, text: data.phone },
    { table: 0, row: 8, col: 1, text: formatLicense(data.license) },
    { table: 0, row: 10, col: 0, text: formatDateKorean(data.created_at) },
    { table: 0, row: 11, col: 0, text: `성 명 : ${data.name} (인)` },
  ];

  const modifications: Array<{ start: number; end: number; newContent: string }> = [];

  for (const mod of cellMods) {
    const cell = findCell(xml, mod.table, mod.row, mod.col);
    if (cell) {
      modifications.push({
        start: cell.absStart,
        end: cell.absEnd,
        newContent: modifyCellContent(cell.content, mod.text),
      });
    }
  }

  modifications.sort((a, b) => b.start - a.start);

  for (const mod of modifications) {
    xml = xml.substring(0, mod.start) + mod.newContent + xml.substring(mod.end);
  }

  xml = fillConsentSection(xml, data.name, data.created_at);

  zip.file('word/document.xml', xml);
  return zip.generate({ type: 'nodebuffer' }) as Buffer;
}
