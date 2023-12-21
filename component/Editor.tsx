"use client";
import { useRef, useState } from "react";
import styles from "./Editor.module.css";
import InputTextList, {
  InputTextListExposedMethods, Resize,
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

  // 点击图片位置
  const onHandleImgClick = (event: React.MouseEvent<HTMLImageElement>) => {
    const { pageX, pageY } = event;
    const rect = inputBoxRef.current?.getBoundingClientRect();
    const left = rect?.left ?? 0;
    const top = rect?.top ?? 0;
    const newInput = {
      value: "",
      positionStyle: { top: pageY - top, left: pageX - left },
      resize: Resize.Both,
    };
    inputTextInputRef.current?.addText(newInput);
  };

  return (
    <div>
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
      {imgSrc && (
        <div ref={inputBoxRef} className={styles.inputBox}>
          <img
            className={styles.img}
            src={imgSrc}
            onClick={onHandleImgClick}
          ></img>
          <InputTextList ref={inputTextInputRef} />
        </div>
      )}
    </div>
  );
}
