import ContentWithSidebar from "../../components/ContentWithSidebar";
import SEO from "../../components/SEO";

export default props => (
  <ContentWithSidebar>
    <SEO
      title="Contact | Robin's Nest Designs"
      description="Contact our shop | Robin's Nest Designs"
    />
    <h1>How to Contact Us </h1>
    <p>
      We're always happy to help our customers. You can contact us in a variety
      of ways:
    </p>
    <table width="500" border="0" align="center" cellPadding="6">
      <tbody>
        <tr>
          <td width="75">
            <strong>E-Mail:</strong>
          </td>
          <td width="409">
            <a href="mailto:robin@robinsnestdesigns.com">
              robin@robinsnestdesigns.com
            </a>{" "}
            (24/7, preferred method){" "}
          </td>
        </tr>
        <tr valign="top">
          <td>
            <strong>Phone:</strong>
          </td>
          <td>
            Due to time restraints, we are no longer minding the phone. For
            faster service, please{" "}
            <a href="mailto:robin@robinsnestdesigns.com">email us</a> 24/7 or
            fax us. Thanks!{" "}
          </td>
        </tr>
        <tr>
          <td>
            <strong>Fax:</strong>
          </td>
          <td>919-321-2964 (10 am to 10 pm Eastern Time)</td>
        </tr>
        <tr valign="top">
          <td>
            <strong>US Mail: </strong>
          </td>
          <td>
            <p>
              Robin's Nest Designs
              <br />
              6303 Craig Rd
              <br />
              Durham, NC 27712{" "}
            </p>
          </td>
        </tr>
      </tbody>
    </table>
    <p>&nbsp;</p>
    <p>
      Please note that we are an online / mail order only business. We do not
      have a brick and mortar store. We are not set up to have customers
      physically come by and browse.{" "}
    </p>
    <p>
      Please place your orders online. We are no longer set up to take phone
      orders.{" "}
    </p>
  </ContentWithSidebar>
);
