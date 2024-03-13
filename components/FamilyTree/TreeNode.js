import styles from './TreeNode.module.scss'
import Person from './Person'
import NodeChildren from './NodeChildren'
import { forwardRef } from 'react'

const TreeNode = forwardRef(({id, people, children}, ref) => {
  return (
    <div 
      className={`${styles.treeNodeContainer} nodeChild`}
      ref={ref}
    >
      <div className={styles.treeNode}>
        {children.length > 0 && <div className={styles.verticalBar}></div>}
        {people.map((person, index) => {
          return (
            <Person
              key={person.id}
              id={person.id}
              fullName={person.fullName}
              born={person.born}
              died={person.died}
              image={person.profileImageId}
            />
          )
        })}
      </div>
      {children.length > 0 && 
        <NodeChildren
          children={children}
        />
      }
    </div>
  )
})

export default TreeNode
