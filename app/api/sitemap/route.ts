/*
 * @Descripttion:
 * @version:
 * @Author: WangPeng
 * @Date: 2023-04-24 15:00:43
 * @LastEditors: WangPeng
 * @LastEditTime: 2023-12-26 17:19:35
 */
import fs from "fs";
import { SitemapStream, streamToPromise } from "sitemap";
import getDataApi from "@/utils/httpClient/request";

export async function GET(req: Request) {
  // Create a Sitemap stream
  const sitemapStream = new SitemapStream({
    hostname: "https://wp-boke.work",
  });

  // Add URLs to the Sitemap stream
  const pages = [
    "/",
    "/archive",
    "/tree-hole",
    "/photography",
    "/about",
    "/resume",
    "/friendly-links",
    "/disclaimers",
    "/copyright-notice",
  ];
  pages?.map((v) => sitemapStream.write({ url: `${v}` }));

  try {
    const classifyList = (await getDataApi({ type: "all_blog_List" })).data;
    classifyList?.map((v) =>
      sitemapStream.write({
        url: `/blog-details/${v.id}`,
      }),
    );
  } catch {}
  // ...

  // End the stream
  sitemapStream.end();

  // Generate the XML
  const sitemap = await streamToPromise(sitemapStream);

  const isVercel = process.env.VERCEL === "1";
  if (!isVercel) {
    const sitemapPath = "./public/sitemap.xml";
    fs.writeFileSync(sitemapPath, sitemap);
  }

  // Write the XML to the response
  let myResponse = new Response(sitemap.toString(), {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=0.1, must-revalidate",
    },
  });

  return myResponse;
}
