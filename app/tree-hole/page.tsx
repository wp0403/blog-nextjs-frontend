"use client";
import { useEffect, useRef, useState } from "react";
import { useGetState } from "ahooks";
import {
  addNavItemStyle,
  bindHandleScroll,
  layoutContent,
  removeNavItemStyle,
  removeScroll,
} from "@utils/elementUtils";
import getDataApi from "@/utils/httpClient/request";
import { changeTreeData, distinctObjectMap } from "@utils/dataUtils";
import VirtuallyItem from "@components/VirtuallyItem";
import withLoading from "@components/WithLoading";
import useChangeLoading from "@components/WithLoading/useChangeLoading";
import style from "./treehole.module.css";

type DateItem = {
  [key: string]: boolean | number | string | any;
};

const TreeHole = (props) => {
  // 树洞列表
  const [data, setData] = useState<DateItem[]>([]);
  // 当前页
  const [page, setPage, getPage] = useGetState<number>(1);
  // 每页条数
  const [page_size, setPageSize] = useState<number>(20);
  const [loading, setLoading] = useGetState<boolean>(false);
  const [totalPages, setTotalPages, getTotalPages] = useGetState<number>(0);
  // 添加初始化状态
  const [initialized, setInitialized] = useState<boolean>(false);

  const content = useRef<any>(null);

  const getDate = async () => {
    if (getTotalPages() !== 0 && getTotalPages() < getPage()) return;
    setLoading(true);
    const posts = await getDataApi({
      type: "all_secret_List",
      params: { page: getPage(), page_size: page_size },
    });
    setData((a) => distinctObjectMap([...a, ...posts.data], "id"));
    getPage() === 1 && setTotalPages(posts.meta.total_pages);
    setLoading(false);
    // 第一次数据加载完成后设置初始化状态
    if (!initialized) {
      // 使用 requestAnimationFrame 确保 DOM 更新后再设置状态
      requestAnimationFrame(() => {
        setInitialized(true);
      });
    }
  };

  // 滚动事件
  const scrollFun = () => {
    // 如果还未初始化完成，不处理滚动
    if (!initialized) return;

    // 滚动盒子
    const scrollBox = layoutContent();
    const scrollConBox = content.current;

    if (!scrollConBox) return;
    const flag = page < totalPages;

    if (
      scrollConBox.offsetHeight -
        scrollBox.offsetHeight +
        40 -
        scrollBox.scrollTop <=
        500 &&
      !loading &&
      flag
    ) {
      setPage((data) => data + 1);
    }
  };

  // 获取列表数据
  useEffect(() => {
    getDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const scrollBox = layoutContent();
    scrollBox && scrollBox.addEventListener("scroll", scrollFun);
    return () => {
      scrollBox && scrollBox.removeEventListener("scroll", scrollFun);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page_size, page, totalPages, loading, layoutContent]);

  useEffect(() => {
    addNavItemStyle();
    bindHandleScroll();

    return () => {
      removeNavItemStyle();
      removeScroll();
    };
  }, []);

  useChangeLoading({ ...props, name: "tree_hole" });

  return (
    <div
      className={`${style.tree_hole} ${props.loading && "all-page-loading"} ${
        initialized && style["opacity_100"]
      }`}
      ref={content}
    >
      <div className={style.content}>
        {changeTreeData(data)?.map((v, ind) => (
          <div className={style.item} key={ind}>
            <div className={style.year}>{v?.year}</div>
            {v?.children?.map((item) => (
              <VirtuallyItem key={item.id}>
                <div className={style.tree_item} key={item.id}>
                  <div className={style.tree_item_top}>
                    <div className={style.tree_item_left}>
                      <div className={style.tree_item_time}>
                        {item?.date_str}
                      </div>
                      {item?.isTop === 1 && (
                        <div className={style.tree_item_status}>置 顶</div>
                      )}
                    </div>
                    <div
                      className={style.tree_item_content}
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                  </div>
                  <div className={style.tree_item_type}>{item?.type}</div>
                </div>
              </VirtuallyItem>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default withLoading(TreeHole);
