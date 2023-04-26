import React from 'react';
import Editor from '@monaco-editor/react';

export const Shell: React.FC<any> = () => {
  return (
    <div className="p-4">
      <Editor
        theme="vs-dark"
        height="50vh"
        defaultLanguage="bash"
        defaultValue="# Deployment 12345"
      />
    </div>
  );
};
