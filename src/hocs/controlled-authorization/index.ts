/**
 * Clément Bonet
 */
//
import reducer from "./reducer"
import effects from './effects'
import componentFromEvents, { redux, connect, SFC, ComponentClass } from "../../component-from-events"
import { createActionDispatchers } from "basic-fsa-factories"
import { tap } from "rxjs/operators"

export interface ControlledAuthorizationProps {
  [prop: string]: any
}

type AuthorizationState = 'init'|'authenticating'|'auth_request'|'authorizing'

interface ControlledAuthorizationState {
  props:ControlledAuthorizationProps,
  state: AuthorizationState
  token?:string,
  error?:string,
  errorPassword?:string
}

function mapStateToProps({ props, state, token, error, errorPassword }:ControlledAuthorizationState) {
  const authorizing = state === 'authorizing'
  const auth_request = state === 'auth_request'
  const init = state === 'init'
  const authenticate = state === 'authenticating' || state === 'auth_request'
  return { ...props, authorizing, auth_request, error, errorPassword, init, token, authenticate}
}

const mapDispatchToProps = createActionDispatchers({
  onClick: "CLICK",
  onCancel: "CANCEL",
  onPasswordSubmit: "PASSWORD"
})

export interface AuthorizationCardProps {
  authenticate:boolean,
  authorizing:boolean,
  auth_request:boolean,
  error?:string,
  init:boolean,
  token?:string,
  onCancel:() => void,
  onClick:() => void,
  onPasswordSubmit: (event: Event) => void
}

export default function<P extends AuthorizationCardProps>(
  AccessAuthorization:SFC<P>
):ComponentClass<ControlledAuthorizationProps> {
  const Access = componentFromEvents<ControlledAuthorizationProps,P>(
    AccessAuthorization,
    //() => tap(console.log.bind(console,'access:event:')),
    redux(reducer, ...effects),
    //() => tap(console.log.bind(console,'access:state:')),
    connect(mapStateToProps, mapDispatchToProps),
    //() => tap(console.log.bind(console,'access:state:'))
  )

  return Access
}
