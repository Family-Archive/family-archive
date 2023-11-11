"use client"
import styles from './FamilySelector.module.scss'

import { useEffect, useState, useRef } from 'react'

const FamilySelector = ({ value, index, onChange }) => {
  const [families, setfamilies] = useState([])
  const [matchingFamilies, setmatchingFamilies] = useState([])
  const [fieldValue, setfieldValue] = useState(value ? JSON.parse(value) : { families: [], defaultFamily: null })
  const [showMenu, setshowMenu] = useState(false)

  const updateValue = (value) => {
    setfieldValue(value)
    onChange({
      target: {
        value: JSON.stringify(value),
        dataset: {
          index: index
        }
      }
    })
  }

  const addFamily = (family) => {
    if (fieldValue.families.length == 0) {
      updateValue({ families: [family], defaultFamily: family.id })
      return
    }

    for (let activeFamily of fieldValue.families) {
      if (activeFamily.id == family.id) {
        return
      }
    }
    updateValue({ ...fieldValue, families: [...fieldValue.families, family] })
  }

  const removeFamily = (family) => {
    let tempFamilies = []
    for (let activeFamily of fieldValue.families) {
      if (activeFamily.id != family.id) {
        tempFamilies.push(activeFamily)
      }
    }

    let defaultFamily = fieldValue.defaultFamily
    if (family.id == fieldValue.defaultFamily) {
      defaultFamily = tempFamilies[0].id
    }

    updateValue({ families: tempFamilies, defaultFamily: defaultFamily })
  }

  useEffect(() => {
    const fetchfamilies = async () => {
      let families = await fetch('/api/family')
      families = await families.json()
      setfamilies(families.data.families)
      if (fieldValue.families.length === 0) {
        updateValue({ families: [families.data.families[0]], defaultFamily: families.data.families[0].id })
      }
    }
    fetchfamilies()
  }, [])

  // Handle clicks outside the component
  const myRef = useRef();
  const handleClickOutside = e => {
    if (!myRef.current.contains(e.target)) {
      setshowMenu(false)
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  });

  return (
    <div className={styles.FamilySelector} ref={myRef}>
      <div className={styles.activeFamilies}>
        {fieldValue.families.map(family => {
          return <div
            className={`${styles.family} ${fieldValue.defaultFamily === family.id ? styles.default : ""}`}
            key={family.id}
          >
            {family.name}
            <div className={styles.options}>
              {
                fieldValue.defaultFamily === family.id ? <span className={styles.defaultLabel}>
                  Default <span class="material-icons">done</span>
                </span>
                  : <button onClick={() => updateValue({ ...fieldValue, defaultFamily: family.id })} className='secondary' type='button'>Make default</button>
              }
              {fieldValue.families.length > 1 ?
                <a href="#"><span onClick={() => removeFamily(family)} className="material-icons">cancel</span></a>
                : ""
              }
            </div>
          </div>
        })}
      </div>
      <input
        type='text'
        id='familySearch'
        name='familySearch'
        autoComplete='off'
        placeholder='Search for families...'
        onFocus={() => setshowMenu(true)}
        onKeyUp={e => setmatchingFamilies(families.filter(family => family.name.toLowerCase().includes(e.target.value.toLowerCase())))}
      />
      {showMenu && matchingFamilies.length > 0 ?
        <div className={styles.dropdown}>
          {matchingFamilies.map(family => {
            for (let fam of fieldValue.families) {
              if (fam.id == family.id) {
                return
              }
            }

            return <button
              key={family.id}
              type="button"
              onClick={() => addFamily(family)}
            >
              {family.name}
            </button>
          })}
        </div>
        : ""
      }
    </div>
  )
}

export default FamilySelector