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
import { Button, Card, CardHeader } from 'bootstrap'
import { ConnectionModal } from '../connection-modal'
import { IconButton } from './icon'
import { IconLabelInputFormGroup } from './icon-label-form-group'
import { classes } from 'utils'

export interface Record {
  id: string
  name: string
  url: string
  username: string
  password?: string
  keywords: string[]
  comments: string
  login: boolean
}

export interface CollapsedRecordCardProps {
  locale: string,
  record: Record,
  pending?: boolean,
  connect?: boolean
  className?: string
  onCancel?: (err?: any) => void
  onConnect?: (event: MouseEvent) => void
  onToggleExpand?: (event: MouseEvent) => void,
}

export function CollapsedRecordCard ({
  locale,
  record,
  pending,
  connect,
  className,
  onConnect,
  onCancel,
  onToggleExpand,
  ...attrs
}: CollapsedRecordCardProps) {
  const { id, name, url, username } = record
  return (
    <Card className={classes('col-12 col-md-6 col-xl-4 mb-2', className)} {...attrs}>
      <CardHeader className='border-0 bg-white'>
        {
          url
          ? (
            <Button
              id={`collapsed-record-card-${id}-name-field`}
              href={url}
              target='_blank'
              size='lg'
              color='light'
              className='mb-2'
            >
              {name}
            </Button>
          )
          : (
            <IconLabelInputFormGroup
              id={`${id}_name`}
              value={name}
              disabled
              locale={locale}
            />
          )
        }
        <IconLabelInputFormGroup
          id={`collapsed-record-card-${id}-username-field`}
          value={username}
          icon='fa-user'
          plaintext
        />
        <span className='py-2 pr-2'><i className='fa fa-fw fa-lock'></i></span>
        <IconButton
          icon={
            pending ? 'fa-spinner fa-spin' : 'fa-external-link fa-fw'
          }
          color='light'
          className='border-secondary'
          onClick={onConnect}
        />
        <IconButton
          icon='fa-caret-down'
          className='close'
          onClick={onToggleExpand}
        />
      </CardHeader>
      <ConnectionModal
        display={connect}
        name={record.name}
        url={record.url}
        username={record.username}
        password={record.password}
        locale={locale}
        onCancel={onCancel}
      />
    </Card>
  )
}
