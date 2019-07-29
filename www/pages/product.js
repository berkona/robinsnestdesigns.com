import React from 'react'
import ProductDetail from '../components/ProductDetail'
import ContentWithSidebar from '../components/ContentWithSidebar'
import { withRouter } from 'next/router'
import SetCacheControl from '../lib/set-cache-control'

const ProductPage = withRouter((props) => (
  <ContentWithSidebar>
    <ProductDetail productId={props.router.query.productId} listref={props.router.query.listref}/>
  </ContentWithSidebar>
))

ProductPage.getInitialProps = SetCacheControl(600)

export default ProductPage
