import { useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import Button from '@atlaskit/button/standard-button';

import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from '@atlaskit/modal-dialog';

let openMessageBox: () => void;
export type InputCallback = (val: number) => void;
let inputCallbackFunc: InputCallback;
let dialogTitle = 'Warning Dialog';
let dialogMsg = 'Warning Dialog';

function MessageBox() {
  const [isOpen, setIsOpen] = useState(false);
  openMessageBox = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => {
    setIsOpen(false);
    inputCallbackFunc(0);
  }, []);
  const okModal = useCallback(() => {
    setIsOpen(false);
    inputCallbackFunc(1);
  }, []);

  return (
    <ModalTransition>
      {isOpen && (
        <Modal onClose={closeModal}>
          <ModalHeader>
            <ModalTitle appearance="warning">{dialogTitle}</ModalTitle>
          </ModalHeader>
          <ModalBody>{dialogMsg}</ModalBody>
          <ModalFooter>
            <Button appearance="subtle" onClick={closeModal}>
              Cancel
            </Button>
            <Button appearance="warning" onClick={okModal} autoFocus>
              Delete
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </ModalTransition>
  );
}

function showMessageBox(title: string, tips: string, cb: InputCallback) {
  inputCallbackFunc = cb;
  dialogTitle = title;
  dialogMsg = tips;
  const fakeRenderTarget = document.getElementById('fake-container');
  ReactDOM.render(<MessageBox />, fakeRenderTarget, () => {
    openMessageBox();
  });
}

export default showMessageBox;
