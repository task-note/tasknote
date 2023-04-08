import { useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import Button from '@atlaskit/button/standard-button';
import { useTranslation } from 'react-i18next';

import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from '@atlaskit/modal-dialog';

let openMessageBox: () => void;
export type InputCallback = (val: number) => void;

interface MessageBoxProp {
  title: string;
  message: string;
  callback: InputCallback;
  okname: string;
}

function MessageBox({ title, message, callback, okname }: MessageBoxProp) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  openMessageBox = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => {
    setIsOpen(false);
    callback(0);
  }, [callback]);
  const okModal = useCallback(() => {
    setIsOpen(false);
    callback(1);
  }, [callback]);

  const hasCancel = okname !== 'OK';

  return (
    <ModalTransition>
      {isOpen && (
        <Modal onClose={closeModal}>
          <ModalHeader>
            <ModalTitle appearance="warning">{title}</ModalTitle>
          </ModalHeader>
          <ModalBody>{message}</ModalBody>
          <ModalFooter>
            {hasCancel && (
              <Button appearance="subtle" onClick={closeModal}>
                {t('Cancel')}
              </Button>
            )}
            <Button appearance="warning" onClick={okModal} autoFocus>
              {t(okname)}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </ModalTransition>
  );
}

function showMessageBox(
  title: string,
  tips: string,
  cb: InputCallback,
  okname = 'Delete'
) {
  const fakeRenderTarget = document.getElementById('fake-container');
  ReactDOM.render(
    <MessageBox title={title} message={tips} callback={cb} okname={okname} />,
    fakeRenderTarget,
    () => {
      openMessageBox();
    }
  );
}

export default showMessageBox;
