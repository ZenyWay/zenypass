/**
 * Copyright 2018 ZenyWay S.A.S., Stephane M. Catala
 * @author Stephane M. Catala
 * @author Clement Bonet
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
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  InputGroup,
  Label
} from 'bootstrap'
import { FAIconButton, FAIcon } from '../fa-icon'
import { InfoModal } from '../info-modal'
import { ConnectionModal } from '../../connection-modal'
import { Errors, Record, RecordCardBody } from './card-body'
import { classes } from 'utils'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export { Record, Errors }

export interface RecordCardProps {
  locale: string
  record: Record
  expanded?: boolean
  edit?: boolean
  connect?: boolean
  pending?: PendingState
  cleartext?: boolean
  errors?: Partial<Errors>
  className?: string
  onClearClipboard?: (event?: MouseEvent) => void
  onConnectRequest?: (event?: MouseEvent) => void
  onConnectClose?: (dirty?: boolean) => void
  onCopied?: (success: boolean, target?: HTMLElement) => void
  onDefaultActionButtonRef?: (element: HTMLElement) => void
  onToggleCleartext?: (event: MouseEvent) => void
  onToggleExpanded?: (event: MouseEvent) => void
  onEditRecordRequest?: (event: MouseEvent) => void
  onChange?: (value: string[] | string, target?: HTMLElement) => void
  onToggleCheckbox?: (event?: Event) => void
  onSaveRecordRequest?: (event: MouseEvent) => void
  onDeleteRecordRequest?: (event: MouseEvent) => void
}

export type PendingState =
  | 'cleartext'
  | 'confirm-cancel'
  | 'confirm-delete'
  | 'edit'
  | 'save'
  | 'delete'
  | 'connect'
  | 'clear-clipboard'

export function RecordCard ({
  locale,
  record,
  expanded,
  edit,
  connect,
  pending,
  cleartext: _cleartext,
  errors,
  className,
  onClearClipboard,
  onConnectRequest,
  onConnectClose,
  onCopied,
  onDefaultActionButtonRef,
  onToggleCleartext,
  onToggleExpanded,
  onEditRecordRequest,
  onChange,
  onToggleCheckbox,
  onSaveRecordRequest,
  onDeleteRecordRequest,
  ...attrs
}: RecordCardProps) {
  const t = l10ns[locale]
  const { _id, name, url, username, password } = record
  const hasConnectionButton = password !== '' || !!(url && username)
  const cleartext = _cleartext || password === ''
  const confirmCancel = pending === 'confirm-cancel'
  return (
    <Card
      className={classes('col-12 col-md-6 col-xl-4 mt-1 px-0', className)}
      {...attrs}
    >
      <CardHeader className='border-0 bg-white pb-0'>
        {edit ? null : (
          <Button
            id={`collapsed-record-card:${_id}:name`}
            href={url}
            target='_blank'
            rel='noopener noreferer'
            size='lg'
            color='light'
            disabled={!url}
            className='text-truncate mw-100'
          >
            {name}
          </Button>
        )}
      </CardHeader>
      <CardBody className='py-2'>
        {expanded ? (
          <RecordCardBody
            locale={locale}
            record={record}
            id={_id}
            edit={edit}
            cleartext={cleartext}
            pending={pending}
            errors={errors}
            onChange={onChange}
            onCopied={onCopied}
            onToggleCheckbox={onToggleCheckbox}
            onConnectRequest={onConnectRequest}
            onToggleCleartext={onToggleCleartext}
            onSubmit={onSaveRecordRequest}
          />
        ) : (
          <InputGroup
            id={`collapsed-record-card:${_id}:username`}
            className={classes(!username && 'invisible')}
          >
            <Label className='ml-1'>
              <FAIcon icon='user' />
            </Label>
            <span className='form-control form-control-plaintext text-truncate'>
              {username}
            </span>
          </InputGroup>
        )}
      </CardBody>
      <CardFooter className='border-0 bg-white pt-0'>
        {!expanded ? (
          <CollapsedCardFooter
            _id={_id}
            hasConnectionButton={hasConnectionButton}
            unrestricted={record.unrestricted}
            pending={pending === 'connect'}
            onConnectRequest={onConnectRequest}
          />
        ) : (
          <ExpandedCardFooter
            locale={locale}
            _id={_id}
            disabled={!edit}
            unlimited={!errors}
            pending={pending}
            onEditRecordRequest={onEditRecordRequest}
            onDeleteRecordRequest={onDeleteRecordRequest}
          />
        )}
        <FAIconButton
          id={`collapsed-record-card:${_id}:toggle-expand`}
          icon={!expanded ? 'caret-down' : edit ? 'close' : 'caret-up'}
          className={classes(
            'close',
            ((errors && errors.name) || !!pending) && 'invisible'
          )}
          onClick={onToggleExpanded}
        />
      </CardFooter>
      <InfoModal
        expanded={pending === 'clear-clipboard'}
        title={t('Security advice')}
        cancel={t('Close')}
        onCancel={onClearClipboard}
        onDefaultActionButtonRef={onDefaultActionButtonRef}
        locale={locale}
      >
        <p>
          {t(
            'After pasting your password, close this window to clear the clipboard'
          )}
          .
        </p>
      </InfoModal>
      <InfoModal
        expanded={confirmCancel || pending === 'confirm-delete'}
        title={t('Please confirm')}
        confirm={t(confirmCancel ? 'Yes: cancel' : 'Yes: delete')}
        onConfirm={confirmCancel ? onToggleExpanded : onDeleteRecordRequest}
        onCancel={onEditRecordRequest}
        locale={locale}
      >
        <p>
          {t(
            confirmCancel
              ? 'Do you want to cancel your changes'
              : 'Do you want to delete this website card'
          )}{' '}
          ?
        </p>
      </InfoModal>
      {!hasConnectionButton ? null : (
        <ConnectionModal
          open={connect}
          onClose={onConnectClose}
          name={record.name}
          url={record.url}
          username={record.username}
          password={record.password}
          locale={locale}
        />
      )}
    </Card>
  )
}

interface CollapsedCardFooterProps {
  _id: string
  hasConnectionButton?: boolean
  unrestricted?: boolean
  pending?: boolean
  onConnectRequest?: (event?: MouseEvent) => void
}

function CollapsedCardFooter ({
  _id,
  hasConnectionButton,
  unrestricted,
  pending,
  onConnectRequest
}: CollapsedCardFooterProps) {
  return (
    <Fragment>
      <span className={classes('py-2 pr-2', unrestricted && 'invisible')}>
        <FAIcon icon='lock' fw />
      </span>
      <FAIconButton
        id={`collapsed-record-card:${_id}:connect`}
        icon='external-link'
        pending={pending}
        outline
        onClick={onConnectRequest}
        className={!hasConnectionButton && 'invisible'}
      />
    </Fragment>
  )
}

interface ExpandedCardFooterProps {
  locale: string
  _id: string
  disabled: boolean
  unlimited?: boolean
  pending?: 'edit' | 'save' | 'delete' | unknown
  onEditRecordRequest?: (event: MouseEvent) => void
  onDeleteRecordRequest?: (event: MouseEvent) => void
}

function ExpandedCardFooter ({
  locale,
  _id,
  disabled,
  unlimited,
  pending,
  onEditRecordRequest,
  onDeleteRecordRequest
}: ExpandedCardFooterProps) {
  const t = l10ns[locale]
  return disabled && !(pending === 'save') && !(pending === 'delete') ? (
    <FAIconButton
      id={`expanded-record-card:${_id}:edit`}
      icon='edit'
      pending={!!pending}
      outline
      className='border-secondary'
      onClick={onEditRecordRequest}
    >
      &nbsp;{t('Edit')}
    </FAIconButton>
  ) : (
    <Fragment>
      {!unlimited ? null : (
        <FAIconButton
          type='submit'
          form={_id}
          id={`expanded-record-card:${_id}:save`}
          icon='download'
          pending={!!pending}
          outline
          className='border-secondary mr-2'
        >
          &nbsp;{t('Save')}
        </FAIconButton>
      )}
      <FAIconButton
        id={`expanded-record-card:${_id}:delete`}
        icon='trash'
        pending={!!pending}
        outline
        color='danger'
        className='border-secondary'
        onClick={onDeleteRecordRequest}
      />
    </Fragment>
  )
}
