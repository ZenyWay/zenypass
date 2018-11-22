/** @jsx createElement */

import { createElement } from 'create-element'
import { storiesOf } from '@storybook/react'
import { SigninPage } from 'components'
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

const emails = [ 'jane.doe@example.com', 'rob@hvsc.org' ]
  .map(email => ({
    'data-id': `email/${email}`,
    icon: 'fa fa-user',
    label: email
  }))
  .concat({
    'data-id': 'email',
    icon: 'fa fa-plus',
    label: 'Enter another email'
  })

storiesOf('SigninPage', module)
  .add('default', () => (
    <SigninPage
      emails={emails.slice(1)} // TODO remove
      {...attrs}
    />
  ))
