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

export interface InputTextListExposedMethods {
  addText: (newInput: InputItem) => void;
}

const InputTextList = forwardRef((props: { dragable: boolean }, ref) => {
  const { dragable } = props;
  const dragableRef = useRef<boolean>(dragable);

  const [inputTextList, setinputTextList] = useState<InputItem[]>([]);
  const inputTextListRef = useRef<InputItem[]>([]);
  const textItemRefs = useRef<Array<HTMLTextAreaElement | null>>([]);

  useEffect(() => {
    dragableRef.current = dragable;
  }, [dragable]);

  // 监听textarea的resize事件
  useEffect(() => {
    inputTextListRef.current = inputTextList; // 保存上一次的值用于在监听回调中使用

    const textareas = textItemRefs.current;

    const handleResize = () => {
      setinputTextList([...inputTextList]); // 触发重新渲染
    };

    const resizeObserver = new ResizeObserver(handleResize);
    textareas.forEach((textarea) => {
      textarea && resizeObserver.observe(textarea);
    });

    return () => {
      resizeObserver.disconnect();
    };
  }, [inputTextList]);

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    // 新增文字元素
    addText: (newInput: InputItem) => {
      setinputTextList([...inputTextList, newInput]);
      setTimeout(() => {
        textItemRefs.current[textItemRefs.current.length - 1]?.focus(); // 获取焦点
      }, 0);
    },
  }));

  // 输入
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
  // 失去焦点
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

  const dragging = useRef(false);
  const activeIndex = useRef(0);
  const initX = useRef(0);
  const initY = useRef(0);

  function mousedown(event: any) {
    if (!dragableRef.current) return;
    dragging.current = true;
    initX.current = event.clientX;
    initY.current = event.clientY;
  }

  function mouseup(event: any) {
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

  useEffect(() => {
    document.addEventListener("mousedown", mousedown);
    document.addEventListener("mouseup", mouseup);
    document.addEventListener("mousemove", mousemove);
    return () => {
      document.removeEventListener("mousedown", mousedown);
      document.removeEventListener("mouseup", mouseup);
      document.removeEventListener("mousemove", mousemove);
    };
  }, []);

  function onHandleMouseDown(event: MouseEvent, index: number) {
    event.stopPropagation();
    activeIndex.current = index;
  }

  return (
    <div>
      {inputTextList.map((item, index) => (
        <React.Fragment key={index}>
          {/* <div
            className={styles.textBox}
            onMouseDown={(e) => onHandleMouseDown(e, index)}
            style={{
              ...item.positionStyle,
              top: item.positionStyle.top
                ? Number(item.positionStyle.top) - 10
                : 0,
              left: item.positionStyle.left
                ? Number(item.positionStyle.left) - 10
                : 0,
              height: textItemRefs.current[index]?.clientHeight,
              width: textItemRefs.current[index]?.clientWidth,
            }}
          ></div> */}
          <textarea
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
        </React.Fragment>
      ))}
    </div>
  );
});

export default InputTextList;
