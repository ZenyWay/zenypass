/** @jsx createElement */

import { createElement } from 'create-element'
import { storiesOf } from '@storybook/react'
import { ControlledInput } from 'components'
import { action } from '@storybook/addon-actions'

const attrs = {
  onChange: action('CHANGE')
}

storiesOf('ControlledInput', module)
  .add('default', () => (
    <ControlledInput {...attrs} />
  ))
  .add('blurOnEnterKey', () => (
    <ControlledInput {...attrs} blurOnEnterKey />
  ))
