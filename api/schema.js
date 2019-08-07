const { gql } = require('./apollo-server')
const resolvers = require('./resolvers')
// const { makeExecutableSchema } = require('graphql-tools')

// in seconds
const CACHEABLE_TTL = 300

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    category(categoryId: ID!): Category! @cacheControl(maxAge: ${CACHEABLE_TTL})
    allCategories: [Category!]! @cacheControl(maxAge: ${CACHEABLE_TTL})
    allSubcategories(categoryId: ID): [SubCategory!]! @cacheControl(maxAge: ${CACHEABLE_TTL})
    product(productId: ID!): Product @cacheControl(maxAge: ${CACHEABLE_TTL})
    allProducts(
      categoryId: ID,
      subcategoryId: ID,
      searchPhrase: String,
      priceRange: PriceRange,
      onSaleOnly: Boolean,
      newOnly: Boolean,
      skip: Int,
      limit: Int,
      sort: ProductSortType
    ): ProductList! @cacheControl(maxAge: ${CACHEABLE_TTL})
    cart(orderId: ID!, shipping: Float, county: String, promo: String): Order
    user(token: String!): User
    wishlist(token: String!): [WishListItem!]!
    allPromos(token: String!): [Promo!]! @cacheControl(maxAge: ${CACHEABLE_TTL})
    siteinfo: SiteInfo! @cacheControl(maxAge: ${CACHEABLE_TTL})
    similarKeywords(keyword: String!): [String!]! @cacheControl(maxAge: ${CACHEABLE_TTL})
    relatedProducts(productId: ID!): [Product!]! @cacheControl(maxAge: ${CACHEABLE_TTL})
    topSellingProducts(limit: Int): [Product!]! @cacheControl(maxAge: ${CACHEABLE_TTL})
  }

  type SiteInfo {
    paypalClientId: String!
  }

  type Promo @cacheControl(maxAge: ${CACHEABLE_TTL}) {
    id: ID!
    coupon: String!
    starts: Date!
    ends: Date!
    requiresTotal: Float
    requiresSubcategory: ID
    percentageOff: Float
    moneyOff: Float
    freeShipping: Boolean
  }

  input PromoPatch {
    coupon: String
    starts: Date
    ends: Date
    requiresTotal: Float
    requiresSubcategory: ID
    percentageOff: Float
    moneyOff: Float
    freeShipping: Boolean
  }

  input PromoInput {
    coupon: String!
    starts: Date!
    ends: Date!
    requiresTotal: Float
    requiresSubcategory: ID
    percentageOff: Float
    moneyOff: Float
    freeShipping: Boolean
  }

  scalar Date

  type WishListItem {
    id: ID!
    dateAdded: Date!
    product: Product!
  }

  input PriceRange {
    lower: Float!
    higher: Float!
  }

  type Mutation {
    register(
      email: String!,
      password: String!
    ): AuthPayload!
    signin(email: String!, password: String!): AuthPayload!
    updateUser(token: String!, user: UserPatchInput!) : User!

    addToCart(productId: ID!, qty: Int!, orderId: ID, variant: ID): Order!
    updateCartItem(cartItemId: ID!, qty: Int!, variant: ID): Order!
    removeFromCart(cartItemId: ID!): Order!
    placeOrder(orderId: ID!, paypalOrderId: ID!, shipping: Float!, county: String, promo: String): Order!

    addToWishList(token: String!, productId: ID!): Boolean
    removeFromWishList(token: String!, productId: ID!): Boolean

    requestSignedUrl(token: String!, fileName: String!, fileType: String!): SignedUrlPayload!

    createProduct(token: String!, productData: ProductInsertInput!): Product!
    updateProduct(token: String!, productId: ID!, productData: ProductPatchInput!): Product!
    removeProduct(token: String!, productId: ID!): Boolean

    addCategory(token: String!, category: CategoryInput!): Category!
    updateCategory(token: String!, categoryId: ID!, category: CategoryInput!): Category!
    removeCategory(token: String!, categoryId: ID!): Boolean

    addSubcategory(token: String!, subcategory: SubCategoryInput!): SubCategory!
    updateSubcategory(token: String!, subcategoryId: ID!, subcategory: SubCategoryInput!): SubCategory!
    removeSubcategory(token: String!, subcategoryId: ID!): Boolean

    addPromo(token: String!, promo: PromoInput!): Promo!
    updatePromo(token: String!, promoId: ID!, promo: PromoPatch!): Promo!
    removePromo(token: String!, promoId: ID!): Boolean
  }

  input CategoryInput {
    title: String!
    comments: String
  }

  input SubCategoryInput {
    categoryId: ID!
    title: String!
    comments: String
  }

  type SignedUrlPayload {
    signedUrl: String!
    publicUrl: String!
  }

  type Order {
      id: ID!
      placed: Boolean!
      items: [CartItem!]!
      subtotal: Float!
      shipping: Float!
      discount: Float!
      tax: Float!
      total: Float!
      customerInfo: CustomerInfo
  }

  type CustomerInfo {
    OrderPlaced: Boolean!,
    OrderFilled: Boolean!,
    FirstName: String!,
    LastName: String!,
    Phone: String!,
    Email: String!,
    Address: String!,
    City: String!,
    State: String!,
    Zip: Int!,
    Country: String!,
    BFirstName: String!,
    BLastName: String!,
    BAddress: String!,
    BCity: String!,
    BState: String!,
    BZip: Int!,
    BCountry: String!,
    BPhone: String!,
    BEmail: String!,
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type CartItem {
    id: ID!
    product: Product!
    qty: ID!
    price: Float!
    variant: ID
  }

  type User {
    id: ID!
    email: String!
    firstName: String
    lastName: String
    address: String
    city: String
    state: String
    zip: String
    country: String
    phone: String
  }

  input UserPatchInput {
    firstName: String
    lastName: String
    address: String
    city: String
    state: String
    zip: String
    country: String
    phone: String
  }

  enum ProductSortType {
      relevancy
      mostRecent
      alpha
      priceAsc
      priceDesc
      random
  }

  type Category @cacheControl(maxAge: ${CACHEABLE_TTL}) {
    id: ID!
    title: String!
    comments: String
    image: String
  }

  type SubCategory @cacheControl(maxAge: ${CACHEABLE_TTL}) {
    id: ID!
    title: String!
    comments: String
    image: String
  }

  type ProductList @cacheControl(maxAge: ${CACHEABLE_TTL}) {
    total: Int!
    records: [Product!]!
    categories: [Category!]!
    subcategories: [SubCategory!]
  }

  input ProductInsertInput {
    sku: String!
    name: String!
    price: Float!
    qtyInStock: Int!
    categoryId: ID!
    subcategoryId: ID!
    description: String
    hyperlinkedImage: String
    salePrice: Float
    saleStart: String
    saleEnd: String
    category2: ID
    subcategory2: ID
    category3: ID
    subcategory3: ID
    keywords: String
    productVariants: [ProductVariantInput!]!
  }

  input ProductPatchInput {
      sku: String
      name: String
      price: Float
      salePrice: Float
      qtyInStock: Int
      saleStart: String
      saleEnd: String
      description: String
      hyperlinkedImage: String
      categoryId: ID
      subcategoryId: ID
      category2: ID
      subcategory2: ID
      category3: ID
      subcategory3: ID
      keywords: String
      productVariants: [ProductVariantInput!]!
  }

  input ProductVariantInput {
    price: Float!
    text: String!
  }

  type Product @cacheControl(maxAge: ${CACHEABLE_TTL}) {
    id: Int!
    sku: String!
    name: String!
    price: Float!
    qtyInStock: Int!
    clearance: Boolean!
    isOnSale: Boolean!
    salePrice: Float
    saleStart: String
    saleEnd: String
    description: String
    image: String
    thumbnail: String
    hyperlinkedImage: String
    category: String!
    categoryId: ID!
    subcategory: String!
    subcategoryId: ID!
    productVariants: [ProductVariant!]!
    category2: ID
    subcategory2: ID
    category3: ID
    subcategory3: ID
    keywords: String!
  }

  type ProductVariant {
    id: ID!
    price: Float!
    text: String!
  }

`

module.exports = {
  typeDefs,
  resolvers,
}
