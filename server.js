const express = require("express");
const next = require("next");
const schedule = require("node-schedule");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({
  dir: "./www",
  dev
});

const queryFromReq = req => {
  return {
    ...req.params,
    ...req.query
  };
};

const handle = nextApp.getRequestHandler();
nextApp.prepare().then(() => {
  const expressApp = express();

  const graphql = require("./api/handlers/graphql");
  graphql.applyMiddleware({ app: expressApp });

  const sitemap = require("./api/handlers/sitemap").handler;
  expressApp.get("/sitemap.xml", sitemap);

  const redirect = require("./api/handlers/redirect").handler;
  expressApp.get("/About/Contact.cfm", redirect);
  expressApp.get("/About/About.cfm", redirect);
  expressApp.get(
    encodeURI("/Design Studio/Robin's Nest Originals/rwbabccolormodel.htm"),
    redirect
  );
  expressApp.get(
    encodeURI("/Design Studio/Robin's Nest Originals/rwbabccolormodel.cfm"),
    redirect
  );
  expressApp.get("/ShippingInfo/shipping.cfm", redirect);
  expressApp.get("/ShippingInfo/shippingratesnew.cfm", redirect);
  expressApp.get("/ShoppingInfo/how2order.cfm", redirect);
  expressApp.get("/ShoppingInfo/paymentOptions.cfm", redirect);
  expressApp.get("/on_sale.cfm", redirect);
  expressApp.get("/whats_new.cfm", redirect);
  expressApp.get("/add_to_cart.cfm", redirect);
  expressApp.get("/wish_list.cfm", redirect);
  expressApp.get("/Newsletters/newsletter-signup.cfm", redirect);
  expressApp.get("/search.cfm", redirect);
  expressApp.get("/category_results.cfm", redirect);
  expressApp.get("/results.cfm", redirect);
  expressApp.get("/detail.cfm", redirect);
  expressApp.get("*.cfm", redirect);
  expressApp.get("*.htm", redirect);
  expressApp.get("*.html", redirect);

  const robots_txt = require("./api/handlers/robots").handler;
  expressApp.get("/robots.txt", robots_txt);

  // begin auto-generated from search-engine-import
  const search_engine_import = require("./api/handlers/search-engine-import")[
    "processAllProducts"
  ];
  const search_engine_import_schedule___self_custom_stage_ = setInterval(
    search_engine_import,
    86400000
  );
  process.on("exit", () =>
    clearInterval(search_engine_import_schedule___self_custom_stage_)
  );
  // end auto-generated code from search-engine-import

  // begin auto-generated from scrape-hoffman
  const scrape_hoffman = require("./api/handlers/scrape-hoffman")["main"];
  process.nextTick(() => {});
  const scrape_hoffman_schedule___self_custom_stage_ = schedule.scheduleJob(
    "1 2 * * *",
    scrape_hoffman
  );
  process.on("exit", () =>
    scrape_hoffman_schedule___self_custom_stage_.cancel()
  );
  // end auto-generated code from scrape-hoffman

  // begin auto-generated next-js routes
  expressApp.get("/", (req, res) => {
    return nextApp.render(req, res, "/", queryFromReq(req));
  });

  expressApp.get("/categories", (req, res) => {
    return nextApp.render(req, res, "/categories", queryFromReq(req));
  });

  expressApp.get("/category/:categoryId", (req, res) => {
    return nextApp.render(req, res, "/category", queryFromReq(req));
  });

  expressApp.get("/order/:orderId", (req, res) => {
    return nextApp.render(req, res, "/order", queryFromReq(req));
  });

  expressApp.get("/product/:productId", (req, res) => {
    return nextApp.render(req, res, "/product", queryFromReq(req));
  });

  expressApp.get("/product/:productId/:catSlug/:cat2Slug/:slug", (req, res) => {
    return nextApp.render(req, res, "/product", queryFromReq(req));
  });

  expressApp.get(
    "/search/c/:categoryId/sc/:subcategoryId/p/:pageNo",
    (req, res) => {
      return nextApp.render(req, res, "/search", queryFromReq(req));
    }
  );

  expressApp.get("/search/c/:categoryId/sc/:subcategoryId", (req, res) => {
    return nextApp.render(req, res, "/search", queryFromReq(req));
  });

  expressApp.get("/search/c/:categoryId/p/:pageNo", (req, res) => {
    return nextApp.render(req, res, "/search", queryFromReq(req));
  });

  expressApp.get("/search/c/:categoryId", (req, res) => {
    return nextApp.render(req, res, "/search", queryFromReq(req));
  });

  expressApp.get("/search/p/:pageNo", (req, res) => {
    return nextApp.render(req, res, "/search", queryFromReq(req));
  });

  expressApp.get("/search", (req, res) => {
    return nextApp.render(req, res, "/search", queryFromReq(req));
  });

  expressApp.get("/admin/product-details/:productId", (req, res) => {
    return nextApp.render(
      req,
      res,
      "/admin/product-details",
      queryFromReq(req)
    );
  });

  expressApp.get("/admin/category-details/:categoryId", (req, res) => {
    return nextApp.render(
      req,
      res,
      "/admin/category-details",
      queryFromReq(req)
    );
  });

  // end auto-generated next-js routes

  expressApp.get("*", (req, res) => {
    return handle(req, res);
  });

  expressApp.listen(port, err => {
    if (err) throw err;
    console.log("> Ready on http://localhost:" + port);
  });
});
