"use client";
import {
  CSSProperties,
  MouseEvent,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import styles from "./InputTextList.module.css";
import React from "react";

// textarea两种resize方式
export enum Resize {
  None = "none",
  Both = "both",
}

// 文字状态
export interface InputItem {
  boxWidth?: number;
  boxHeight?: number;
  value: string;
  positionStyle: CSSProperties;
  resize: Resize.None | Resize.Both; // 是否显示resize角标，focus时显示
  offsetX: number; // 相对于初始位置的偏移量
  offsetY: number;
  currentOffsetX: number; // 暂存的偏移量
  currentOffsetY: number;
}

// 暴露给父组件的方法
export interface InputTextListExposedMethods {
  addText: (newInput: InputItem) => void;
}

const InputTextList = forwardRef((props: { dragable: boolean }, ref) => {
  /**
   * 保留拖拽状态
   */
  const { dragable } = props;
  const dragableRef = useRef<boolean>(dragable);
  useEffect(() => {
    dragableRef.current = dragable;
  }, [dragable]);

  /**
   * 保留文字列表
   */
  const [inputTextList, setinputTextList] = useState<InputItem[]>([]);
  const inputTextListRef = useRef<InputItem[]>([]);
  useEffect(() => {
    inputTextListRef.current = inputTextList;
  }, [inputTextList]);

  /**
   * 文字引用
   */
  const textItemRefs = useRef<Array<HTMLTextAreaElement | null>>([]);
  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    // 新增文字元素
    addText: (newInput: InputItem) => {
      setinputTextList([...inputTextList, newInput]);
      setTimeout(() => {
        textItemRefs.current[textItemRefs.current.length - 1]?.focus(); // 新增时获取焦点
      }, 0);
    },
  }));

  /**
   * 输入框事件
   */

  // 文字输入
  function onHandleInputTextChange(
    event: React.ChangeEvent<HTMLTextAreaElement>,
    index: number
  ) {
    const value = event.target.value;
    const list = inputTextList.map((el, i) => {
      if (i === index) {
        return { ...el, value };
      }
      return el;
    });
    setinputTextList(list);
  }
  // 文字失去焦点
  function onHandleInputTextBlur(
    event: React.FocusEvent<HTMLTextAreaElement>,
    index: number
  ) {
    // 当前元素resize角标隐藏
    const list = inputTextList.map((el, i) => {
      if (i === index) {
        return { ...el, resize: Resize.None };
      } else {
        return el;
      }
    });
    setinputTextList(list);
    // 删除值为空的元素
    if (event.target.value === "") {
      const list = inputTextList
        .slice(0, index)
        .concat(inputTextList.slice(index + 1));
      setinputTextList(list);
    }
  }
  // 获得焦点
  function onHandleInputTextFocus(
    event: React.FocusEvent<HTMLTextAreaElement>,
    index: number
  ) {
    // 当前元素resize角标显示
    const list = inputTextList.map((el, i) => {
      if (i === index) {
        return { ...el, resize: Resize.Both };
      } else {
        return el;
      }
    });
    setinputTextList(list);
  }

  /**
   * 拖拽实现
   */
  const dragging = useRef(false); // 是否正在拖拽
  const activeIndex = useRef(0); // 当前拖拽元素的索引
  const initX = useRef(0); // 拖拽初始位置
  const initY = useRef(0);

  // 鼠标按下获取初始位置
  function mousedown(event: any) {
    if (!dragableRef.current) return;
    dragging.current = true;
    initX.current = event.clientX;
    initY.current = event.clientY;
  }

  // 鼠标松开，拖拽结束并保存当前位置
  function mouseup() {
    if (!dragableRef.current) return;
    dragging.current = false;
    const list = inputTextListRef.current.map((el, i) => {
      if (i === activeIndex.current) {
        return {
          ...el,
          offsetX: el.currentOffsetX,
          offsetY: el.currentOffsetY,
        };
      } else {
        return el;
      }
    });
    setinputTextList([...list]);
  }

  // 鼠标移动，计算拖拽距离与渲染，可添加节流
  function mousemove(event: any) {
    if (!dragableRef.current) return;
    const deltaX = event.clientX - initX.current;
    const deltaY = event.clientY - initY.current;
    if (dragging.current) {
      const list = inputTextListRef.current.map((el, i) => {
        if (i === activeIndex.current) {
          return {
            ...el,
            positionStyle: {
              ...el.positionStyle,
              transform: `translate(${(el.offsetX ?? 0) + deltaX}px, ${
                (el.offsetY ?? 0) + deltaY
              }px)`,
            },
            currentOffsetX: (el.offsetX ?? 0) + deltaX,
            currentOffsetY: (el.offsetY ?? 0) + deltaY,
          };
        } else {
          return el;
        }
      });
      setinputTextList([...list]);
    }
  }

  // 拖拽相关事件注册
  useEffect(() => {
    console.log("add event listener");
    document.addEventListener("mousedown", mousedown);
    document.addEventListener("mouseup", mouseup);
    document.addEventListener("mousemove", mousemove);
    return () => {
      document.removeEventListener("mousedown", mousedown);
      document.removeEventListener("mouseup", mouseup);
      document.removeEventListener("mousemove", mousemove);
    };
  }, []);

  // 获取当前拖拽元素
  function onHandleMouseDown(event: MouseEvent, index: number) {
    event.stopPropagation();
    activeIndex.current = index;
  }

  return (
    <div>
      {/* 文字列表 */}
      {inputTextList.map((item, index) => (
        <textarea
          key={index}
          ref={(el) => (textItemRefs.current[index] = el)}
          className={styles.inputList}
          value={item.value}
          onChange={(e) => onHandleInputTextChange(e, index)}
          onBlur={(e) => onHandleInputTextBlur(e, index)}
          onFocus={(e) => onHandleInputTextFocus(e, index)}
          onMouseDown={(e) => onHandleMouseDown(e, index)}
          style={{
            ...item.positionStyle,
            resize: item.resize,
            cursor: dragable ? "grabbing" : "text",
          }}
        />
      ))}
    </div>
  );
});

export default InputTextList;
