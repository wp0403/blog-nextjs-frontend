import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import getData from "@/utils/httpClient/request";
import PostClient from "./post-client";

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const res = await getData({ type: "all_blog_List" });
    return res.data.map(({ id }) => ({ blogId: id.toString() }));
  } catch {
    return [];
  }
}

async function getPost(params: { blogId: string | number }) {
  return await getData({
    type: "all_blog_ClassifyDetail",
    params: { id: params.blogId },
  });
}

export default async function BlogDetails({ params }) {
  const { data = {} } = await getPost(params);

  const source = await serialize(data.content, {
    scope: {},
    mdxOptions: {
      development: process.env.NODE_ENV === "development",
      remarkPlugins: [remarkMath, remarkGfm],
      rehypePlugins: [],
    },
  });
  return source ? <PostClient data={data} source={source} /> : "";
}
