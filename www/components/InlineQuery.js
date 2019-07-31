import { Query } from 'react-apollo'
import ApolloError from '../components/ApolloError'

export default ({ query, variables, children, useP = true }) => <Query query={query} variables={variables}>
  {({ loading, error, data }) => {
    if (loading) return useP ? <p>Loading...</p> : <span>Loading...</span>
    if (error) return <ApolloError error={error} />
    if (!data) return useP ? <p>No data returned from server</p> : <span>Loading...</span>
    return children(data)
  }}
</Query>
