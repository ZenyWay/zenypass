import { Col, Container, Row } from 'reactstrap'

export default function Wrapper ({ children, ...attrs }) {
  return (
    <Container {...attrs}>
      <Row className='mb-2 align-items-center'>
        <Col xl='4' md='6' sm='12' id='authorization' className='text-center rounded'>
          {children}
        </Col>
      </Row>
    </Container>
  )
}
