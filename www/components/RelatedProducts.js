import React from "react"
import gql from 'graphql-tag'
import ProductTeaser from './ProductTeaser'
import GridList from './GridList'
import BlockQuery from './BlockQuery'

export const pageQuery = gql`
query($productId: ID!) {
  relatedProducts(productId: $productId) {
    id
    sku
    name
    category
    subcategory
    isOnSale
    price
    salePrice
    saleStart
    saleEnd
    description
    image
    thumbnail
    hyperlinkedImage
    productVariants {
      id
      price
    }
  }
}
`

const RelatedProducts = ({ listName, productId }) => <BlockQuery query={pageQuery} variables={{ productId }}>
  {
    ({ data }) => <div>
      <GridList items={data.relatedProducts} colProps={{ sm: 12, md: 6, lg: 4, xl: 3, }}>
        {(item, idx) => <ProductTeaser product={item} position={idx} listName={listName || 'ProductList'} />}
      </GridList>
      { data.relatedProducts.length == 0 && <p>No data for this item</p>}
    </div>
  }
</BlockQuery>

export default RelatedProducts
