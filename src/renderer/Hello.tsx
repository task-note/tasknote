import Button from '@atlaskit/button';
import icon from '../../assets/tasknote.png';
import { NewFileIcon, NewFolderIcon } from './CustomIcons';

export default function Hello() {
  return (
    <div id="HelloInner">
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>Organize your project like this!</h1>
      <div className="Hello">
        <Button
          appearance="primary"
          iconBefore={<NewFileIcon label="" size="small" />}
        >
          New Project Note
        </Button>
        <Button
          appearance="primary"
          iconBefore={<NewFolderIcon label="" size="small" />}
        >
          New Folder
        </Button>
      </div>
    </div>
  );
}