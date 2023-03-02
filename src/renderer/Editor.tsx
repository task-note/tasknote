import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Editor } from '@tiptap/core';
import '../../packages/blocknote/src/style.css';
import styles from './Editor.module.css';
import { EditorContent, useEditor } from '../../packages/blocknote/src';
import { writeFile, readFile } from './FileOp';
import { log, warn, error } from './Logger';

let currPath = '';
let jsonContext;
let loading = true;
let currentTitle: string | null | undefined = '';

function saveContentAndTitle(editor: Editor) {
  const jsonContent = editor.getJSON();
  jsonContent.title = currentTitle;
  const content = JSON.stringify(jsonContent);
  if (loading) {
    warn('it is still loading, dont overwrite it to null');
    return;
  }
  writeFile(currPath, content);
}

function TaskEditor() {
  const { state } = useLocation();
  const { id, title } = state; // Read values passed on state
  const usrEditor = useEditor({
    onUpdate: ({ editor }) => {
      saveContentAndTitle(editor);
    },
    editorProps: {
      attributes: {
        class: styles.editor,
        'data-test': 'editor',
      },
    },
  });

  const onContextMenu = () => {
    log('editor right click');
  };

  const [titleEdited, setTitleString] = useState<string>(title);

  if (usrEditor) {
    if (id !== currPath) {
      currPath = id as string;
      loading = true;
      readFile(id, (path: string, content: string) => {
        if (path !== id) {
          error('logic error, read file mismatch: id=', id, ', path=', path);
          return;
        }
        try {
          jsonContext = JSON.parse(content);
        } catch (err) {
          warn(error);
          jsonContext = {
            type: 'doc',
            content: [],
          };
        }
        usrEditor.commands.setContent([jsonContext]);
        const titleStr = Object.prototype.hasOwnProperty.call(
          jsonContext,
          'title'
        )
          ? jsonContext.title
          : title;
        currentTitle = titleStr;
        setTitleString(titleStr);
        loading = false;
      });
    }
  }

  const onInputBlur = () => {
    if (loading || usrEditor === null) {
      warn('Editing title when it is loading, will update later...');
      return;
    }
    if (titleEdited !== currentTitle) {
      log('input focus out', titleEdited);
      currentTitle = titleEdited;
      saveContentAndTitle(usrEditor);
    }
  };

  return (
    <div id="editor-root">
      <div id="editor-title">
        <input
          type="text"
          value={titleEdited}
          onBlur={onInputBlur}
          onChange={(e) => setTitleString(e.target.value)}
        />
      </div>
      <EditorContent editor={usrEditor} onContextMenu={onContextMenu} />
    </div>
  );
}

export default TaskEditor;
