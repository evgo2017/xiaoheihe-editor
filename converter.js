/**
 * 小黑盒 Markdown 转换规则提取
 */

/**
 * 获取渲染缩放比例
 * @returns {number}
 */
export function getRenderScale() {
  const dpr = window.devicePixelRatio || 1;
  return Math.min(3, Math.max(2, dpr));
}

/**
 * 设置高 DPI Canvas
 * @param {HTMLCanvasElement} canvas 
 * @param {number} logicalWidth 
 * @param {number} logicalHeight 
 * @returns {CanvasRenderingContext2D}
 */
export function setupHiDpiCanvas(canvas, logicalWidth, logicalHeight) {
  const scale = getRenderScale();
  canvas.width = Math.round(logicalWidth * scale);
  canvas.height = Math.round(logicalHeight * scale);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  return ctx;
}

/**
 * 绘制高亮代码
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} text 
 * @param {number} x 
 * @param {number} y 
 */
export function drawHighlightedCode(ctx, text, x, y) {
  // Expanded keyword list for C++, Python, JS, etc.
  const tokenRegex = /(\/\/.*$|#.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|(\b(?:function|return|if|else|for|while|const|let|var|async|await|import|export|class|new|this|try|catch|true|false|null|undefined|void|typeof|instanceof|public|private|protected|static|virtual|override|int|float|double|char|string|bool|list|dict|set|def|elif|lambda|none|using|namespace|include|template)\b)|(\b\d+\b)/;

  let cursorX = x;
  let remaining = text;

  while (remaining.length > 0) {
    const match = remaining.match(tokenRegex);
    if (!match) {
      ctx.fillStyle = '#333';
      ctx.fillText(remaining, cursorX, y);
      break;
    }

    const index = match.index;
    if (index > 0) {
      const pre = remaining.substring(0, index);
      ctx.fillStyle = '#333';
      ctx.fillText(pre, cursorX, y);
      cursorX += ctx.measureText(pre).width;
    }

    const token = match[0];

    if (match[1]) ctx.fillStyle = '#a0a1a7'; // Comment
    else if (match[2]) ctx.fillStyle = '#50a14f'; // String
    else if (match[3]) ctx.fillStyle = '#a626a4'; // Keyword
    else if (match[4]) ctx.fillStyle = '#986801'; // Number
    else ctx.fillStyle = '#333';

    ctx.fillText(token, cursorX, y);
    cursorX += ctx.measureText(token).width;

    remaining = remaining.substring(index + token.length);
  }
}

/**
 * 将代码块生成图片
 * @param {string} code 
 * @param {string} language 
 * @returns {string} Base64 URL
 */
export function generateCodeBlockImage(code, language) {
  const canvas = document.createElement('canvas');
  const measureCtx = canvas.getContext('2d');

  const padding = 16;
  const lineHeight = 20;
  const lines = code.split('\n');

  // Calculate required width based on content
  measureCtx.font = '14px "SF Mono", Monaco, Consolas, monospace';
  let maxLineWidth = 0;
  lines.forEach(line => {
    const metrics = measureCtx.measureText(line);
    if (metrics.width > maxLineWidth) {
      maxLineWidth = metrics.width;
    }
  });

  const maxWidth = Math.max(600, maxLineWidth + padding * 2 + 20);
  const height = padding * 2 + (language ? 30 : 0) + lines.length * lineHeight;

  const ctx = setupHiDpiCanvas(canvas, maxWidth, height);

  // 背景
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, maxWidth, height);

  // 边框
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, maxWidth, height);

  // 语言标签
  if (language) {
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(0, 0, maxWidth, 24);
    ctx.fillStyle = '#666';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(language, maxWidth - 10, 16);
    ctx.textAlign = 'left';
  }

  // 代码内容
  ctx.fillStyle = '#333';
  ctx.font = '14px "SF Mono", Monaco, Consolas, monospace';
  const startY = padding + (language ? 30 : 0);

  lines.forEach((line, index) => {
    drawHighlightedCode(ctx, line, padding, startY + index * lineHeight + 14);
  });

  return canvas.toDataURL('image/png');
}

