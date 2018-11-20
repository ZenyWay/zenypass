/** @jsx createElement */

import { createElement } from 'create-element'
import { storiesOf } from '@storybook/react'
import { LangDropdown } from 'components'
import { action } from '@storybook/addon-actions'

const attrs = {
  locale: 'fr',
  onSelectItem: action('SELECT_ITEM')
}

storiesOf('LangDropdown (SFC)', module)
  .add('default', () => (
    <LangDropdown {...attrs} />
  ))
