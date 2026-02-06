import fs from "fs";
import { SitemapStream, streamToPromise } from "sitemap";

export async function GET(req: Request) {
  const sitemapStream = new SitemapStream({
    hostname: "https://wp-boke.work",
  });

  const pages = ["/blog-details/38", "/secret", "/blog-details/45"];
  pages?.map((v) => sitemapStream.write({ url: `${v}` }));

  sitemapStream.end();

  const sitemap = await streamToPromise(sitemapStream);

  const serverName = process.env.SERVER_NAME;
  if (serverName !== "vercel") {
    const sitemapPath = "./public/dead-chain.xml";
    fs.writeFileSync(sitemapPath, sitemap);
  }

  const myResponse = new Response(sitemap.toString(), {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=0.1, must-revalidate",
    },
  });

  return myResponse;
}
