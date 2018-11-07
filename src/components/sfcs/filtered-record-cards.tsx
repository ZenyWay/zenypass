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
import { Button, InputGroupAppend } from 'bootstrap'
import { FAIcon } from './fa-icon'
import { IconLabelInputGroup } from './icon-label-input-group'
import { AutoformatInput } from '../autoformat-input'
import { RecordCard, Record } from '../record-card'
import { classes } from 'utils'
import { Observer } from 'component-from-props'

export { Record }

export interface FilteredRecordCardsProps extends RecordCardsProps {
  tokens?: string[]
  debounce?: string | number
  onTokensChange?: (tokens: string[]) => void
  onTokensClear?: (event: MouseEvent) => void
  onSearchFieldRef?: (ref: HTMLElement) => void
}

export function FilteredRecordCards ({
  filter,
  tokens,
  debounce,
  onTokensChange,
  onTokensClear,
  onSearchFieldRef,
  ...attrs
}: FilteredRecordCardsProps) {
  // TODO replace <div> with <Fragment>
  return (
    <div>
      {
        !filter
        ? null
        : (
          <SearchField
            innerRef={onSearchFieldRef}
            className='col-12 col-md-6 col-xl-4 mt-1 px-0'
            tokens={tokens}
            debounce={debounce}
            onChange={onTokensChange}
            onClear={onTokensClear}
          />
        )
      }
      <RecordCards {...attrs} filter={filter || []} />
    </div>
  )
}

interface SearchFieldProps {
  tokens?: string[]
  debounce?: string | number
  className?: string
  onChange?: (tokens: string[]) => void
  onClear?: (event: MouseEvent) => void
  innerRef?: (ref: HTMLElement) => void
}

function SearchField ({
  tokens,
  debounce,
  onChange,
  onClear,
  innerRef,
  ...attrs
}: SearchFieldProps) {
  return (
    <IconLabelInputGroup
      icon='search'
      {...attrs}
    >
      <AutoformatInput
        innerRef={innerRef}
        type='csv'
        className='form-control'
        value={tokens}
        debounce={debounce}
        onChange={onChange}
      />
      <InputGroupAppend>
        <Button outline onClick={onClear}>
          <FAIcon icon='times' />
        </Button>
      </InputGroupAppend>
    </IconLabelInputGroup>
  )
}

export interface RecordCardsProps {
  locale: string
  session: string
  records: Record[]
  filter: boolean[]
  className?: string
  onAuthenticationRequest?: (res$: Observer<string>) => void
  [prop: string]: unknown
}

export function RecordCards ({
  locale,
  session,
  records,
  filter,
  hidden,
  className,
  onAuthenticationRequest,
  ...attrs
}: RecordCardsProps) {
  let i = records.length
  const cards = new Array<JSX.Element>(i)
  const classNames = classes(
    'pl-0',
    className
  )
  while (i--) {
    const record = records[i]
    cards[i] = (
      <RecordCard
        key={record._id}
        className={filter[i] ? 'd-none' : ''}
        locale={locale}
        session={session}
        record={records[i]}
        onAuthenticationRequest={onAuthenticationRequest}
      />
    )
  }
  return <ul {...attrs} className={classNames} >{cards}</ul>
}
