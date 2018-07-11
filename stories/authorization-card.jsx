/**
 * Clément Bonet
 */
//
/** @jsx createElement */
import { createElement } from 'create-element'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { AuthorizationCard } from 'components'
import Wrapper from './helpers/card-wrapper'

const attrs = {
  onClick: action('CLICK'),
  token: 'JJJJ JJJJ JJJJ'
}

storiesOf('AuthorizationCard', module)
  .add('state:init', () => (
    <Wrapper>
      <AuthorizationCard {...attrs} init />
    </Wrapper>
  ))
  .add('state:authorizing', () => (
    <Wrapper>
      <AuthorizationCard {...attrs} authorizing />
    </Wrapper>
  ))
  .add('state:auth_request', () => (
    <Wrapper>
      <AuthorizationCard {...attrs} auth_request />
    </Wrapper>
  ))
