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
import { Input, InputGroup, InputGroupAppend } from 'bootstrap'
import { Checkbox } from './checkbox'
import { FAIconButton } from './fa-icon'
import { IconLabelInputGroup } from './icon-label-input-group'
import { classes } from 'utils'
import { style } from 'typestyle'

export interface CsvRecordItemProps {
  id: string
  record: Partial<CsvRecord>
  selected?: boolean
  details?: boolean
  className?: string
  onToggleSelect?: (event?: MouseEvent) => void
  onToggleDetails?: (event?: MouseEvent) => void
}

export interface CsvRecord {
  name: string
  url: string
  username: string
  password: string
  comments: string
}

export function CsvRecordItem ({
  id,
  record: { name, url, username, password, comments },
  selected,
  details,
  onToggleSelect,
  onToggleDetails,
  ...attrs
}: CsvRecordItemProps) {
  return (
    <article {...attrs}>
      <Checkbox id={id} checked={selected} onClick={onToggleSelect}>
        <FormControlPlaintext className='text-truncate'>
          {name}
        </FormControlPlaintext>
        <FormControlPlaintext className='text-truncate'>
          {username}
        </FormControlPlaintext>
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
        <div class='pb-3 px-sm-2'>
          <InputGroup id={`${id}_name-field`} className='pt-2'>
            <FormControlPlaintext overflow='hidden'>
              {name}
            </FormControlPlaintext>
          </InputGroup>
          <IconLabelInputGroup
            id={`${id}_url-field`}
            className='pt-2'
            color='info'
            icon='bookmark'
          >
            <FormControlPlaintext overflow='hidden'>{url}</FormControlPlaintext>
          </IconLabelInputGroup>
          <IconLabelInputGroup
            id={`${id}_username-field`}
            className='pt-2'
            color='info'
            icon='user'
          >
            <FormControlPlaintext overflow='hidden'>
              {username}
            </FormControlPlaintext>
          </IconLabelInputGroup>
          <IconLabelInputGroup
            id={`${id}_password-field`}
            className='pt-2'
            color='info'
            icon='key'
          >
            <FormControlPlaintext overflow='hidden'>
              {password}
            </FormControlPlaintext>
          </IconLabelInputGroup>
          <IconLabelInputGroup
            id={`${id}_comments-field`}
            className='pt-2'
            color='info'
            icon='sticky-note'
          >
            <Input
              type='textarea'
              value={comments}
              className='form-control form-control-plaintext border bg-light pl-2'
              disabled
            />
          </IconLabelInputGroup>
        </div>
      )}
    </article>
  )
}

interface FormControlPlaintextProps {
  overflow?: 'auto' | 'hidden'
  className?: string
}

function FormControlPlaintext ({
  overflow,
  className,
  ...attrs
}: FormControlPlaintextProps) {
  return (
    <span
      className={classes(
        'form-control form-control-plaintext border bg-light px-2',
        overflow && `overflow-${overflow}`,
        className
      )}
      {...attrs}
    />
  )
}
