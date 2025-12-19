import React from 'react';

const MessageRenderer = ({ content, className = "" }) => {
  // Function to parse and format the AI response
  const parseContent = (text) => {
    if (!text) return [];

    // Split by double newlines to get paragraphs
    const paragraphs = text.split('\n\n');
    const elements = [];

    paragraphs.forEach((paragraph, pIndex) => {
      if (!paragraph.trim()) return;

      // Check if it's a header (starts with #)
      if (paragraph.startsWith('#')) {
        const level = paragraph.match(/^#+/)[0].length;
        const headerText = paragraph.replace(/^#+\s*/, '');
        elements.push({
          type: 'header',
          level,
          content: headerText,
          key: `header-${pIndex}`
        });
        return;
      }

      // Check if it's a stats section (starts with 📊)
      if (paragraph.includes('📊 Your Profile Stats:')) {
        const lines = paragraph.split('\n');
        elements.push({
          type: 'stats',
          content: lines,
          key: `stats-${pIndex}`
        });
        return;
      }

      // Check if it's a list (contains bullet points)
      if (paragraph.includes('•') || paragraph.includes('*') || paragraph.includes('-')) {
        const lines = paragraph.split('\n');
        const listItems = [];
        let currentText = '';

        lines.forEach(line => {
          if (line.match(/^[\s]*[•*-]\s/)) {
            if (currentText) {
              elements.push({
                type: 'paragraph',
                content: currentText.trim(),
                key: `para-${pIndex}-${elements.length}`
              });
              currentText = '';
            }
            listItems.push(line.replace(/^[\s]*[•*-]\s/, '').trim());
          } else {
            currentText += line + '\n';
          }
        });

        if (currentText.trim()) {
          elements.push({
            type: 'paragraph',
            content: currentText.trim(),
            key: `para-${pIndex}-${elements.length}`
          });
        }

        if (listItems.length > 0) {
          elements.push({
            type: 'list',
            content: listItems,
            key: `list-${pIndex}`
          });
        }
        return;
      }

      // Check if it's a numbered list
      if (paragraph.match(/^\d+\./m)) {
        const lines = paragraph.split('\n');
        const listItems = [];
        let currentText = '';

        lines.forEach(line => {
          if (line.match(/^\d+\.\s/)) {
            if (currentText) {
              elements.push({
                type: 'paragraph',
                content: currentText.trim(),
                key: `para-${pIndex}-${elements.length}`
              });
              currentText = '';
            }
            listItems.push(line.replace(/^\d+\.\s/, '').trim());
          } else if (line.trim().startsWith('   ')) {
            // Sub-item
            if (listItems.length > 0) {
              listItems[listItems.length - 1] += '\n' + line.trim();
            }
          } else {
            currentText += line + '\n';
          }
        });

        if (currentText.trim()) {
          elements.push({
            type: 'paragraph',
            content: currentText.trim(),
            key: `para-${pIndex}-${elements.length}`
          });
        }

        if (listItems.length > 0) {
          elements.push({
            type: 'numbered-list',
            content: listItems,
            key: `numbered-list-${pIndex}`
          });
        }
        return;
      }

      // Regular paragraph
      elements.push({
        type: 'paragraph',
        content: paragraph.trim(),
        key: `para-${pIndex}`
      });
    });

    return elements;
  };

  // Function to format text with bold, italic, etc.
  const formatText = (text) => {
    if (!text) return text;

    // Replace **bold** with <strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
    
    // Replace *italic* with <em>
    text = text.replace(/\*(.*?)\*/g, '<em class="italic text-gray-200">$1</em>');
    
    // Replace `code` with <code>
    text = text.replace(/`(.*?)`/g, '<code class="bg-gray-800 px-1 py-0.5 rounded text-blue-300 text-sm">$1</code>');
    
    return text;
  };

  const elements = parseContent(content);

  return (
    <div className={`space-y-3 ${className}`}>
      {elements.map((element) => {
        switch (element.type) {
          case 'header':
            const HeaderTag = `h${Math.min(element.level, 6)}`;
            return (
              <HeaderTag
                key={element.key}
                className={`font-bold text-white ${
                  element.level === 1 ? 'text-xl' :
                  element.level === 2 ? 'text-lg' :
                  element.level === 3 ? 'text-base' : 'text-sm'
                } mb-2`}
              >
                {element.content}
              </HeaderTag>
            );

          case 'stats':
            return (
              <div key={element.key} className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 my-3">
                <div className="text-blue-300 font-medium text-sm mb-2">
                  {element.content[0]}
                </div>
                <div className="space-y-1">
                  {element.content.slice(1).map((stat, idx) => (
                    <div key={idx} className="text-gray-300 text-sm flex items-center">
                      <span className="text-blue-400 mr-2">•</span>
                      {stat.replace('•', '').trim()}
                    </div>
                  ))}
                </div>
              </div>
            );

          case 'list':
            return (
              <ul key={element.key} className="space-y-2 ml-4">
                {element.content.map((item, idx) => (
                  <li key={idx} className="text-gray-200 text-sm flex items-start">
                    <span className="text-blue-400 mr-2 mt-1">•</span>
                    <span dangerouslySetInnerHTML={{ __html: formatText(item) }} />
                  </li>
                ))}
              </ul>
            );

          case 'numbered-list':
            return (
              <ol key={element.key} className="space-y-3 ml-4">
                {element.content.map((item, idx) => (
                  <li key={idx} className="text-gray-200 text-sm flex items-start">
                    <span className="text-blue-400 mr-3 mt-1 font-medium">{idx + 1}.</span>
                    <div className="flex-1">
                      {item.split('\n').map((line, lineIdx) => (
                        <div key={lineIdx} className={lineIdx > 0 ? 'ml-4 text-gray-400 text-xs mt-1' : ''}>
                          <span dangerouslySetInnerHTML={{ __html: formatText(line) }} />
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
            );

          case 'paragraph':
          default:
            return (
              <p
                key={element.key}
                className="text-gray-200 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatText(element.content) }}
              />
            );
        }
      })}
    </div>
  );
};

export default MessageRenderer;