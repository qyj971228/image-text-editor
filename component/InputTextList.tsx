import { useEffect, useState } from 'react'
import InputTextItem, { InputItem } from './InputTextItem'

export default function InputTextList(props: {
  list: InputItem[]
}) {
  const { list } = props

  useEffect(() => {
    setinputTextList(list)
  }, [list])

  const [inputTextList, setinputTextList] = useState<InputItem[]>(list)

  // 文字失去焦点
  const onHandleInputTextBlur = (
    event: React.FocusEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.target.value === '') {
      let list = inputTextList.slice(0, index).concat(inputTextList.slice(index + 1)) // 删除值为空的元素
      setinputTextList(list)
    }
  }

  // 文字输入
  const onHandleInputTextChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = event.target.value
    const list = inputTextList.map((el, i) => {
      if (i === index) {
        return { ...el, value }
      }
      return { ...el }
    })
    setinputTextList(list)
  }

  return inputTextList.map((item, index) => (
    <InputTextItem
      item={item}
      index={index}
      key={index}
      onChange={onHandleInputTextChange}
      onBlur={onHandleInputTextBlur}
    />
  ))
}
