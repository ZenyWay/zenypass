import { Col, Container, Row } from 'bootstrap'

export default function Wrapper({ children, ...attrs }) {
  return (
    <Container>
      <Row className="mb-2 align-items-center">
        <Col xl="4" md="6" {...attrs}>
          {children}
        </Col>
      </Row>
    </Container>
  )
}
