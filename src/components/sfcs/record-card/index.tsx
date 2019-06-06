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
import { style } from 'typestyle'
import { Card, CardHeader, CardBody, CardFooter, InputGroup } from 'bootstrap'
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
  onError?: (error?: any) => void
  onToggleCleartext?: (event: MouseEvent) => void
  onToggleExpanded?: (event: MouseEvent) => void
  onEditRecordRequest?: (event: MouseEvent) => void
  onChange?: (value: string[] | string, target?: HTMLElement) => void
  onToggleCheckbox?: (event?: Event) => void
  onSaveRecordRequest?: (event: MouseEvent) => void
  onDeleteRecordRequest?: (event: MouseEvent) => void
}

export type PendingState =
  | 'record'
  | 'cleartext'
  | 'confirm-cancel'
  | 'confirm-delete'
  | 'edit'
  | 'save'
  | 'delete'
  | 'connect'
  | 'clear-clipboard'

const iosClickDelegationWorkaround = style({
  cursor: 'pointer'
})

const shadowOnHover = style({
  transition: 'box-shadow .2s',
  $nest: {
    '&:hover': {
      boxShadow: '0 0.5rem 1rem rgba(0,0,0,.25)!important' // bootstrap4 'shadow' class
    }
  }
})

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
  onError,
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
  const { _id, name, url, username, password, unrestricted } = record
  const hasPassword = password !== ''
  const isBookmarkCard = url && !hasPassword
  const isClickableThumbnail = !expanded && (hasPassword || isBookmarkCard)
  const pendingRecord = pending === 'record'
  const connecting = pending === 'connect'
  const connectingOrPendingRecord = connecting || pendingRecord
  const cleartext = _cleartext || password === ''
  const confirmCancel = pending === 'confirm-cancel'
  return (
    <article
      className={classes('col-12 col-sm-6 col-lg-4 col-xl-3 p-1', className)}
      {...attrs}
    >
      <Card
        className={classes(
          'px-0 shadow-sm',
          shadowOnHover,
          isClickableThumbnail && iosClickDelegationWorkaround
        )}
        onClick={isClickableThumbnail && onConnectRequest}
      >
        {edit ? null : (
          <CardHeader className='border-0 bg-white pb-1 px-3'>
            <InputGroup>
              <span
                className={classes(
                  'form-control form-control-plaintext text-truncate',
                  `text-${url ? 'info' : 'dark'}`
                )}
              >
                <strong>{name}</strong>
              </span>
              {expanded ||
              (!isBookmarkCard && (!hasPassword || unrestricted)) ? null : (
                <FAIconButton
                  color='none'
                  icon={isBookmarkCard ? 'bookmark' : 'lock'}
                  pending={connectingOrPendingRecord}
                  className='disabled'
                />
              )}
            </InputGroup>
          </CardHeader>
        )}
        {!expanded ? null : (
          <CardBody className='py-2 px-3'>
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
              onError={onError}
              onToggleCheckbox={onToggleCheckbox}
              onConnectRequest={onConnectRequest}
              onToggleCleartext={onToggleCleartext}
              onSubmit={onSaveRecordRequest}
            />
          </CardBody>
        )}
        <CardFooter className='border-0 bg-white pt-0 px-3'>
          {!expanded ? (
            <CollapsedCardFooter
              _id={_id}
              username={username}
              pending={pending}
              onToggleExpanded={onToggleExpanded}
            />
          ) : (
            <Fragment>
              <ExpandedCardFooter
                locale={locale}
                _id={_id}
                disabled={!edit}
                unlimited={!errors}
                pending={pending}
                onEditRecordRequest={onEditRecordRequest}
                onDeleteRecordRequest={onDeleteRecordRequest}
              />
              <ToggleButton
                _id={_id}
                expanded
                edit={edit}
                pending={pending}
                onToggleExpanded={onToggleExpanded}
              />
            </Fragment>
          )}
        </CardFooter>
        <InfoModal
          id={`record-card-${_id}-security-advice-modal`}
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
          id={`record-card-${_id}-delete-confirmation-modal`}
          expanded={confirmCancel || pending === 'confirm-delete'}
          title={t('Please confirm')}
          cancel={!confirmCancel && t('Cancel')}
          confirm={!confirmCancel && t('Delete')}
          onConfirm={confirmCancel ? onToggleExpanded : onDeleteRecordRequest}
          onCancel={onEditRecordRequest}
          locale={locale}
        >
          <p>
            {t(
              confirmCancel
                ? 'Do you want to cancel your changes'
                : 'Do you want to delete this card'
            )}{' '}
            ?
          </p>
        </InfoModal>
        {!hasPassword ? null : (
          <ConnectionModal
            open={connect}
            onClose={onConnectClose}
            name={record.name}
            url={record.url}
            username={record.username}
            password={record.password}
            comments={record.comments}
            locale={locale}
          />
        )}
      </Card>
    </article>
  )
}

interface CollapsedCardFooterProps {
  _id: string
  username: string
  pending?: PendingState
  onToggleExpanded?: (event?: MouseEvent) => void
}

function CollapsedCardFooter ({
  _id,
  username,
  pending,
  onToggleExpanded
}: CollapsedCardFooterProps) {
  const invisible = !username && 'invisible'
  return (
    <InputGroup id={`collapsed-record-card:${_id}:username`}>
      <span
        className={classes(
          'form-control form-control-plaintext text-truncate',
          invisible
        )}
      >
        <FAIcon className='text-dark mr-2' icon='user' />
        {username}
      </span>
      <ToggleButton
        _id={_id}
        pending={pending}
        onToggleExpanded={onToggleExpanded}
      />
    </InputGroup>
  )
}

interface ToggleButtonProps {
  _id: string
  expanded?: boolean
  edit?: boolean
  pending?: PendingState
  onToggleExpanded?: (event?: MouseEvent) => void
}

function ToggleButton ({
  _id,
  expanded,
  edit,
  pending,
  onToggleExpanded
}: ToggleButtonProps) {
  const icon = !expanded ? 'caret-down' : edit ? 'times' : 'caret-up'
  const classNames = classes('float-right py-2', !!pending && 'invisible')
  return (
    <FAIconButton
      id={`collapsed-record-card:${_id}:toggle-expand`}
      icon={icon}
      iconSize='lg'
      color='none'
      className={classNames}
      onClick={onToggleExpanded}
    />
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
      pending={pending === 'edit'}
      disabled={!!pending}
      outline
      color={!pending ? 'info' : 'dark'}
      fw
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
          pending={pending === 'save'}
          disabled={!!pending}
          outline
          color={!pending ? 'info' : 'dark'}
          fw
          className='mr-2'
        >
          &nbsp;{t('Save')}
        </FAIconButton>
      )}
      <FAIconButton
        id={`expanded-record-card:${_id}:delete`}
        icon='trash'
        pending={pending === 'delete'}
        disabled={!!pending}
        outline
        color='danger'
        fw
        onClick={onDeleteRecordRequest}
      />
    </Fragment>
  )
}
