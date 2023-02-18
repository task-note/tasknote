import { useLocation } from 'react-router-dom';
import '../../packages/blocknote/src/style.css';
import styles from './Editor.module.css';
import { EditorContent, useEditor } from '../../packages/blocknote/src';
import { writeFile, readFile } from './FileOp';

let currPath = '';
let jsonContext = {};
let loading = true;

function TaskEditor() {
  const { state } = useLocation();
  const { id, title } = state; // Read values passed on state
  const usrEditor = useEditor({
    onUpdate: ({ editor }) => {
      const content = JSON.stringify(editor.getJSON());
      if (loading) {
        console.error('it is still loading, dont overwrite it to null');
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
          console.error(
            'logic error, read file mismatch: id=',
            id,
            ', path=',
            path
          );
          return;
        }
        try {
          jsonContext = JSON.parse(content);
        } catch (error) {
          console.warn(error);
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

  return (
    <div id="editor-root">
      <div id="editor-title">
        <div
          className="input"
          contentEditable="true"
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
