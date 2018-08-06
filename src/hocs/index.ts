/*
 * Copyright 2018 Stephane M. Catala
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
//
import createAutoformat, { AutoformatProps } from './autoformat'
import createControlledInput, { ControlledInputProps } from './controlled-input'
import createAuthenticationModal, { ControlledAuthenticationModalProps } from './controlled-authentication-modal'
import createCopyButton, { CopyButtonProps } from './copy-button'
import createControlledAuthorization, { ControlledAuthorizationProps } from './controlled-authorization'
import createControlledAuthorizationPage, { ControlledAuthorizationPageProps } from './controlled-authorization-page'

export {
  Component,
  ComponentClass,
  SFC
} from 'component-from-events'

export {
  createAutoformat, AutoformatProps,
  createControlledInput, ControlledInputProps,
  createAuthenticationModal, ControlledAuthenticationModalProps,
  createCopyButton, CopyButtonProps,
  createControlledAuthorization, ControlledAuthorizationProps,
  createControlledAuthorizationPage, ControlledAuthorizationPageProps
}
