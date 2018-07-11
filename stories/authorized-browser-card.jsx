/**
 * Clément Bonet
 */
//
/** @jsx createElement */
import { createElement } from 'create-element'
import { storiesOf } from '@storybook/react'
import { AuthorizedBrowserCard } from 'components'
import Wrapper from './helpers/card-wrapper'

storiesOf('AuthorizedBrowserCard', module)
  .add('fiche', () => (
    <Wrapper>
      <AuthorizedBrowserCard browser='OPERA' date='Mardi 10 Juillet 2018' />
    </Wrapper>
  ))
