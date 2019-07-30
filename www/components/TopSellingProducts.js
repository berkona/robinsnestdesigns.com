import React from "react"
import gql from 'graphql-tag'
import ProductTeaser from './ProductTeaser'
import GridList from './GridList'
import BlockQuery from './BlockQuery'

export const pageQuery = gql`
query($limit: Int!) {
  topSellingProducts(limit: $limit) {
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

const TopSellingProducts = ({ listName, limit }) => <BlockQuery query={pageQuery} variables={{ limit }}>
  {
    ({ data }) => <div>
      <GridList items={data.topSellingProducts} colProps={{ sm: 12, md: 6, lg: 4, xl: 3, }}>
        {(item, idx) => <ProductTeaser product={item} position={idx} listName={listName || 'ProductList'} />}
      </GridList>
      { data.topSellingProducts.length == 0 && <p>No items sold for the last 30 days or an error occurred</p>}
    </div>
  }
</BlockQuery>

export default TopSellingProducts
