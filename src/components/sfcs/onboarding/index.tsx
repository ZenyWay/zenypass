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
/** @jsx createElement */
import { createElement } from 'create-element'
import { Button, Card, CardHeader, CardBody, CardFooter } from 'bootstrap'
import { classes } from 'utils'
import createL10ns from 'basic-l10n'
const LOCALES = require('./locales.json')
LOCALES.fr['next-steps'] = require('./next-steps-fr.md')
LOCALES.en['next-steps'] = require('./next-steps-en.md')
const l10ns = createL10ns(LOCALES)

export interface OnboardingProps {
  locale: string
  className?: string
  onClose?: (event?: MouseEvent) => void
}

export function Onboarding ({
  locale,
  className,
  onClose,
  ...attrs
}: OnboardingProps & { [prop: string]: unknown }) {
  const t = l10ns[locale]
  const nextSteps = { __html: t('next-steps') }
  return (
    <article
      className={classes('col-12 py-1 px-0 px-sm-1', className)}
      {...attrs}
    >
      <Card className='px-0 shadow-sm'>
        <CardHeader className='border-0 bg-white pb-1'>
          <h5 className='text-center text-info'>
            {t('Welcome')}
            <br />
            {t('First Steps')}
          </h5>
        </CardHeader>
        <CardBody className='py-2' dangerouslySetInnerHTML={nextSteps} />
        <CardFooter className='border-0 bg-white pt-0 d-flex justify-content-end'>
          <Button color='info' onClick={onClose}>
            {' '}
            {t('OK, understood')}
          </Button>
        </CardFooter>
      </Card>
    </article>
  )
}
