import React from 'react'
import Col from 'react-bootstrap/Col'
import SetCacheControl from '../lib/set-cache-control'

const RegisterThankYou = () =>
  <Col>
    <div style={{ padding: '10px' }}>
      <h1>Thank you for signing up!</h1>
      <p>Your account has been created</p>
    </div>
  </Col>
RegisterThankYou.setInitialProps = SetCacheControl(60 * 60 * 24 * 14)
export default RegisterThankYou
