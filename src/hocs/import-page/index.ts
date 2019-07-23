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
  CsvRecord,
  HoistedImportPageHocProps,
  ImportPageFsm,
  ImportPageHocProps,
  RecordSelectorEntry
} from './reducer'
import {
  importRecordsOnImport,
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
import { createActionDispatchers } from 'basic-fsa-factories'
import { callHandlerOnEvent, shallowEqual } from 'utils'
import { distinctUntilChanged } from 'rxjs/operators'
const log = logger('import-page')

export type ImportPageProps<P extends ImportPageSFCProps> = ImportPageHocProps &
  Rest<P, ImportPageSFCProps>

export interface ImportPageSFCProps extends ImportPageSFCHandlerProps {
  // locale: string
  alert?: boolean
  configs?: string[]
  entries?: RecordSelectorEntry[]
  index?: number // one-based index of selected record currently being imported
  offline?: any
  max?: number
  pending?: boolean
  selected?: number
}

export interface ImportPageSFCHandlerProps {
  onAddStorage?: (event?: MouseEvent) => void
  onClose?: (event?: MouseEvent) => void
  onCloseInfo?: (event?: MouseEvent) => void
  onImport?: (event?: MouseEvent) => void
  onSelectFile?: (event?: Event) => void
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
  entries?: RecordSelectorEntry[] // CsvRecord[]
  error?: any
  index?: number // zero-based index of selected record currently being imported
  max?: number
  selected?: CsvRecord[]
  session?: string
  state: ImportPageFsm
  onClose?: (event?: MouseEvent) => void
  onError?: (error?: any) => void
  onAddStorage?: (event?: MouseEvent) => void
}

const ALERT_STATES = [
  ImportPageFsm.InsufficienStorage,
  ImportPageFsm.NoStorage,
  ImportPageFsm.Offline,
  ImportPageFsm.Pending,
  ImportPageFsm.ImportRecords
]

function mapStateToProps ({
  attrs,
  entries,
  error,
  index,
  max,
  selected,
  state
}: ImportPageState): Rest<ImportPageSFCProps, ImportPageSFCHandlerProps> {
  const isSelectFileState = state === ImportPageFsm.SelectFile
  const pending = state === ImportPageFsm.Pending
  const importing = state === ImportPageFsm.ImportRecords
  const alert = ALERT_STATES.indexOf(state) >= 0
  return {
    ...attrs,
    alert,
    configs: isSelectFileState && CONFIG_KEYS,
    offline: state === ImportPageFsm.Offline,
    entries,
    index: importing ? index + 1 : void 0,
    max,
    pending,
    selected: importing ? selected.length : void 0
  }
}

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => ImportPageSFCHandlerProps = createActionDispatchers({
  onAddStorage: 'ADD_STORAGE',
  onClose: 'CLOSE',
  onCloseInfo: 'CLOSE_INFO',
  onError: 'ERROR',
  onImport: 'IMPORT',
  onSelectFile: [
    'SELECT_FILE',
    ({ currentTarget: { files, dataset } }) => ({
      file: files.length ? files[0] : void 0,
      key: CONFIG_KEYS[dataset.index]
    })
  ],
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
      importRecordsOnImport,
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
