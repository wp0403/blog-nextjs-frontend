import PostClient from './post-client'
import type { Metadata } from 'next'
import { safeGetData } from "@/utils/httpClient/request";
 
export const metadata: Metadata = {
  title: '友情链接',
  description: '存放友链地址',
}
 
const FriendlyLinks = async () => {
  const { data } = await safeGetData({ type: "all_user_friendly_Links" });
  return <PostClient data={data} />;
};
 
export default FriendlyLinks;
