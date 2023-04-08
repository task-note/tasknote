/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useCallback } from 'react';
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
import tippy from 'tippy.js';
import { useTranslation } from 'react-i18next';
import { warn } from './Logger';

export type InputCallback = (val: string) => void;
export type ValidatorFunc = (val: string) => boolean;
let openModal: () => void;

interface InputDialogProp {
  title: string;
  tips: string;
  defaultVal: string;
  validator: ValidatorFunc | undefined;
  callback: InputCallback;
  okName: string;
}

function displayTips(id: string, tips: string) {
  const inputEle = document.querySelector(id) as HTMLInputElement;
  const errTip = tippy(inputEle, {
    content: tips,
    animation: 'scale',
    placement: 'bottom-start',
    trigger: 'manual',
    theme: 'error',
    interactive: true,
  });
  errTip.show();
  if (inputEle) {
    inputEle.focus();
  }
}

function InputDialog({
  title,
  tips,
  defaultVal,
  validator,
  callback,
  okName,
}: InputDialogProp) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

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
      const newName = obj.name as string;
      if (newName.trim().length === 0) {
        warn('empty, show error tippy!');
        displayTips('#name', t('name_empty'));
        return;
      }
      if (validator) {
        if (!validator(newName)) {
          warn('validate name failed, show error tippy!');
          displayTips('#name', t('name_duplicate'));
          return;
        }
      }

      callback(obj.name as string);
      closeModal();
    },
    [closeModal, callback, validator]
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
          {title}
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
              <Field id="name" name="name" label={tips}>
                {({ fieldProps }) => (
                  <>
                    <Textfield
                      {...fieldProps}
                      defaultValue={defaultVal}
                      maxLength={255}
                      ref={focusRef}
                    />
                  </>
                )}
              </Field>
            </ModalBody>
            <ModalFooter>
              <Button appearance="subtle" onClick={closeModal}>
                {t('Close')}
              </Button>
              <Button appearance="primary" type="submit">
                {t(okName)}
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </ModalTransition>
  );
}

function showInputDialog(
  title: string,
  tips: string,
  cb: InputCallback,
  defaultVal = '',
  validator: ValidatorFunc | undefined = undefined,
  okName = 'Create'
) {
  const fakeRenderTarget = document.getElementById('fake-container');
  ReactDOM.render(
    <InputDialog
      title={title}
      tips={tips}
      callback={cb}
      defaultVal={defaultVal}
      validator={validator}
      okName={okName}
    />,
    fakeRenderTarget,
    () => {
      openModal();
    }
  );
}

export default showInputDialog;
