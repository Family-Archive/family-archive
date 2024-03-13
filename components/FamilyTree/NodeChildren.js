import styles from './NodeChildren.module.scss'
import TreeNode from './TreeNode'
import { useEffect, useRef, useState } from 'react'

const NodeChildren = ({children}) => {
  const nodeChildrenRef = useRef(null)
  const [childMiddleOffsets, setChildMiddleOffsets] = useState([])
  const [barLeft, setBarLeft] = useState(0)
  const [barWidth, setBarWidth] = useState(0)

  useEffect(() => {
    const childNodes = nodeChildrenRef.current.querySelectorAll(':scope > .nodeChild')
    setChildMiddleOffsets(Array.from(childNodes).map(node => {
      return parseInt(node.offsetWidth / 2) + node.offsetLeft
    }))
  }, [])

  useEffect(() => {
    setBarLeft(childMiddleOffsets.length > 1 ? childMiddleOffsets[0] : 0)
    setBarWidth(childMiddleOffsets.length > 1 ? (childMiddleOffsets.at(-1) - childMiddleOffsets[0]) : 0)
    console.log({childMiddleOffsets, barLeft, barWidth})
  }, [childMiddleOffsets]) 

  return (
    <div 
      className={`${styles.nodeChildren} nodeChildren`}
      ref={nodeChildrenRef}
    >
      <div 
        className={styles.horizontalBar}
        style={{
          left: `${barLeft}px`,
          width: `${barWidth}px`,
        }}
      ></div>
      {children.map((child, index) => {
        return (
          <>
          <div 
            className={styles.verticalBar}
            style={{
              left: `${childMiddleOffsets[index]}px`
            }}
            key={index}
          ></div>
          <TreeNode
            key={child.id}
            id={child.id}
            people={child.people}
            children={child.children}
          />
          </>
        )
      })}
    </div>
  )
}

export default NodeChildren
