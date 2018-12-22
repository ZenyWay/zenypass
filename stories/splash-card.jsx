/** @jsx createElement */

import { createElement } from 'create-element'
import { storiesOf } from '@storybook/react'
import { SplashCard } from 'components'
import { CardBody } from 'bootstrap'
// import { action } from '@storybook/addon-actions'

const attrs = {}

storiesOf('SplashCard (SFC)', module)
  .add('default', () => (
    <SplashCard {...attrs} >
      <CardBody>
        <p>some content here...</p>
      </CardBody>
    </SplashCard>
  ))
