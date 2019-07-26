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
import { Input, InputProps, InputGroupAppend } from 'bootstrap'
import { Checkbox } from './checkbox'
import { FAIconButton } from './fa-icon'
import { IconLabelInputGroup } from './icon-label-input-group'
import { classes } from 'utils'
import { style } from 'typestyle'

export interface CsvRecordItemProps {
  id: string
  record: Partial<CsvRecord>
  className?: string
  cleartext?: boolean
  details?: boolean
  selected?: boolean
  onToggleCleartext?: (event?: MouseEvent) => void
  onToggleDetails?: (event?: MouseEvent) => void
  onToggleSelect?: (event?: MouseEvent) => void
}

export interface CsvRecord {
  name: string
  url: string
  username: string
  password: string
  comments: string
}

const CONCEALED_PASSWORD = '*****'

export function CsvRecordItem ({
  id,
  record: { name, url, username, password, comments },
  cleartext,
  details,
  selected,
  onToggleCleartext,
  onToggleDetails,
  onToggleSelect,
  ...attrs
}: CsvRecordItemProps) {
  return (
    <article {...attrs}>
      <Checkbox
        id={id}
        checked={selected}
        className='bg-white'
        onClick={onToggleSelect}
      >
        <FormControlPlaintext
          value={name}
          overflow={details && 'hidden'}
          className={!details && 'text-truncate border-right-0'}
        />
        {details ? null : (
          <Fragment>
            <FormControlPlaintext
              value={username}
              className='text-truncate border-left-0'
            />
          </Fragment>
        )}
        <InputGroupAppend>
          <FAIconButton
            tag='span'
            icon={details ? 'caret-up' : 'caret-down'}
            iconSize='lg'
            outline
            color='secondary'
            onClick={onToggleDetails}
          />
        </InputGroupAppend>
      </Checkbox>
      {!details ? null : (
        <div class={'pb-2 px-1 px-sm-2'}>
          <IconLabelInputGroup
            id={`${id}_url-field`}
            className='pt-2'
            color='info'
            icon='bookmark'
          >
            <FormControlPlaintext value={url} overflow='hidden' />
          </IconLabelInputGroup>
          <IconLabelInputGroup
            id={`${id}_username-field`}
            className='pt-2'
            color='info'
            icon='user'
          >
            <FormControlPlaintext value={username} overflow='hidden' />
          </IconLabelInputGroup>
          <IconLabelInputGroup
            id={`${id}_password-field`}
            className='pt-2'
            color='info'
            icon={cleartext ? 'eye-slash' : 'eye'}
            onIconClick={onToggleCleartext}
          >
            <FormControlPlaintext
              value={cleartext ? password : CONCEALED_PASSWORD}
              overflow='hidden'
            />
          </IconLabelInputGroup>
          <IconLabelInputGroup
            id={`${id}_comments-field`}
            className='pt-2'
            color='info'
            icon='sticky-note'
          >
            <FormControlPlaintext type='textarea' value={comments} />
          </IconLabelInputGroup>
        </div>
      )}
    </article>
  )
}

interface FormControlPlaintextProps extends InputProps {
  overflow?: 'auto' | 'hidden' | '' | false
  className?: string
}

function FormControlPlaintext ({
  overflow,
  className,
  ...attrs
}: FormControlPlaintextProps) {
  return (
    <Input
      disabled
      className={classes(
        'form-control form-control-plaintext border bg-transparent px-2',
        overflow && `overflow-${overflow}`,
        className
      )}
      {...attrs}
    />
  )
}
