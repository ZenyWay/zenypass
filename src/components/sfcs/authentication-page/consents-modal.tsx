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
import {
  Button,
  FormGroup,
  Input,
  InputGroup,
  InputGroupPrepend,
  InputGroupText,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader
} from 'bootstrap'
import { classes } from 'utils'
import { style } from 'typestyle'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))
const TERMS_MD = {
  fr: require('./terms-fr.md'),
  en: require('./terms-en.md')
}

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

namespace css {
  export const markdown = style({
    lineHeight: 'normal',
    $nest: {
      '& h5, & h4, & h3, & h2, & h1': {
        fontSize: 'inherit'
      },
      '& h1, & h1': {
        fontWeight: 'bold'
      },
      '& h3, & h2, & h1': {
        textTransform: 'uppercase'
      },
      '& ol': {
        paddingBlockStart: '1rem'
      },
      '& ol>ul': {
        paddingBlockStart: '2rem'
      }
    }
  })
  export const notepad = classes(
    style({
      height: '30vh',
      overflowY: 'scroll',
      fontSize: '0.8rem',
      border: '1px solid rgba(0,0,0,0.15)'
    }),
    markdown,
    'text-left rounded p-1'
  )
}

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
      <ModalHeader toggle={onCancel} className='bg-info text-white'>
        {t('T&Cs')}
      </ModalHeader>
      <ModalBody>
        <form id='consents-modal-form' onSubmit={onSubmit}>
          <div class='mb-3'>
            <div className={css.notepad}>
              <small
                dangerouslySetInnerHTML={{
                  // https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml
                  __html: TERMS_MD[locale]
                }}
              />
            </div>
            <a href={t('tnc-link')} target='_blank' rel='noopener noreferer'>
              <small>{t('View the T&Cs online')}</small>
            </a>
          </div>
          <ConsentCheckbox
            id='terms'
            checked={terms}
            label={t('I have read and accept the T&Cs of ZenyPass')}
            error={!terms && t('Required for creating an account')}
            onToggle={onToggle}
          />
          <ConsentCheckbox
            id='news'
            checked={news}
            label={t(
              'I subscribe to the newsletter containing help and news about ZenyPass'
            )}
            onToggle={onToggle}
            className='mb-0'
          >
            <small className='form-text text-muted'>
              {`${t('Also follow ZenyPass on')} `}
              <a href={t('info-link')} target='_blank' rel='noopener noreferer'>
                Medium
              </a>
              {` ${t('and')} `}
              <a
                href={t('facebook-link')}
                target='_blank'
                rel='noopener noreferer'
              >
                Facebook
              </a>
              .
            </small>
          </ConsentCheckbox>
        </form>
      </ModalBody>
      <ModalFooter className='bg-light'>
        <Button outline onClick={onCancel}>
          {t('Cancel')}
        </Button>
        <Button
          type='submit'
          form='consents-modal-form'
          color='info'
          disabled={!terms}
        >
          {t('Accept')}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export interface ConsentCheckboxProps {
  id: 'terms' | 'news'
  checked?: boolean
  label?: string
  error?: string
  children?: any
  onToggle?: (event: Event) => void
}

function ConsentCheckbox ({
  id,
  checked,
  label,
  error,
  children,
  onToggle,
  ...attrs
}: ConsentCheckboxProps & UnknownProps) {
  const inputId = `${id}_consent`
  return (
    <FormGroup {...attrs}>
      <InputGroup>
        <InputGroupPrepend>
          <InputGroupText
            className={classes(error && 'border-danger text-danger')}
          >
            <Input
              type='checkbox'
              id={inputId}
              data-id={id}
              checked={checked}
              onInput={onToggle}
            />
          </InputGroupText>
        </InputGroupPrepend>
        <label
          className={classes(
            'form-control form-control-sm h-auto',
            error && 'is-invalid'
          )}
          htmlFor={inputId}
        >
          {label || null}
        </label>
      </InputGroup>
      <small className={classes(error && 'form-text text-danger')}>
        {error || null}
      </small>
      {children}
    </FormGroup>
  )
}