/**
 * 解析富文本行
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} text 
 * @param {number} maxWidth 
 * @returns {Array}
 */
export function getWrappedLines(ctx, text, maxWidth) {
  // Split by markdown syntax
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|~~[^~]+~~|__[^_]+__)/g);
  const baseFont = '13px -apple-system, sans-serif';
  const boldFont = 'bold 13px -apple-system, sans-serif';

  let lines = [];
  let currentLine = []; // Array of {text, font}
  let currentLineWidth = 0;

  parts.forEach(part => {
    let isBold = false;
    let content = part;

    if (part.startsWith('`') && part.endsWith('`')) {
      isBold = true; content = part.slice(1, -1);
    } else if (part.startsWith('**') && part.endsWith('**')) {
      isBold = true; content = part.slice(2, -2);
    } else if (part.startsWith('~~') && part.endsWith('~~')) {
      isBold = true; content = part.slice(2, -2);
    } else if (part.startsWith('__') && part.endsWith('__')) {
      isBold = true; content = part.slice(2, -2);
    }

    const font = isBold ? boldFont : baseFont;
    ctx.font = font;

    // Character-level wrapping for robustness with CJK
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const charWidth = ctx.measureText(char).width;

      if (currentLineWidth + charWidth > maxWidth) {
        lines.push(currentLine);
        currentLine = [{ text: char, font: font }];
        currentLineWidth = charWidth;
      } else {
        if (currentLine.length > 0 && currentLine[currentLine.length - 1].font === font) {
          currentLine[currentLine.length - 1].text += char;
        } else {
          currentLine.push({ text: char, font: font });
        }
        currentLineWidth += charWidth;
      }
    }
  });

  if (currentLine.length > 0) lines.push(currentLine);
  if (lines.length === 0) lines.push([]);

  return lines;
}

/**
 * 将表格生成图片
 * @param {Array} tableData 
 * @returns {string} Base64 URL
 */
export function generateTableImage(tableData) {
  const canvas = document.createElement('canvas');
  const measureCtx = canvas.getContext('2d');

  const padding = 12;
  const cellPadding = 10;
  const baseRowHeight = 36;
  const lineHeight = 20;
  const maxWidth = 560;

  // 计算列宽
  const colCount = tableData[0].length;
  const colWidth = Math.floor((maxWidth - padding * 2) / colCount);
  const cellContentWidth = colWidth - cellPadding * 2;

  // 1. Calculate height for each row
  const processedRows = [];
  let totalHeight = padding * 2;

  tableData.forEach((row, rowIndex) => {
    let maxLinesInRow = 1;
    const rowCells = [];

    row.forEach(cellText => {
      const lines = getWrappedLines(measureCtx, cellText, cellContentWidth);
      rowCells.push(lines);
      if (lines.length > maxLinesInRow) {
        maxLinesInRow = lines.length;
      }
    });

    const rowContentHeight = maxLinesInRow * lineHeight;
    const rowTotalHeight = Math.max(baseRowHeight, rowContentHeight + 16); // padding top/bottom

    processedRows.push({
      height: rowTotalHeight,
      cells: rowCells
    });

    totalHeight += rowTotalHeight;
  });

  const ctx = setupHiDpiCanvas(canvas, maxWidth, totalHeight);

  // 背景
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, maxWidth, totalHeight);

  let currentY = padding;

  processedRows.forEach((rowInfo, rowIndex) => {
    const rowHeight = rowInfo.height;
    const y = currentY;

    // 表头背景
    if (rowIndex === 0) {
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(padding, y, colCount * colWidth, rowHeight);
    }

    // 行分隔线
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, y + rowHeight);
    ctx.lineTo(padding + colCount * colWidth, y + rowHeight);
    ctx.stroke();

    // 列分隔线和内容
    rowInfo.cells.forEach((lines, colIndex) => {
      const x = padding + colIndex * colWidth;

      if (colIndex < colCount) {
        ctx.strokeStyle = '#e0e0e0';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + rowHeight);
        ctx.stroke();
      }

      // 单元格内容
      ctx.fillStyle = '#333';
      ctx.textBaseline = 'middle';

      const textBlockHeight = lines.length * lineHeight;
      const startY = y + (rowHeight - textBlockHeight) / 2 + lineHeight / 2;

      lines.forEach((line, lineIndex) => {
        const lineY = startY + lineIndex * lineHeight;
        let currentX = x + cellPadding;

        line.forEach(segment => {
          ctx.font = segment.font;
          ctx.fillText(segment.text, currentX, lineY);
          currentX += ctx.measureText(segment.text).width;
        });
      });
    });

    // 右边框
    ctx.beginPath();
    ctx.moveTo(padding + colCount * colWidth, y);
    ctx.lineTo(padding + colCount * colWidth, y + rowHeight);
    ctx.stroke();

    currentY += rowHeight;
  });

  // 顶部边框
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding + colCount * colWidth, padding);
  ctx.stroke();

  return canvas.toDataURL('image/png');
}

