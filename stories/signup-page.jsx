/** @jsx createElement */

import { createElement } from 'create-element'
import { storiesOf } from '@storybook/react'
import { SignupPage } from 'components'
import { action } from '@storybook/addon-actions'
import { LANG_MENU } from './helpers/consts'

const locales = LANG_MENU.slice()
delete locales[0].label // remove label of dropdown toggle

const attrs = {
  locale: 'fr',
  locales: LANG_MENU,
  onSelectLocale: action('SELECT_LOCALE'),
  onToggleSignup: action('TOGGLE_SIGNUP')
}

storiesOf('SignupPage', module)
  .add('signup', () => (
    <SignupPage signup {...attrs} />
  ))
