import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import ContentWithSidebar from '../components/ContentWithSidebar'
import ProductListTeaser from '../components/ProductListTeaser'
import { SearchLink } from '../components/Links'
import HomePageCarousel from '../components/HomePageCarousel'
import SetCacheControl from '../lib/set-cache-control'
import TopSellingProducts from '../components/TopSellingProducts'
import TotalNew from '../components/TotalNew'

const Index = (props) => (
  <>
    <style jsx global>
    {`
          .carousel-inner {
            display: flex;
          }

          .carousel-item {
            padding-bottom: 20px;
          }

          .carousel-item.active {
            display: flex;
          }

          .carousel-title {

          }

          .carousel-body {
            display: flex;
            flex-direction: row;
          }

          .carousel-body > div {
            padding: 10px;
          }

          .carousel-body .row > div {
            padding: 10px;
          }

          .carousel-body img {
            width: 100%;
            height: auto;
          }
    `}
    </style>
    <style jsx>{`
        .style19 {
          color: #336699;
          font-weight: bold;
        }
        .intro {
          margin-left: 16px;
        }
    `}</style>
    <ContentWithSidebar>
      <div id="homeContent" style={{ paddingLeft: '10px', paddingRight: '10px' }}>
        <HomePageCarousel />
        <hr />
        <Row>
          <Col xs={12}>
            <h2>A Sampling of New Items This Week</h2>
            <p className="intro">
              Over {<TotalNew />} items have been added recently! Most are on sale until for a few weeks after being added
            </p>
            <p className="intro">
              <SearchLink newOnly={true} sortOrder="mostRecent">
                <a>Click here to see all that's new!</a>
              </SearchLink>
            </p>
            <hr />
            <ProductListTeaser newOnly={true} sortOrder="random" limit={8} listName={'Index - Whats New'} />
            <hr />
          </Col>

          <Col xs={12}>
            <h2>Popular Items This Month</h2>
            <p className="intro">These items are flying off the shelves, so order fast before we run out of stock.</p>
            <hr />
            <TopSellingProducts listName={'Index - Popular Items This Month'} limit={8} />
            <hr />
          </Col>

          <Col xs={12}>
            <h2>On Sale</h2>
            <p className="intro">
              Check out our great sales going on every day
            </p>
            <p className="intro">
              <SearchLink onSaleOnly={true} sortOrder="mostRecent">
                <a>Click here to see all that's on sale!</a>
              </SearchLink>
            </p>
            <hr />
            <ProductListTeaser onSaleOnly={true} sortOrder="random" limit={8} listName={'Index - On Sale'} />
            <hr />
          </Col>


          <Col xs={12}>
            <h2>In The Bargain Bin</h2>
            <p className="intro">Up to 30% off on select items</p>
            <p className="intro">
              <SearchLink  categoryId={215} sortOrder="mostRecent">
                <a>Click here to see all items in the Bargain Bin!</a>
              </SearchLink>
            </p>
            <hr />
            <ProductListTeaser sortOrder="random" categoryId={215} limit={8} listName={'Index - New in Bargin Bin'} />
            <hr />
          </Col>

        </Row>
      </div>
    </ContentWithSidebar>
  </>
)

Index.getInitialProps = SetCacheControl(600)

export default Index
