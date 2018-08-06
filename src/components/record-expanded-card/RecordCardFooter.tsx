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
import { CardFooter } from 'reactstrap'
import createL10n from 'basic-l10n'
import { Button } from '..'

const debug = (process.env.NODE_ENV !== 'production') && require('debug')('zenypass:components:access-browser:')
const l10n = createL10n(require('./locales.json'), { debug, locale: 'fr' })

export interface RecordExpandedCardProps {
  attrs: any,
  edit?: boolean,
  locale: string,
  onCancelEdit: () => void,
  onDelete: () => void,
  onEdit: () => void,
  onSave: () => void,
  onToggleRequest: () => void,
  pendingEdit?: boolean,
  pendingSave?: boolean,
  pendingTrash?: boolean,
  pendingToggle?: boolean
}

export default function ({
  edit,
  locale,
  onCancelEdit,
  onDelete,
  onEdit,
  onSave,
  onToggleRequest,
  pendingEdit,
  pendingSave,
  pendingToggle,
  pendingTrash,
  ...attrs
}: Partial<RecordExpandedCardProps>) {

  l10n.locale = locale || l10n.locale

  return (
    <CardFooter className='border-0 bg-white mx-2 d-flex justify-content-between'>
      { !edit && !(pendingSave || pendingTrash) ?
        <Button
          color='light'
          icon={pendingEdit ? 'fa-spin fa-spinner' : 'fa-edit fa-fw'}
          className='border-secondary'
          title={l10n('Edit this record')}
          onClick={onEdit}
        >
          {l10n('Edit')}
        </Button>
        :
        <div>
          <Button
            color='light'
            icon={pendingSave ? 'fa-spin fa-spinner' : 'fa-download fa-fw'}
            className='border-secondary mx-1'
            title={l10n('Save this record')}
            onClick={onSave}
            disabled={pendingSave}
          >
            {l10n('Save')}
          </Button>
          <Button
            color='danger'
            icon={pendingTrash ? 'fa-spin fa-spinner' : 'fa-trash fa-fw'}
            className='border-danger mr-1'
            title={l10n('Delete this record')}
            onClick={onDelete}
            disabled={pendingTrash}
          >
          </Button>
          <Button
            color='light'
            icon='fa-times'
            className='border-secondary'
            title={l10n('Cancel the modifications')}
            onClick={onCancelEdit}
          >
          </Button>
        </div>
      }
      <Button
        icon={pendingToggle ? 'fa-spin fa-spinner' : 'fa-caret-up'}
        className='close'
        onClick={onToggleRequest}
        title={l10n(edit ? l10n('Minimize and save this record') : l10n('Minimize this record'))}
      >
      </Button>
    </CardFooter>
  )
}
