/**
 * Copyright 2018 ZenyWay S.A.S., Stephane M. Catala
 * @author Stephane M. Catala
 * @license Apache Version 2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 */
/** @jsx createElement */
import { createElement } from 'create-element'
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import {
  Button,
  FormGroup,
  Input,
  Label,
  InputGroup,
  InputGroupPrepend,
  InputGroupText
} from 'bootstrap'
import { classes } from 'utils'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface ConsentsModalProps {
  locale: string
  display?: boolean
  terms?: boolean
  news?: boolean
  onCancel?: (event: Event) => void
  onToggle?: (event: Event) => void
  onSubmit?: (event: Event) => void
}

export type UnknownProps = { [prop: string]: unknown }

export function ConsentsModal ({
  locale,
  display,
  terms,
  news,
  onCancel,
  onToggle,
  onSubmit,
  ...attrs
}: ConsentsModalProps & UnknownProps) {
  const t = l10ns[locale]
  return (
    <Modal isOpen={display} toggle={onCancel} size='lg' {...attrs}>
      <ModalBody>
        <form id='consents-modal-form' onSubmit={onSubmit}>
          <p>CONSENTS_FORM</p>
          <CheckboxFormGroup
            id='terms-consent'
            label={t('I have read and accept the T&Cs of ZenyPass')}
            error={!terms && t('Required for creating an account')}
            onToggle={onToggle}
          />
          <CheckboxFormGroup
            id='news-consent'
            label={t('I subscribe to the newsletter containing help and news about ZenyPass')}
            onToggle={onToggle}
          >
            <small className='form-text text-muted'>
              {`${t('Also follow Zenypass on')} `}
              <a target='_blank' href={t('medium-link')}>Medium</a>
              {` ${t('and')} `}
              <a target='_blank' href={t('facebook-link')}>Facebook</a>.
            </small>
          </CheckboxFormGroup>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button
          type='submit'
          form='consents-modal-form'
          color='info'
        >
          {t('Accept')}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export interface CheckboxFormGroupProps {
  id: string
  label?: string
  error?: string
  children?: any
  onToggle?: (event: Event) => void
}

function CheckboxFormGroup ({
  id,
  label,
  error,
  children,
  onToggle,
  ...attrs
}: CheckboxFormGroupProps & UnknownProps) {
  return (
    <FormGroup {...attrs} >
      <InputGroup>
        <InputGroupPrepend>
          <InputGroupText
            className={classes(error && 'border-danger text-danger')}
          >
            <Input
              type='checkbox'
              id={id}
              data-id={id}
              onInput={onToggle}
            />
          </InputGroupText>
        </InputGroupPrepend>
        <label
          className={
            classes('form-control form-control-sm h-auto', error && 'is-invalid')
          }
          htmlFor={id}
        >
          {label || null}
        </label>
      </InputGroup>
      <small className={classes(error && 'form-text text-danger')} >
        {error || null}
      </small>
      {children}
    </FormGroup>
  )
}
