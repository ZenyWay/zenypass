/** @jsx createElement */

import { createElement } from 'create-element'
import { storiesOf } from '@storybook/react'
import { SignupPage } from 'components'
import { action } from '@storybook/addon-actions'
import preventDefaultAction from './helpers/prevent-default'
import { LANG_MENU } from './helpers/consts'

const attrs = {
  locale: 'fr',
  locales: LANG_MENU,
  onChange: action('CHANGE'),
  onLogin: action('LOGIN'),
  onSelectItem: action('SELECT_ITEM'),
  onSubmit: preventDefaultAction('SUBMIT')
}

storiesOf('SignupPage (SFC)', module)
  .add('default', () => (
    <SignupPage {...attrs} />
  ))
