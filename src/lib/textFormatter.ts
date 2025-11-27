const htmlTagPattern = /<\/?[a-z][\s\S]*>/i;
const listItemPattern = /^((?:\d+[\.\)]|[a-zA-Z]\)|[-*•]))\s+/;
const headingPattern = /^\*\*(.+?)\*\*$/;
const dividerPattern = /^[-_]{3,}$/;

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const applyInlineFormatting = (value: string): string => {
  let formatted = escapeHtml(value);

  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
  formatted = formatted.replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\*(?!\*)([^*]+)\*(?!\*)/g, '<em>$1</em>');
  formatted = formatted.replace(/_(?!_)([^_]+)_(?!_)/g, '<em>$1</em>');

  return formatted;
};

export const formatFriendlyContent = (rawContent: string): string => {
  if (!rawContent) {
    return '';
  }

  if (htmlTagPattern.test(rawContent)) {
    return rawContent;
  }

  const sections: string[] = [];
  let listBuffer: string[] = [];
  let paragraphBuffer: string[] = [];

  const pushList = () => {
    if (listBuffer.length) {
      sections.push(`<ul>${listBuffer.join('')}</ul>`);
      listBuffer = [];
    }
  };

  const pushParagraph = () => {
    if (paragraphBuffer.length) {
      const text = paragraphBuffer.join(' ');
      sections.push(`<p>${applyInlineFormatting(text)}</p>`);
      paragraphBuffer = [];
    }
  };

  const lines = rawContent.replace(/\r\n/g, '\n').split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      pushParagraph();
      pushList();
      continue;
    }

    if (dividerPattern.test(line)) {
      pushParagraph();
      pushList();
      sections.push('<hr />');
      continue;
    }

    if (headingPattern.test(line)) {
      pushParagraph();
      pushList();
      const headingText = line.replace(headingPattern, '$1').trim();
      sections.push(`<h4>${applyInlineFormatting(headingText)}</h4>`);
      continue;
    }

    if (listItemPattern.test(line)) {
      pushParagraph();
      const cleaned = line.replace(listItemPattern, '').trim();
      if (cleaned) {
        listBuffer.push(`<li>${applyInlineFormatting(cleaned)}</li>`);
      }
      continue;
    }

    paragraphBuffer.push(line);
  }

  pushParagraph();
  pushList();

  return sections.join('');
};
