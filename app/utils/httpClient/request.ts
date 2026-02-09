import { objectToQueryString } from "@utils/dataUtils";
import apis from "./apis";

const baseObj = {
  all: "https://shimmer.wp-boke.work/api",
  apiRender: "https://api-render.wp-boke.work",
};

type ApiKey = keyof typeof apis;

const getData = async ({
  type,
  params = null,
  config = { next: { revalidate: 3600 } },
}: // config = { cache: "force-cache" },
{
  type: ApiKey;
  params?: { [key: string]: any } | null | undefined;
  config?: RequestInit | undefined;
}) => {
  try {
    const BASE_URL = baseObj[type.split("_")[0]];
    const queryString = params ? `?${objectToQueryString(params)}` : "";
    const url = `${BASE_URL}${apis[type]}${queryString}`;
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const safeGetData = async ({
  type,
  params = null,
  config = { next: { revalidate: 3600 } },
  timeoutMs = Number(process.env.FETCH_TIMEOUT_MS || 3000),
}: 
{
  type: ApiKey;
  params?: { [key: string]: any } | null | undefined;
  config?: RequestInit | undefined;
  timeoutMs?: number;
}) => {
  const BASE_URL = baseObj[type.split("_")[0]];
  const queryString = params ? `?${objectToQueryString(params)}` : "";
  const url = `${BASE_URL}${apis[type]}${queryString}`;
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(url, { ...config, signal: controller.signal });
    clearTimeout(id);
    if (!response.ok) {
      return fallback[type] ?? { data: [] };
    }
    return await response.json();
  } catch {
    return fallback[type] ?? { data: [] };
  }
};

const fallback: Record<string, any> = {
  all_blog_PageList: { data: 0 },
  all_blog_List: { data: [], meta: { total: 0 } },
  all_blog_ClassifyNum: { data: { classifyNum: [] } },
  all_blog_ClassifyDetail: { data: { content: "" } },
  all_user_friendly_Links: { data: [] },
};

export default getData;
