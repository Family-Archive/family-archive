"use client"

import { useEffect, useState } from 'react'
import SelectorInput from '@/components/SelectorInput/SelectorInput'

const Selector = ({ value, index, onChange }) => {
    const [options, setoptions] = useState(value)

    const updateValue = (value) => {
        onChange({
            target: {
                value: value,
                dataset: {
                    index: index
                }
            }
        })
    }

    useEffect(() => {
        updateValue(value.defaultOption)
    }, [])

    return (
        <div style={{ marginBottom: '1rem' }}>
            <SelectorInput
                direction="down"
                options={options.options}
                defaultOption={options.defaultOption}
                onChange={e => updateValue(e)}
            />
        </div>
    )
}

export default Selector