/**
 * 解析表格 Markdown
 * @param {string} markdown 
 * @returns {Array}
 */
export function parseTable(markdown) {
  const lines = markdown.trim().split('\n');
  const tableData = [];

  lines.forEach((line, index) => {
    // Robust check for separator lines
    if (/^[\s|:-]+$/.test(line)) return;

    const content = line.trim().replace(/^\||\|$/g, '');
    const cells = content.split('|').map(c => c.trim());

    if (cells.length > 0) {
      tableData.push(cells);
    }
  });

  return tableData;
}

/**
 * 处理 Markdown 内容，导出为适合小黑盒的格式
 * @param {string} markdown 
 * @returns {Promise<string>}
 */
export async function processMarkdownForExport(markdown) {
  let processed = markdown;

  // 1. 处理代码块
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;
  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    const language = match[1] || '';
    const code = match[2].trim();
    const imageUrl = generateCodeBlockImage(code, language);
    processed = processed.replace(match[0], `\n![代码块](${imageUrl})\n`);
  }

  // 2. 处理表格
  const tableRegex = /\|[^\n]+\|[^\n]*(?:\n\|[-:]+[-|:]*\|[^\n]*)?(?:\n\|[^\n]+\|[^\n]*)*/g;
  const tables = markdown.match(tableRegex) || [];
  tables.forEach(tableMarkdown => {
    const tableData = parseTable(tableMarkdown);
    if (tableData.length > 0) {
      const imageUrl = generateTableImage(tableData);
      processed = processed.replace(tableMarkdown, `\n![表格](${imageUrl})\n`);
    }
  });

  // 2.5 处理本地图片
  processed = processed.replace(/!\[(.*?)\]\((?!http|data:)(.*?)\)/g, (match, alt, url) => {
    return `\n（图片：${url}）\n`;
  });

  // 3. 格式平铺
  processed = processed.replace(/\*\*“([^”]+)”\*\*/g, '“**$1**”');
  processed = processed.replace(/\*\*"([^"]+)"\*\*/g, '"**$1**"');
  processed = processed.replace(/`\s*([^`\n]+?)\s*`/g, '**$1**');
  processed = processed.replace(/~~([^~]+?)~~/g, '**$1**');
  processed = processed.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '**$1**');
  processed = processed.replace(/(?<!_)_([^_]+?)_(?!_)/g, '**$1**');

  // 4. 将超链接 [text](url) 转为 **text**（url）
  processed = processed.replace(/(!?)\[([^\]]+)\]\(([^)"]+)\)/g, (match, prefix, text, url) => {
    if (prefix === '!') return match; // Skip images
    const cleanUrl = url.trim();
    if (/^https:\/\/www\.xiaoheihe\.cn\/app\/bbs\/link\/\S+/i.test(cleanUrl)) {
      return match;
    }
    return `**${text}**（${cleanUrl}）`;
  });

  return processed;
}
