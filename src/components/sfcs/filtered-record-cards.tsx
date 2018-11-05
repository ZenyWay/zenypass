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
import { Icon } from './icon'
import {
  IconLabelInputGroup
} from './icon-label-input-group'
import { AutoformatInput } from '../autoformat-input'
import { RecordCards, RecordCardsProps } from './record-cards'

export interface FilteredRecordCardsProps extends RecordCardsProps {
  filter: boolean
  tokens?: string[]
  debounce?: string | number
  onTokensChange?: (tokens: string[]) => void
  onTokensClear?: (event: MouseEvent) => void
}

export function FilteredRecordCards ({
  filter,
  tokens,
  debounce,
  onTokensChange,
  onTokensClear,
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
            className='mt-1'
            tokens={tokens}
            debounce={debounce}
            onChange={onTokensChange}
            onClear={onTokensClear}
          />
        )
      }
      <RecordCards {...attrs} />
    </div>
  )
}

interface SearchFieldProps {
  tokens?: string[]
  debounce?: string | number
  className?: string
  onChange?: (tokens: string[]) => void
  onClear?: (event: MouseEvent) => void
}

function SearchField ({
  tokens,
  debounce,
  onChange,
  onClear,
  ...attrs
}: SearchFieldProps) {
  return (
    <IconLabelInputGroup
      icon='fa-search'
      {...attrs}
    >
      <AutoformatInput
        type='csv'
        className='form-control'
        value={tokens}
        debounce={debounce}
        onChange={onChange}
      />
      <InputGroupAppend>
        <Button outline onClick={onClear}>
          <Icon icon='fa-times' />
        </Button>
      </InputGroupAppend>
    </IconLabelInputGroup>
  )
}
