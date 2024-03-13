"use client"

import styles from './FamilyTree.module.scss'
import TreeNode from './TreeNode'
import { useRef } from 'react'

const FamilyTree = ({tree}) => {
  const rootNodeRef = useRef(null)

  const changeZoomLevel = (direction) => {
    const zoomRate = 0.2
    const currentScale = rootNodeRef.current.style.scale === '' ? 1 : Number(rootNodeRef.current.style.scale)

    if (direction === 'out') {
      rootNodeRef.current.style.scale = `${currentScale - zoomRate}`
    }

    if (direction === 'in') {
      rootNodeRef.current.style.scale = `${currentScale + zoomRate}`
    }
  }

  return (
    <>
      <div className={styles.treeContainer}>
        <TreeNode
          ref={rootNodeRef}
          id={tree.id}
          people={tree.people}
          children={tree.children}
        />
      </div>
      <div className={styles.zoomControls}>
        <button
          className='tertiary'
          style={{ borderRadius: '99rem 0 0 99rem', borderRight: '1px solid grey' }}
          onClick={() => changeZoomLevel('in')}
        >
          <span className={`material-icons`}>zoom_in</span>
        </button>
        <button
          className='tertiary'
          style={{ borderRadius: '0 99rem 99rem 0' }}
          onClick={() => changeZoomLevel('out')}
        >
          <span className={`material-icons`}>zoom_out</span>
        </button>
      </div>
    </>
  )
}

export default FamilyTree
