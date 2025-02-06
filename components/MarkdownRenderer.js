import React from 'react';
import { marked } from 'marked';
 
const MarkdownRenderer = ({ markdown }) => {
  const getHTML = (markdownText) => {
    if(markdownText)
    return { __html: marked(markdownText) };
  };
 
  return (
    <div dangerouslySetInnerHTML={getHTML(markdown)} />
  );
};
 
export default MarkdownRenderer;