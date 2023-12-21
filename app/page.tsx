'use client'
import { useRef, useState } from 'react'
import styles from './page.module.css'
import InputTextList from '@/component/InputTextList'
import { InputItem } from '@/component/InputTextItem'

export default function Home() {
  const [imgSrc, setimgSrc] = useState<string>() // 图片src
  const inputBoxRef = useRef<HTMLDivElement | null>(null) // 图片展示框
  const [inputList, setInputList] = useState<InputItem[]>([]) // 输入文字列表

  // 选择图片并显示
  const onHandleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) return
    const file = event.target.files[0]
    showImg(file)
  }

  // 展示图片
  const showImg = (file: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      setimgSrc(e.target?.result as string)
    }
  }

  // 点击图片位置
  const onHandleImgClick = (event: React.MouseEvent<HTMLImageElement>) => {
    const { pageX, pageY } = event
    const rect = inputBoxRef.current?.getBoundingClientRect()
    const left = rect?.left ?? 0
    const top = rect?.top ?? 0
    const newInput = {
      value: '请输入文字',
      positionStyle: { top: pageY - top, left: pageX - left },
    }
    setInputList([...inputList, newInput]) // 新增文字元素
    // TODO: 聚焦文字元素
  }

  return (
    <main>
      <input
        id='fileInput'
        className={styles.fileInput}
        type='file'
        accept='image/*'
        onChange={onHandleFileInputChange}
      />
      {!imgSrc && (
        <label htmlFor='fileInput' className={styles.label}>
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
          <InputTextList list={inputList} />
        </div>
      )}
    </main>
  )
}
