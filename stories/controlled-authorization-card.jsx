/**
 * Clément Bonet
 */
//
/** @jsx createElement */
import { createElement } from 'create-element'
import { storiesOf } from '@storybook/react'
import { ControlledAuthorizationCard } from 'components'
import Wrapper from './helpers/card-wrapper'
import preventDefaultAction from './helpers/prevent-default'

const attrs = {
  onSubmit: preventDefaultAction('CLICKED')
}

storiesOf('ControlledAuthorizationCard', module)
  .add('default', () => (
    <Wrapper>
      <ControlledAuthorizationCard {...attrs} />
    </Wrapper>
  ))
