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
import { createElement } from 'create-element'
import { Button, Card, CardHeader, CardBody, CardFooter } from 'bootstrap'
import { IconButton } from '../icon'
import { IconLabelInputFormGroup } from '../icon-label-form-group'
import { classes } from 'utils'
import { Record, RecordCardBody } from './card-body'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export { Record }

export interface RecordCardProps {
  locale: string,
  record: Record
  expanded?: boolean
  disabled?: boolean
  pending?: 'cleartext' | 'edit' | 'save' | 'delete'
  cleartext?: boolean
  error?: string
  className?: string
  onConnectRequest?: (event: MouseEvent) => void
  onToggleExpand?: (event: MouseEvent) => void
  onToggleCleartext?: (event: MouseEvent) => void
  onEditRecordRequest?: (event: MouseEvent) => void
  onChange?: (field: keyof Record, value: string[] | string) => void
  onUpdateRecordRequest?: (event: MouseEvent) => void
  onDeleteRecordRequest?: (event: MouseEvent) => void
  [prop: string]: unknown
}

export function RecordCard ({
  locale,
  record,
  expanded,
  disabled,
  pending,
  cleartext,
  error,
  className,
  onConnectRequest,
  onToggleExpand,
  onToggleCleartext,
  onEditRecordRequest,
  onChange,
  onUpdateRecordRequest,
  onDeleteRecordRequest,
  ...attrs
}: RecordCardProps) {
  const { _id, name, url, username } = record
  return (
    <Card
      className={classes('col-12 col-md-6 col-xl-4 mb-2 px-0', className)}
      {...attrs}
    >
      <CardHeader className='border-0 bg-white pb-0'>
        {
          !disabled ? null : (
            <Button
              id={`collapsed-record-card:${_id}:name`}
              href={url}
              target='_blank'
              size='lg'
              color='light'
              disabled={!url}
            >
              {name}
            </Button>
          )
        }
      </CardHeader>
      <CardBody className='py-2'>
        {
          expanded
          ? (
            <RecordCardBody
              locale={locale}
              record={record}
              disabled={disabled}
              cleartext={cleartext}
              pending={pending}
              onChange={onChange}
              onConnectRequest={onConnectRequest}
              onToggleCleartext={onToggleCleartext}
            />
          )
          : (
            <IconLabelInputFormGroup
              id={`collapsed-record-card:${_id}:username`}
              value={username}
              icon='fa-user'
              plaintext
              className='mb-0'
            />
          )
        }
      </CardBody>
      <CardFooter className='border-0 bg-white pt-0'>
        {
          !expanded
          ? (
            CollapsedCardFooter({ // TODO replace with JSX when inferno@6
              _id,
              pending: false, // TODO
              onConnectRequest
            }) as any
          )
          : (
            ExpandedCardFooter({ // TODO replace with JSX when inferno@6
              locale,
              _id,
              disabled,
              pending,
              onEditRecordRequest,
              onUpdateRecordRequest,
              onDeleteRecordRequest
            }) as any
          )
        }
        <IconButton
          id={`collapsed-record-card:${_id}:toggle-expand`}
          icon={!expanded ? 'fa-caret-down' : disabled ? 'fa-caret-up' : 'fa-close'}
          className='close'
          onClick={onToggleExpand}
        />
      </CardFooter>
    </Card>
  )
}

interface CollapsedCardFooterProps {
  _id: string
  pending?: boolean
  onConnectRequest?: (event: MouseEvent) => void
}

function CollapsedCardFooter ({
  _id,
  pending, // TODO
  onConnectRequest
}: CollapsedCardFooterProps) {
  return [ // TODO replace with Fragment when inferno@6
    <span className='py-2 pr-2'><i className='fa fa-fw fa-lock'></i></span>,
    <IconButton
      id={`collapsed-record-card:${_id}:connect`}
      icon={pending ? 'fa-spinner fa-spin' : 'fa-external-link fa-fw'}
      outline
      onClick={onConnectRequest}
    />
  ]
}

interface ExpandedCardFooterProps {
  locale: string,
  _id: string
  disabled: boolean
  pending?: 'edit' | 'save' | 'delete' | unknown
  onEditRecordRequest?: (event: MouseEvent) => void
  onCancelEditRecord?: (event: MouseEvent) => void
  onUpdateRecordRequest?: (event: MouseEvent) => void
  onDeleteRecordRequest?: (event: MouseEvent) => void
}

function ExpandedCardFooter ({
  locale,
  _id,
  disabled,
  pending,
  onEditRecordRequest,
  onUpdateRecordRequest,
  onDeleteRecordRequest
}: ExpandedCardFooterProps) {
  const t = l10ns[locale]
  const edit = !disabled || (pending === 'save') || (pending === 'delete')
  return !edit
  ? [
    <IconButton
      id={`expanded-record-card:${_id}:edit`}
      icon={'fa-edit'}
      outline
      className='border-secondary'
      onClick={onEditRecordRequest}
    >
      &nbsp;{t('Edit')}
    </IconButton>
  ]
  : [
    <IconButton
      id={`expanded-record-card:${_id}:save`}
      icon={'fa-download'}
      outline
      className='border-secondary mr-2'
      onClick={onUpdateRecordRequest}
    >
      &nbsp;{t('Save')}
    </IconButton>,
    <IconButton
      id={`expanded-record-card:${_id}:delete`}
      icon={'fa-trash'}
      outline
      color='danger'
      className='border-secondary'
      onClick={onDeleteRecordRequest}
    />
  ]
}
