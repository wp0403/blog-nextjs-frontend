"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSize, useGetState } from "ahooks";
import { bindHandleScroll, removeScroll } from "@/utils/elementUtils";
import style from "./virtuallyItem.module.css";

const VirtuallyItem = (props) => {
  const size = useSize(() => document.querySelector("body"));
  // 用于记录当前元素的高度
  const [itemHeight, setItemHeight, getItemHeight] = useGetState<number | null>(
    null
  );
  // 用户保存当前的元素
  const itemRef = useRef<any>(null);
  // 判断当前元素是否在可视窗口
  const [isVisual, setIsVisual] = useState<boolean>(true);

  const scrollCallback = () => {
    // get position relative to viewport
    const rect = itemRef.current?.getBoundingClientRect();

    if (!rect) return;
    const distanceFromTop = rect.top;
    const distanceFromBottom = rect.bottom;
    // 可视区域高度
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    if (
      (distanceFromTop > -200 && distanceFromTop < viewportHeight + 200) ||
      (distanceFromBottom > -200 && distanceFromBottom < viewportHeight + 200)
    ) {
      setIsVisual(true);
    } else {
      setIsVisual(false);
    }
  };

  useEffect(() => {
    bindHandleScroll(scrollCallback);

    return () => {
      removeScroll(scrollCallback);
    };
  }, []);

  useEffect(() => {
    if (itemRef.current && getItemHeight() !== itemRef.current?.offsetHeight) {
      setItemHeight(itemRef.current?.offsetHeight);
    }
  }, [isVisual]);

  useEffect(() => {
    setItemHeight(null);
  }, [size?.width]);

  return (
    <div
      className={style.virtually_item}
      ref={itemRef}
      style={{
        height: props.height || `${itemHeight ? `${itemHeight}px` : "auto"}`,
      }}
    >
      {isVisual && props.children}
    </div>
  );
};

export default VirtuallyItem;
