/** @jsx createElement */

import { createElement } from 'create-element'
import { storiesOf } from '@storybook/react'
import { AuthenticationPage } from 'components'
import { action } from '@storybook/addon-actions'
import preventDefaultAction from './helpers/prevent-default'
import { LANG_MENU } from './helpers/consts'

const locales = LANG_MENU.slice()
delete locales[0].label // remove label of dropdown toggle

const attrs = {
  locale: 'fr',
  locales: LANG_MENU,
  onChange: action('CHANGE'),
  onSelectItem: action('SELECT_ITEM'),
  onSubmit: preventDefaultAction('SUBMIT'),
  onToggleFocus: action('TOGGLE_FOCUS'),
  onTogglePage: action('TOGGLE_PAGE')
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

storiesOf('AuthenticationPage (SFC)', module)
  .add('signup', () => (
    <AuthenticationPage
      signup
      {...attrs}
    />
  ))
  .add('signin', () => (
    <AuthenticationPage
      email={emails[0].label}
      emails={emails.slice(1)}
      {...attrs}
    />
  ))
