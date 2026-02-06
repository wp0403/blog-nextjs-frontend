import PostClient from './post-client'
import type { Metadata } from 'next'
import getData from "@/utils/httpClient/request";
 
export const metadata: Metadata = {
  title: '友情链接',
  description: '存放友链地址',
}
 
const FriendlyLinks = async () => {
  try {
    const { data } = await getData({ type: "all_user_friendly_Links" });
    return <PostClient data={data} />;
  } catch {
    return <PostClient data={[]} />;
  }
};
 
export default FriendlyLinks;
