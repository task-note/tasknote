// import logo from './logo.svg'
import React, { useState } from 'react';
import { Editor } from '@tiptap/core';
import { VscFolderOpened, VscSaveAs } from 'react-icons/vsc';
import '../../packages/blocknote/src/style.css';
import styles from './Editor.module.css';
import { EditorContent, useEditor } from '../../packages/blocknote/src';

type WindowWithProseMirror = Window &
  typeof globalThis & { ProseMirror: Editor };

function TaskEditor() {
  const usrEditor = useEditor({
    onUpdate: ({ editor }) => {
      // console.log(editor.getJSON());
      (window as WindowWithProseMirror).ProseMirror = editor; // Give tests a way to get editor instance
    },
    editorProps: {
      attributes: {
        class: styles.editor,
        'data-test': 'editor',
      },
    },
  });

  function onSave() {
    const content = JSON.stringify(usrEditor?.getJSON());
    const tools = document.getElementById('title');
    const title = tools?.innerText;
    console.log('onSave', title, content);
  }

  function onOpen() {
    const test = {
      type: 'doc',
      content: [],
    };
    usrEditor?.commands.setContent(test);
  }

  return (
    <div id="editor-root">
      <div id="editor-title">
        <div className="input" contentEditable="true" suppressContentEditableWarning>
          title
        </div>
      </div>
      <EditorContent editor={usrEditor} />
    </div>
  );
}

export default TaskEditor;
