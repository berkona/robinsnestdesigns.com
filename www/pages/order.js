import React from "react"
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Table from 'react-bootstrap/Table'
import { withRouter } from 'next/router'
import Loader from '../components/Loader'
import Link from 'next/link'
import SetCacheControl from '../lib/set-cache-control'

const query = gql`
  query($orderId: ID!) {
    cart(orderId: $orderId) {
      id
      placed
      customerInfo {
        FirstName
        LastName
        Address
        City
        State
        Zip
        BFirstName
        BLastName
        BAddress
        BCity
        BState
        BZip
      }
      subtotal
      tax
      discount
      shipping
      total
      items {
        id
        qty
        price
        variant
        product {
          id
          sku
          name
          productVariants {
            id
            text
          }
        }
      }
    }
  }
`

const OrderCell = ({ align, children }) => <td>
  <style jsx>{`
    td {
      border-top: #CCCCCC solid 1px;
    }
    div {
      font-size: 16px;
    }
    div.align-left {
      text-align: left;
    }
    div.align-center {
      text-align: center;
    }
    div.align-right {
      text-align: right;
    }
  `}</style>
  <div className={'align-' + (align || 'left')}>{children}</div>
</td>

const OrderPage = withRouter(
  (props) => <Col><div style={{ paddingLeft: '10px', paddingRight: '10px' }}><Query query={query} variables={{ orderId: props.router.query.orderId }}>
  {({ loading, error, data}) => {
    if (loading) return <Loader />
    if (error) return <p>Error: {error.toString()}</p>
    if (!data.cart.placed) {
      return <p>Order not yet placed.  If you think this is an error contact Support.</p>
    }
    return <>
      <Row><Col><h1>Your order with Robin's Nest Designs</h1><p style={{ marginBottom: '16px' }}>Thank you for ordering with Robin's Nest Designs.</p><hr /></Col></Row>
      <Row>
        <Col md={6}>
          <p>Order No: {props.router.query.orderId}</p>
          <p></p>
          <p>Ship To</p>
          <p></p>
          <p>{data.cart.customerInfo.FirstName} {data.cart.customerInfo.LastName}</p>
          <p>{data.cart.customerInfo.Address}</p>
          <p>{data.cart.customerInfo.City}, {data.cart.customerInfo.State} {data.cart.customerInfo.Zip}</p>
        </Col>
      </Row>
      <Row>
        <Col>
          <h1>Items in Order</h1>
          <Table className="cartItems" width="100%" cellPadding="2" cellSpacing="0" style={{borderTop: "#CCCCCC solid 1px"}}>
            <tbody>
            <tr className="header" bgcolor="#587E98">
              <td bgcolor="#587E98"><font color="#ffffff"><b><div align="center"> Item ID </div></b></font></td>
              <td bgcolor="#587E98"><font color="#ffffff"><b><div align="center"> Item Name </div></b></font></td>
              <td bgcolor="#587E98"><font color="#ffffff"><b><div align="center"> Option </div></b></font></td>
              <td bgcolor="#587E98"><font color="#ffffff"><b><div align="center"> Quantity </div></b></font></td>
              <td bgcolor="#587E98"><font color="#ffffff"><b><div align="center"> Price </div></b></font></td>
              <td bgcolor="#587E98"><font color="#ffffff"><b><div align="center"> Subtotal </div></b></font></td>
            </tr>
              {data.cart.items.map(({ id, product, qty, price, variant }) => {
                return <tr key={id} className="odd" bgcolor="#E4EDF4">
                  <OrderCell>
                    <Link href={`/product?productId=${product.id}`} as={`/product/${product.id}`}>
                      <a>{product.sku}</a>
                    </Link>
                  </OrderCell>
                  <OrderCell>
                    {product.name}
                  </OrderCell>
                  <OrderCell>
                    {variant && product.productVariants.filter(v => v.id == variant).map(v => v.text)[0] || ""}
                  </OrderCell>
                  <OrderCell align="center">
                    {qty}
                  </OrderCell>
                  <OrderCell align="right">
                    ${price.toFixed(2)}
                  </OrderCell>
                  <OrderCell align="right">
                    ${(qty * price).toFixed(2)}
                  </OrderCell>
                </tr>
              })}
 <tr>
      <td colSpan="5" align="right" style={{borderTop: "#CCCCCC solid 1px"}}><strong>Subtotal:</strong></td>
      <td style={{borderTop: "#CCCCCC solid 1px"}} align="right"><strong>${data.cart.subtotal.toFixed(2)}</strong></td>
  </tr>
  <tr>
     <td colSpan="5" align="right" style={{borderTop: "#CCCCCC solid 1px"}}><strong>Shipping:</strong></td>
     <td style={{borderTop: "#CCCCCC solid 1px"}} align="right"><strong>${data.cart.shipping.toFixed(2)}</strong></td>
   </tr>
   {
     data.cart.discount > 0 &&
     <tr>
          <td colSpan="5" align="right" style={{borderTop: "#CCCCCC solid 1px"}}><strong>Discount:</strong></td>
          <td style={{borderTop: "#CCCCCC solid 1px"}} align="right"><strong>${data.cart.discount.toFixed(2)}</strong></td>
      </tr>
   }
   <tr>
      <td colSpan="5" align="right" style={{borderTop: "#CCCCCC solid 1px"}}><strong>Tax:</strong></td>
      <td style={{borderTop: "#CCCCCC solid 1px"}} align="right"><strong>${data.cart.tax.toFixed(2)}</strong></td>
    </tr>
    <tr>
       <td colSpan="5" align="right" style={{borderTop: "#CCCCCC solid 1px"}}><strong>Total:</strong></td>
       <td style={{borderTop: "#CCCCCC solid 1px"}} align="right"><strong>${data.cart.total.toFixed(2)}</strong></td>
     </tr>
  </tbody></Table>
  </Col>
      </Row>
    </>
  }}
  </Query></div></Col>
)

OrderPage.getInitialProps = SetCacheControl(60 * 60)

export default OrderPage
