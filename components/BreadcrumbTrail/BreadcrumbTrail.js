"use client"

import styles from './BreadcrumbTrail.module.scss'

import { useEffect, useState, useContext } from 'react'
import Link from 'next/link'
import { BreadcrumbContext } from '@/app/(contexts)/BreadcrumbContext'

const BreadcrumbTrail = () => {
    const breadcrumbContext = useContext(BreadcrumbContext)
    const [trail, settrail] = useState([])

    useEffect(() => {
        settrail(breadcrumbContext.trail)
    }, [breadcrumbContext.trail])

    return (
        <div className={styles.BreadcrumbTrail}>
            {trail.map((node, index) => {
                return <span key={node.path + index}>
                    <Link href={node.path}>{node.name}</Link>
                </span>
            })}
        </div>
    )
}

export default BreadcrumbTrail