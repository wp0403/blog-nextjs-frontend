import fs from "fs";
import RSS from "rss";
import { safeGetData } from "@/utils/httpClient/request";

export async function GET(req: Request) {
  const feed = new RSS({
    title: "Shimmer RSS",
    description: "shimmer博客的rss",
    feed_url: "https://wp-boke.work/rss.xml",
    site_url: "https://wp-boke.work",
    language: "zh-CN",
    pubDate: new Date(),
  });

  const classifyList = (await safeGetData({ type: "all_blog_List" })).data;
  classifyList?.map(
    (v: {
      title: string;
      desc: string;
      id: string | number;
      userInfo: { name: string };
      time_str: string;
    }) => {
      feed.item({
        title: v.title,
        description: v.desc,
        url: `https://wp-boke.work/blog-details/${v.id}`,
        author: v.userInfo?.name,
        date: v.time_str,
      });
    },
  );

  const rssContent = feed.xml();

  const isVercel = process.env.VERCEL === "1";
  if (!isVercel) {
    const sitemapPath = "./public/rss.xml";
    fs.writeFileSync(sitemapPath, rssContent);
  }

  // Write the XML to the response
  let myResponse = new Response(rssContent, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=0.1, must-revalidate",
    },
  });

  return myResponse;
}
