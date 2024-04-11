"use client"

import { useEffect, useState } from 'react'
import SelectorInput from '@/components/SelectorInput/SelectorInput'

const PronounSelector = ({ value, index, onChange }) => {
  const [pronouns, setpronouns] = useState([])
  const [fieldValue, setfieldValue] = useState(value)

  const updateValue = (value) => {
    setfieldValue(value)
    onChange ? onChange({
      target: {
        value: value,
        dataset: {
          index: index
        }
      }
    }) : ""
  }

  useEffect(() => {
    const fetchPronouns = async () => {
      let pronouns = await fetch('/api/pronounset')
      pronouns = await pronouns.json()
      setpronouns(pronouns.data.pronounSets)
      updateValue(fieldValue || pronouns.data.pronounSets[0].id)
    }
    fetchPronouns()
  }, [])

  return (
    <div style={{ marginBottom: '1rem' }}>
      {pronouns.length > 0 ?
        <>
          <input type='hidden' id='pronounsField' value={fieldValue} />
          <SelectorInput
            options={pronouns.map(pronounSet => {
              const pronounString = `${pronounSet.subject} / ${pronounSet.object} / ${pronounSet.possessive}`
              return { value: pronounSet.id, name: pronounString }
            })}
            defaultOption={fieldValue}
            onChange={e => updateValue(e)}
          />
        </>
        : ""
      }
    </div>
  )
}

export default PronounSelector