import { safeGetData } from "@/utils/httpClient/request";
import PostClient from "./post-client";

export const dynamicParams = false;

// 动态路由
export async function generateStaticParams() {
  const posts = await safeGetData({
    type: "all_blog_PageList",
    config: { next: { revalidate: 6000 } },
  });
  const arr = [] as string[];
  for (let i = 1; i <= posts.data; i++) {
    arr.push(i.toString());
  }
  return arr.map((v) => ({ slug: v }));
}

// 获取数据
async function getPost(params: { slug: any }) {
  const posts1 = await safeGetData({
    type: "all_blog_PageList",
    config: { next: { revalidate: 6000 } },
  });
  const pageList = [] as string[];
  for (let i = 1; i <= posts1.data; i++) {
    pageList.push(i.toString());
  }
  const posts2 = await safeGetData({
    type: "all_blog_List",
    params: { page: params.slug },
  });
  const classifyNum = await safeGetData({
    type: "all_blog_ClassifyNum",
  });
  return {
    page: params.slug,
    totalPage: posts1.data,
    pageList,
    classifyNum: classifyNum.data,
    ...posts2,
  };
}

export default async function BlogList({ params }) {
  const post = await getPost(params);

  return <PostClient post={post} />;
}
