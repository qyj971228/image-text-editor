import { CSSProperties, ChangeEvent, FocusEvent, useState } from 'react'
import styles from './InputTextItem.module.css'

export type InputItem = {
  value: string
  positionStyle: CSSProperties
}

export default function InputTextItem(props: {
  item: InputItem
  index: number
  onChange: (event: ChangeEvent<HTMLInputElement>, index: number) => void
  onBlur: (event: FocusEvent<HTMLInputElement>, index: number) => void
}) {
  const { item, index, onChange, onBlur } = props

  const [showTool, setShowTool] = useState(true)
  const [fontStyle, setFontStyle] = useState<CSSProperties>({})

  const onHandleFocus = () => {
    setShowTool(true)
  }

  const onHandleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setShowTool(false)
    onBlur(e, index)
  }

  return (
    <>
      <input
        className={styles.inputList}
        value={item.value}
        onChange={(e) => onChange(e, index)}
        onBlur={onHandleBlur}
        onFocus={onHandleFocus}
        style={{ ...item.positionStyle, ...fontStyle }}
      />
      {showTool && (
        <div
          style={{
            ...item.positionStyle,
            position: 'absolute',
            transform: 'translateY(20px)',
          }}
        >
          字体工具
          {/* TODO: 颜色选择器, 字体大小选择器, 字体选择器, 粗体 */}
        </div>
      )}
    </>
  )
}
