import {
  CSSProperties,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import styles from "./InputTextList.module.css";

export enum Resize {
  None = "none",
  Both = "both",
}

export interface InputItem {
  value: string;
  positionStyle: CSSProperties;
  resize: Resize.None | Resize.Both;
}

export interface InputTextListExposedMethods {
  addText: (newInput: InputItem) => void;
}

const InputTextList = forwardRef((props, ref) => {
  const [inputTextList, setinputTextList] = useState<InputItem[]>([]);
  const textItemRefs = useRef<Array<HTMLTextAreaElement | null>>([]);

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
    // 删除值为空的元素
    if (event.target.value === "") {
      const newList = list
        .slice(0, index)
        .concat(inputTextList.slice(index + 1));
      setinputTextList(newList);
    } else {
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

  return (
    <div>
      {inputTextList.map((item, index) => (
        <textarea
          ref={(el) => (textItemRefs.current[index] = el)}
          className={styles.inputList}
          value={item.value}
          key={index}
          onChange={(e) => onHandleInputTextChange(e, index)}
          onBlur={(e) => onHandleInputTextBlur(e, index)}
          onFocus={(e) => onHandleInputTextFocus(e, index)}
          style={{ ...item.positionStyle, resize: item.resize }}
        />
      ))}
    </div>
  );
});

export default InputTextList;
