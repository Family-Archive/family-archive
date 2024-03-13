import styles from './Person.module.scss'

const Person = ({id, fullName, born, died, image}) => {
  return (
    <div className={styles.person}>
      <img src={`/api/file/${image}`} />
      <div className={styles.nameContainer}>{fullName.split(' ').map(name => {
        return (
          <div>{name}</div>
        )
      })}</div>
    </div>
  )
}

export default Person
