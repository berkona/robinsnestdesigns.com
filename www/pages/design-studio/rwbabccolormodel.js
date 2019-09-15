import ContentWithSidebar from '../../components/ContentWithSidebar'
import Link from 'next/link'
import { CategoryLink } from '../../components/Links'

export default () => (
  <ContentWithSidebar>
    <h1>Free Patriotic Alphabet Design</h1>
    <p>Show your patriotism with this versatile red, white, and blue alphabet.</p>
    <hr />
    <p>
      <img src="/static/rwbabcpt5.jpg" />
    </p>
    <p><Link href="rnorwbabc"><a>Go to Chart Page</a></Link></p>
    <p>Use this alphabet to spell out:</p>
    <ul>
      <li>GOD BLESS AMERICA</li>
      <li>AMERICA THE BEAUTIFUL</li>
      <li>THERE'S NO PLACE LIKE HOME</li>
      <li>WE SHALL OVERCOME</li>
    </ul>
    <p>Whatever you want! Wherever you want!</p>
    <p><CategoryLink categoryId={12}><a>Check out other great charts here</a></CategoryLink></p>
  </ContentWithSidebar>
);
