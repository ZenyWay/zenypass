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
import { createElement, Fragment } from 'create-element'
import {
  Col,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAppend,
  InputGroupPrepend,
  Label,
  Row
} from 'bootstrap'
import { CopyButton } from '../../copy-button'
import { Checkbox } from '../checkbox'
import { FAIconButton, FAIconButtonProps } from '../fa-icon'
import { InfoModal } from '../info-modal'
import { QuantityInput } from '../quantity-input'
import { RecordField } from '../record-field'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface PasswordGeneratorProps extends FAIconButtonProps {
  locale: string
  cleartext?: boolean
  length?: number
  lowercase?: boolean
  numbers?: boolean
  open?: boolean
  original?: string
  pending?: boolean
  symbols?: boolean
  uppercase?: boolean
  value?: string
  innerRef?: (ref: HTMLElement) => void
  onBlurInput?: (event?: Event) => void
  onClickMinus?: (event?: MouseEvent) => void
  onClickPlus?: (event?: MouseEvent) => void
  onCopied?: (success: boolean, target?: HTMLElement) => void
  onDefaultActionButtonRef?: (element: HTMLElement) => void
  onInput?: (event?: Event) => void
  onRefresh?: (event?: MouseEvent) => void
  onSelect?: (event?: MouseEvent) => void
  onToggleCleartext?: (event?: MouseEvent) => void
  onToggleGenerator?: (event?: MouseEvent) => void
  onToggleLowerCase?: (event?: MouseEvent) => void
  onToggleNumbers?: (event?: MouseEvent) => void
  onToggleSymbols?: (event?: MouseEvent) => void
  onToggleUpperCase?: (event?: MouseEvent) => void
}

export function PasswordGenerator ({
  locale,
  cleartext,
  length,
  lowercase,
  numbers,
  open,
  original,
  pending,
  symbols,
  uppercase,
  value = '',
  onBlurInput,
  onClickMinus,
  onClickPlus,
  onCopied,
  onDefaultActionButtonRef,
  onInput,
  onRefresh,
  onSelect,
  onToggleCleartext,
  onToggleGenerator,
  onToggleLowerCase,
  onToggleNumbers,
  onToggleSymbols,
  onToggleUpperCase,
  ...attrs
}: PasswordGeneratorProps) {
  const t = l10ns[locale]
  return (
    <Fragment>
      <InfoModal
        id='password-generator-modal'
        expanded={open}
        title={t('Password generator')}
        cancel={t('Cancel')}
        confirm={t(original ? 'Replace' : 'Select')}
        pending={pending}
        onConfirm={onSelect}
        onCancel={onToggleGenerator}
        onDefaultActionButtonRef={onDefaultActionButtonRef}
        locale={locale}
      >
        {!original ? null : (
          <Fragment>
            <Label htmlFor='password-generator_current-password'>
              {t('Current password')}:
            </Label>
            <RecordField
              id='password-generator_current-password'
              locale={locale}
              type={cleartext ? 'text' : 'password'}
              className='mb-2'
              icon={cleartext ? 'eye-slash' : 'eye'}
              buttonTitle={t('Show the password')}
              value={cleartext ? original : '*****'}
              onIconClick={onToggleCleartext}
              disabled
            >
              <InputGroupAppend>
                <CopyButton
                  id='password-generator_current-password_copy-btn'
                  value={original}
                  color='info'
                  outline
                  fw
                  disabled={pending}
                  data-id='current-password'
                  onCopied={onCopied}
                />
              </InputGroupAppend>
            </RecordField>
            <Label htmlFor='password-generator_new-password'>
              {t('New password')}:
            </Label>
          </Fragment>
        )}
        <InputGroup className='mb-2'>
          <InputGroupPrepend>
            <FAIconButton
              icon='sync-alt'
              color='info'
              outline
              pending={pending}
              fw
              onClick={onRefresh}
            />
          </InputGroupPrepend>
          <Input
            type='text'
            id='password-generator_new-password'
            value={value}
            readOnly
            autoCorrect='off'
            autoComplete='off'
            className='form-control border-info bg-white font-weight-bold'
          />
          <InputGroupAppend>
            <CopyButton
              id='password-generator_new-password_copy-btn'
              value={value}
              color='info'
              outline
              fw
              disabled={pending}
              data-id='new-password'
              onCopied={onCopied}
            />
          </InputGroupAppend>
        </InputGroup>
        <hr />
        <FormGroup className='form-inline mb-2'>
          <QuantityInput
            value={length}
            className='w-auto'
            onClickMinus={onClickMinus}
            onClickPlus={onClickPlus}
            onInput={onInput}
            onBlurInput={onBlurInput}
          />
          <Label className='pl-2'>{t('Characters')}</Label>
        </FormGroup>
        <Row>
          <Col>
            <Checkbox
              label='a-z'
              checked={lowercase}
              className='mb-2'
              onClick={onToggleLowerCase}
            />
            <Checkbox label='0-9' checked={numbers} onClick={onToggleNumbers} />
          </Col>
          <Col>
            <Checkbox
              label='A-Z'
              checked={uppercase}
              className='mb-2'
              onClick={onToggleUpperCase}
            />
            <Checkbox
              label='#$%&'
              checked={symbols}
              onClick={onToggleSymbols}
            />
          </Col>
        </Row>
      </InfoModal>
      <FAIconButton onClick={onToggleGenerator} pending={open} {...attrs} />
    </Fragment>
  )
}
