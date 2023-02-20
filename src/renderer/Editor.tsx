import { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import '../../packages/blocknote/src/style.css';
import styles from './Editor.module.css';
import { EditorContent, useEditor } from '../../packages/blocknote/src';
import { writeFile, readFile } from './FileOp';
import { log, warn, error } from './Logger';

let currPath = '';
let jsonContext = {};
let loading = true;
let currentTitle: string | null | undefined = '';

function TaskEditor() {
  const titleInputRef: React.RefObject<HTMLDivElement> = useRef(null);
  const { state } = useLocation();
  const { id, title } = state; // Read values passed on state
  currentTitle = title;
  const usrEditor = useEditor({
    onUpdate: ({ editor }) => {
      const content = JSON.stringify(editor.getJSON());
      if (loading) {
        warn('it is still loading, dont overwrite it to null');
        return;
      }
      writeFile(currPath, content);
    },
    editorProps: {
      attributes: {
        class: styles.editor,
        'data-test': 'editor',
      },
    },
  });

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
        loading = false;
      });
    }
  }

  if (titleInputRef.current) {
    titleInputRef.current.addEventListener('focusout', (event) => {
      event.preventDefault();
      if (titleInputRef.current?.innerText !== currentTitle) {
        log('input focus out', titleInputRef.current?.innerText);
        currentTitle = titleInputRef.current?.innerText;
      }
    });
  }

  return (
    <div id="editor-root">
      <div id="editor-title">
        <div
          className="input"
          contentEditable="true"
          ref={titleInputRef}
          suppressContentEditableWarning
        >
          {title}
        </div>
      </div>
      <EditorContent editor={usrEditor} />
    </div>
  );
}

export default TaskEditor;
