"use client";
import { ChangeEvent, use, useRef, useState } from "react";
import styles from "./Editor.module.css";
import InputTextList, {
  InputItem,
  InputTextListExposedMethods,
  Resize,
} from "@/component/InputTextList";

export default function Editor() {
  const [imgSrc, setimgSrc] = useState<string>(); // 图片src
  const inputBoxRef = useRef<HTMLDivElement | null>(null); // 图片展示框

  const inputTextInputRef = useRef<InputTextListExposedMethods>(null);

  // 选择图片并显示
  const onHandleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    showImg(file);
  };

  // 展示图片
  const showImg = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      setimgSrc(e.target?.result as string);
    };
  };

  // 点击图片新增文字
  const onHandleImgClick = (event: React.MouseEvent<HTMLImageElement>) => {
    const { pageX, pageY } = event;
    const rect = inputBoxRef.current?.getBoundingClientRect();
    const left = rect?.left ?? 0;
    const top = rect?.top ?? 0;
    const newInput = {
      value: "",
      positionStyle: {
        top: pageY - top,
        left: pageX - left,
        color: selectedColor,
        fontSize: inputFontSize + "px",
        fontWeight: fontBold ? "bold" : "normal",
        fontFamily: selectedFont,
      },
      resize: Resize.Both,
    } as InputItem;
    inputTextInputRef.current?.addText(newInput);
  };

  /**
   * 控制工具
   */

  const [dragable, setDragable] = useState<boolean>(false); // 是否可拖拽
  function oppositeDragable() {
    setDragable(!dragable);
  }

  const [selectedColor, setSelectedColor] = useState("#000000");
  const onHandleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedColor(event.target.value);
  };

  const [inputFontSize, setInputFontSize] = useState(16);
  const onHandleFontSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputFontSize(Number(event.target.value));
  };

  const [fontBold, setfontBold] = useState<boolean>(false);
  const oppositeFontBold = () => {
    setfontBold(!fontBold);
  };

  const [selectedFont, setSelectedFont] = useState("Arial");
  const changeFont = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedFont(event.target.value);
  };

  return (
    <div>
      {/* 控制工具 */}
      <div>
        {/* 拖拽开关 */}
        <button onClick={oppositeDragable}>
          拖拽：{dragable ? "开" : "关"}
        </button>
        {/* 颜色选取 */}
        <input
          type="color"
          value={selectedColor}
          onChange={onHandleColorChange}
        />
        {/* 字体大小 */}
        <span>字体大小：</span>
        <input type="number" value={inputFontSize} onChange={onHandleFontSizeChange}></input>
        {/* 粗体开关 */}
        <button onClick={oppositeFontBold}>
          粗体：{fontBold ? "开" : "关"}
        </button>
        {/* 字体选择 */}
        <span>字体选择</span>
        <select value={selectedFont} onChange={changeFont}>
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
        </select>
      </div>
      {/* 文件选取 */}
      <input
        id="fileInput"
        className={styles.fileInput}
        type="file"
        accept="image/*"
        onChange={onHandleFileInputChange}
      />
      {!imgSrc && (
        <label htmlFor="fileInput" className={styles.label}>
          点击此处添加图片
        </label>
      )}
      {/* 图片与文字 */}
      {imgSrc && (
        <div
          ref={inputBoxRef}
          className={styles.inputBox}
          style={{ cursor: dragable ? "grabbing" : "text" }}
        >
          <img
            className={styles.img}
            src={imgSrc}
            onClick={onHandleImgClick}
          ></img>
          <InputTextList dragable={dragable} ref={inputTextInputRef} />
        </div>
      )}
    </div>
  );
}
