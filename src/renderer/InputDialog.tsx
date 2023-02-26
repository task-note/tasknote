/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useCallback, useEffect } from 'react';
import { cx, css } from '@emotion/css';
import ReactDOM from 'react-dom';
import Button from '@atlaskit/button/standard-button';
import { Field } from '@atlaskit/form';
import Textfield from '@atlaskit/textfield';
import Modal, {
  ModalBody,
  ModalFooter,
  useModal,
  ModalTransition,
} from '@atlaskit/modal-dialog';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import { N500 } from '@atlaskit/theme/colors';
import { token } from '@atlaskit/tokens';

let openModal: () => void;
export type InputCallback = (val: string) => void;
let inputCallbackFunc: InputCallback;
let dialogTitle = 'Input Dialog';
let inputTips = 'Please input names:';

function InputDialog() {
  const [isOpen, setIsOpen] = useState(false);

  openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const data = new FormData(e.target as HTMLFormElement);
      const obj: Record<string, FormDataEntryValue> = {};
      data.forEach((val, key) => {
        obj[key] = val;
      });

      inputCallbackFunc(obj.name as string);
      closeModal();
    },
    [closeModal]
  );

  const headerStyles = css({
    display: 'flex',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  });

  const headingStyles = css({ fontSize: 20, fontWeight: 500 });

  const CustomHeader = () => {
    const { onClose, titleId } = useModal();
    return (
      <div className={cx(headerStyles)}>
        <h1 className={cx(headingStyles)} id={titleId}>
          {dialogTitle}
        </h1>
        <Button appearance="link" onClick={onClose}>
          <CrossIcon
            label="Close Modal"
            primaryColor={token('color.text.subtle', N500)}
          />
        </Button>
      </div>
    );
  };
  const focusRef = React.useRef<HTMLElement>();

  return (
    <ModalTransition>
      {isOpen && (
        <Modal autoFocus={focusRef} onClose={closeModal}>
          <CustomHeader />
          <form onSubmit={onSubmit}>
            <ModalBody>
              <Field id="name" name="name" label={inputTips}>
                {({ fieldProps }) => (
                  <>
                    <Textfield {...fieldProps} ref={focusRef} />
                  </>
                )}
              </Field>
            </ModalBody>
            <ModalFooter>
              <Button appearance="subtle" onClick={closeModal}>
                Close
              </Button>
              <Button appearance="primary" type="submit">
                Create
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </ModalTransition>
  );
}

function showInputDialog(title: string, tips: string, cb: InputCallback) {
  inputCallbackFunc = cb;
  dialogTitle = title;
  inputTips = tips;
  const fakeRenderTarget = document.getElementById('fake-container');
  ReactDOM.render(<InputDialog />, fakeRenderTarget, () => {
    openModal();
  });
}

export default showInputDialog;
