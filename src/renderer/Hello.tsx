import Button from '@atlaskit/button';
import { useTranslation } from 'react-i18next';
import icon from '../../assets/tasknote.png';
import { NewFileIcon, NewFolderIcon } from './CustomIcons';

type VoidCallback = () => void;
let newFileCB: VoidCallback | undefined;
let newFolderCB: VoidCallback | undefined;

function setNaviCallbacks(newFile: VoidCallback, newFolder: VoidCallback) {
  newFileCB = newFile;
  newFolderCB = newFolder;
}

function Hello() {
  const { t } = useTranslation();
  return (
    <div id="HelloInner">
      <div id="HelloBox">
        <div className="Hello">
          <img width="200" alt="icon" src={icon} />
        </div>
        <h1>{t('slogan')}</h1>
        <div className="Hello">
          <Button
            appearance="primary"
            onClick={newFolderCB}
            iconBefore={<NewFolderIcon label="" size="small" />}
          >
            {t('NewFolder')}
          </Button>
          <Button
            appearance="primary"
            onClick={newFileCB}
            iconBefore={<NewFileIcon label="" size="small" />}
          >
            {t('NewProjectNote')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export { Hello as default, setNaviCallbacks };
