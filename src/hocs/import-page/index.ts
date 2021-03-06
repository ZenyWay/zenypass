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

import reducer, {
  l10ns,
  HoistedImportPageHocProps,
  ImportPageFsm,
  ImportPageHocProps,
  RecordSelectorEntry
} from './reducer'
import {
  importRecordsOnImportRecords,
  readCsvFileOnSelectFile,
  CONFIG_KEYS
} from './effects'
import {
  injectServiceOnSessionProp,
  injectStorageStatusOnService
} from '../storage-page/effects'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  logger,
  redux
} from 'component-from-events'
import {
  createActionDispatchers,
  createActionFactories
} from 'basic-fsa-factories'
import { callHandlerOnEvent, focus, shallowEqual, tapOnEvent } from 'utils'
import { distinctUntilChanged } from 'rxjs/operators'
import { Observer } from 'rxjs'
const log = logger('import-page')

export type ImportPageProps<P extends ImportPageSFCProps> = ImportPageHocProps &
  Rest<P, ImportPageSFCProps>

export interface ImportPageSFCProps extends ImportPageSFCHandlerProps {
  locale: string
  alert?: Alert
  comments?: string
  configs?: string[]
  entries?: RecordSelectorEntry[]
  /**
   * zero-based index of selected record currently being imported
   */
  index?: number
  keywords?: string[]
  max?: number
  selected?: number
}

export type Alert = 'edit' | 'import' | 'offline' | 'pending' | 'storage'

export interface ImportPageSFCHandlerProps {
  onAddStorage?: (event?: MouseEvent) => void
  onChange?: (value: string[] | string, target?: HTMLElement) => void
  onClose?: (event?: MouseEvent) => void
  onCloseInfo?: (event?: MouseEvent) => void
  onDefaultActionButtonRef?: (element?: HTMLElement) => void
  onDeselectAll?: (event?: MouseEvent) => void
  onSelectAll?: (event?: MouseEvent) => void
  onSelectFile?: (event?: Event) => void
  onSubmit?: (event?: MouseEvent) => void
  onToggleSelect?: (id?: string) => void
}

interface ImportPageState extends HoistedImportPageHocProps {
  attrs: Pick<
    ImportPageProps<ImportPageSFCProps>,
    Exclude<
      keyof ImportPageProps<ImportPageSFCProps>,
      keyof HoistedImportPageHocProps
    >
  >
  locale: string
  comments?: string
  entries?: RecordSelectorEntry[]
  error?: any
  filename?: string
  /**
   * zero-based index of selected record currently being imported
   */
  index?: number
  keywords?: string[]
  max?: number
  selected?: number
  session?: string
  state: ImportPageFsm
  onAuthenticationRequest?: (res$: Observer<string>) => void
  onClose?: (event?: MouseEvent) => void
  onError?: (error?: any) => void
  onAddStorage?: (event?: MouseEvent) => void
}

const STATE_TO_ALERT: Partial<{ [state in ImportPageFsm]: Alert }> = {
  [ImportPageFsm.InsufficientStorage]: 'storage',
  [ImportPageFsm.NoStorage]: 'storage',
  [ImportPageFsm.Offline]: 'offline',
  [ImportPageFsm.Pending]: 'pending',
  [ImportPageFsm.EditRecords]: 'edit',
  [ImportPageFsm.ImportRecords]: 'import'
}

const CONFIG_KEYS_L10NS = Object.keys(l10ns).reduce(function (configs, locale) {
  const t = l10ns[locale]
  configs[locale] = CONFIG_KEYS.map(t)
  return configs
}, Object.create(null))

function mapStateToProps ({
  attrs,
  locale,
  comments,
  entries,
  index,
  keywords,
  max,
  selected,
  state
}: ImportPageState): Rest<ImportPageSFCProps, ImportPageSFCHandlerProps> {
  const isSelectFileState = state === ImportPageFsm.SelectFile
  return {
    ...attrs,
    locale,
    alert: STATE_TO_ALERT[state],
    comments,
    configs: isSelectFileState && CONFIG_KEYS_L10NS[locale],
    entries,
    index,
    keywords,
    max,
    selected
  }
}

const CHANGE_ACTIONS = createActionFactories({
  keywords: 'CHANGE_KEYWORDS',
  comments: 'CHANGE_COMMENTS'
})

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => ImportPageSFCHandlerProps = createActionDispatchers({
  onAddStorage: 'ADD_STORAGE',
  onChange: (value: string[] | string, { dataset: { id } }: HTMLElement) =>
    CHANGE_ACTIONS[id](value),
  onClose: 'CLOSE',
  onCloseInfo: 'CLOSE_INFO',
  onError: 'ERROR',
  onDeselectAll: 'DESELECT_ALL',
  onDefaultActionButtonRef: 'DEFAULT_ACTION_BUTTON_REF',
  onSelectAll: 'SELECT_ALL',
  onSelectFile: [
    'SELECT_FILE',
    ({ currentTarget: { files, dataset } }) => ({
      file: files.length ? files[0] : void 0,
      key: CONFIG_KEYS[dataset.index]
    })
  ],
  onSubmit: 'SUBMIT',
  onToggleSelect: 'TOGGLE_SELECT'
})

export function importPage<P extends ImportPageSFCProps> (
  SigninPageSFC: SFC<P>
): ComponentConstructor<ImportPageProps<P>> {
  return componentFromEvents(
    SigninPageSFC,
    log('event'),
    redux(
      reducer,
      injectServiceOnSessionProp,
      injectStorageStatusOnService,
      readCsvFileOnSelectFile,
      importRecordsOnImportRecords,
      tapOnEvent('DEFAULT_ACTION_BUTTON_REF', focus),
      callHandlerOnEvent('ADD_STORAGE', 'onAddStorage'),
      callHandlerOnEvent('CLOSE', 'onClose'),
      callHandlerOnEvent('ERROR', 'onError'),
      callHandlerOnEvent('IMPORT_COMPLETE', 'onClose')
      /*
      callHandlerOnEvent('IMPORT', 'onImport', ({ entries }) =>
        entries.filter(({ selected }) => selected).map(({ record }) => record)
      )
      */
    ),
    log('state'),
    connect<ImportPageState, ImportPageSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => distinctUntilChanged(shallowEqual),
    log('view-props')
  )
}
