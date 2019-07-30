import React from 'react'
import { Query } from 'react-apollo'
import Loader from './Loader'
import ApolloError from './ApolloError'

export default (props) => <Query {...props}>
  {(args) => {
    if (args.loading) return <Loader />
    else if (args.error) return <ApolloError />
    else return props.children(args)
  }}
</Query>
