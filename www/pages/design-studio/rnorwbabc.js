import ContentWithSidebar from "../../components/ContentWithSidebar";
import Link from "next/link";
import { CategoryLink } from "../../components/Links";
import SEO from "../../components/SEO";

export default () => (
  <ContentWithSidebar>
    <SEO
      title="Free Patriotic Alphabet Design - Chart | Free Cross Stitch Chart | Robin's Nest Designs"
      description="Check out our free Patriotic Alphabet Design, an original cross stitch chart from Robin's Nest Designs"
    />
    <h1>Free Patriotic Alphabet Design</h1>
    <p>Compliments of Robin's Nest Designs</p>
    <hr />
    <p>
      <img src="/static/rwbabc.jpg" />
    </p>
    <p>
      <Link href="rwbabccolormodel" target="_blank">
        <a>View color model</a>
      </Link>
    </p>
    <p>
      Use the print function on your browser&#39;s window to print out this free
      design.
    </p>
    <p>Each letter is approx. 9 x 9 count:</p>
    <ul>
      <li>1 inch on 8.5-count</li>
      <li>7/8 inch on 11-count</li>
      <li>5/8 inch on 14-count</li>
      <li>1/2 inch on 16-count</li>
      <li>1/2 inch on 18-count</li>
      <li>3/8 inch on 22-count</li>
    </ul>

    <p>
      <CategoryLink categoryId={12}>
        <a>Check out other great charts here</a>
      </CategoryLink>
    </p>
  </ContentWithSidebar>
);
