/**
 * Copyright 2018 ZenyWay S.A.S., Stephane M. Catala
 * @author Stephane M. Catala
 * @license Apache Version 2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 */
//
/** @jsx createElement */
import { createElement } from 'create-element'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { Button } from 'bootstrap'

const common = {
  className: 'm-1',
  onClick: action('CLICK')
}

storiesOf('Button', module)
  .add('color', () => (
    <div>
      <Button {...common} color="primary">
        Primary
      </Button>
      <Button {...common}>Secondary (default)</Button>
      <Button {...common} color="success">
        Success
      </Button>
      <Button {...common} color="danger">
        Danger
      </Button>
      <Button {...common} color="warning">
        Warning
      </Button>
      <Button {...common} color="info">
        Info
      </Button>
      <Button {...common} color="light">
        Light
      </Button>
      <Button {...common} color="dark">
        Dark
      </Button>
      <Button {...common} color="link">
        Link
      </Button>
    </div>
  ))
  .add('outline', () => (
    <div>
      <Button {...common} color="primary" outline>
        Primary
      </Button>
      <Button {...common} outline>
        Secondary (default)
      </Button>
      <Button {...common} color="success" outline>
        Success
      </Button>
      <Button {...common} color="danger" outline>
        Danger
      </Button>
      <Button {...common} color="warning" outline>
        Warning
      </Button>
      <Button {...common} color="info" outline>
        Info
      </Button>
      <Button {...common} color="light" outline>
        Light
      </Button>
      <Button {...common} color="dark" outline>
        Dark
      </Button>
    </div>
  ))
  .add('size', () => (
    <div>
      <Button {...common} color="primary" size="lg">
        Large (lg)
      </Button>
      <Button {...common} size="lg">
        Large (lg)
      </Button>
      <Button {...common} color="primary" size="sm">
        Small (sm)
      </Button>
      <Button {...common} size="sm">
        Small (sm)
      </Button>
    </div>
  ))
  .add('block', () => (
    <div>
      <Button {...common} color="primary" block>
        Block level
      </Button>
      <Button {...common} block>
        Block level
      </Button>
    </div>
  ))
