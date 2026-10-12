const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType
} = require('docx');

function parseInlineFormatting(text) {
  const runs = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|[^*`]+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const chunk = match[0];
    if (chunk.startsWith('**') && chunk.endsWith('**')) {
      runs.push(
        new TextRun({
          text: chunk.slice(2, -2),
          bold: true,
          font: 'PingFang SC, Microsoft YaHei, Calibri',
        })
      );
    } else if (chunk.startsWith('`') && chunk.endsWith('`')) {
      runs.push(
        new TextRun({
          text: chunk.slice(1, -1),
          font: 'Consolas, Courier New',
          color: '1877F2',
          bold: true,
        })
      );
    } else {
      runs.push(
        new TextRun({
          text: chunk,
          font: 'PingFang SC, Microsoft YaHei, Calibri',
        })
      );
    }
  }
  return runs.length > 0 ? runs : [new TextRun({ text, font: 'PingFang SC, Microsoft YaHei, Calibri' })];
}

function convertMdToDocx(mdPath, outPath, title) {
  if (!fs.existsSync(mdPath)) {
    console.error('File not found:', mdPath);
    return;
  }
  const mdContent = fs.readFileSync(mdPath, 'utf-8');
  const lines = mdContent.split('\n');
  const children = [];

  let inTable = false;
  let tableRows = [];

  function flushTable() {
    if (tableRows.length === 0) {
      inTable = false;
      return;
    }

    const docxRows = tableRows.map((row, rIndex) => {
      const isHeader = rIndex === 0;
      const cells = row.map((cellText) => {
        return new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: parseInlineFormatting(cellText.trim()),
            }),
          ],
          shading: isHeader
            ? {
                fill: 'F0F2F5',
                type: ShadingType.CLEAR,
                color: 'auto',
              }
            : undefined,
          margins: {
            top: 120,
            bottom: 120,
            left: 150,
            right: 150,
          },
        });
      });

      return new TableRow({
        children: cells,
        tableHeader: isHeader,
      });
    });

    children.push(
      new Table({
        rows: docxRows,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
      })
    );

    children.push(new Paragraph({ text: '' }));
    tableRows = [];
    inTable = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table row check
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const cells = line
        .trim()
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());

      // Skip markdown table separator like |:---|:---|
      if (cells.every((c) => /^:?-+:?$/.test(c))) {
        continue;
      }

      inTable = true;
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Heading 1
    if (line.startsWith('# ')) {
      children.push(
        new Paragraph({
          text: line.replace(/^#\s+/, ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 150 },
        })
      );
      continue;
    }

    // Heading 2
    if (line.startsWith('## ')) {
      children.push(
        new Paragraph({
          text: line.replace(/^##\s+/, ''),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      );
      continue;
    }

    // Heading 3
    if (line.startsWith('### ')) {
      children.push(
        new Paragraph({
          text: line.replace(/^###\s+/, ''),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 180, after: 80 },
        })
      );
      continue;
    }

    // Heading 4
    if (line.startsWith('#### ')) {
      children.push(
        new Paragraph({
          text: line.replace(/^####\s+/, ''),
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 140, after: 60 },
        })
      );
      continue;
    }

    // Bullet point
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const text = line.trim().replace(/^[-*]\s+/, '');
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: parseInlineFormatting(text),
          spacing: { before: 40, after: 40 },
        })
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s+/.test(line.trim())) {
      const text = line.trim();
      children.push(
        new Paragraph({
          children: parseInlineFormatting(text),
          spacing: { before: 40, after: 40 },
        })
      );
      continue;
    }

    // Divider
    if (line.trim() === '---') {
      children.push(
        new Paragraph({
          border: {
            bottom: {
              color: 'E4E6EB',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
          spacing: { before: 120, after: 120 },
        })
      );
      continue;
    }

    // Code block start / end or pre
    if (line.trim().startsWith('```')) {
      continue;
    }

    // Empty line
    if (!line.trim()) {
      continue;
    }

    // Normal text paragraph
    children.push(
      new Paragraph({
        children: parseInlineFormatting(line),
        spacing: { before: 60, after: 60 },
      })
    );
  }

  if (inTable) {
    flushTable();
  }

  const doc = new Document({
    title: title,
    description: `${title} 官方 Word 文档`,
    styles: {
      default: {
        document: {
          run: {
            font: 'PingFang SC, Microsoft YaHei, Calibri, sans-serif',
            size: 22, // 11pt
            color: '050505',
          },
          paragraph: {
            spacing: { line: 360 },
          },
        },
        heading1: {
          run: {
            font: 'PingFang SC, Microsoft YaHei, Calibri, sans-serif',
            size: 34,
            bold: true,
            color: '1877F2',
          },
        },
        heading2: {
          run: {
            font: 'PingFang SC, Microsoft YaHei, Calibri, sans-serif',
            size: 28,
            bold: true,
            color: '050505',
          },
        },
        heading3: {
          run: {
            font: 'PingFang SC, Microsoft YaHei, Calibri, sans-serif',
            size: 24,
            bold: true,
            color: '1877F2',
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: children,
      },
    ],
  });

  Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(outPath, buffer);
    console.log('Successfully generated Word docx at:', outPath);
  });
}

// Generate both
convertMdToDocx(
  path.join(__dirname, '../public/Stellar_PRD.md'),
  path.join(__dirname, '../public/Stellar_PRD.docx'),
  'Stellar 空间社交地图与生活标记系统 - 产品需求文档 (PRD)'
);

convertMdToDocx(
  path.join(__dirname, '../public/Stella_Academy_PRD_V4.0.md'),
  path.join(__dirname, '../public/Stella_Academy_PRD_V4.0.docx'),
  'Stella 学海星球（Academy Star Atlas）大学课程与学业管理系统 · PRD V4.0'
);
