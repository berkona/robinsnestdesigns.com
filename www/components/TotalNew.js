import InlineQuery from './InlineQuery'
import gql from 'graphql-tag'

const query = gql`
query {
  allProducts(newOnly: true) {
    total
  }
}
`

export default () => <InlineQuery query={query} useP={false}>
{(data) => <span>{data.allProducts.total || 0}</span>}
</InlineQuery>
