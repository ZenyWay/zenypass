/** @jsx createElement */

import { createElement } from 'create-element'
import { storiesOf } from '@storybook/react'
import { SigninPage } from 'components'
import { action } from '@storybook/addon-actions'
import preventDefaultAction from './helpers/prevent-default'

const attrs = {
  locale: 'fr',
  onChange: action('CHANGE'),
  onToggleFocus: action('TOGGLE_FOCUS'),
  onSignup: action('SIGNUP'),
  onSelectItem: action('SELECT_ITEM'),
  onSubmit: preventDefaultAction('SUBMIT')
}

const emails = [ 'jane.doe@example.com', 'rob@hvsc.org' ]

storiesOf('SigninPage (SFC)', module)
  .add('default', () => (
    <SigninPage {...attrs} emails={emails} />
  ))
