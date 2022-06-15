import React from 'react'
// @ts-ignore
import BadgeStyles from './Badge.module.css'

interface Props {
    color?:
    | 'brand'
    | 'scale'
    | 'tomato'
    | 'red'
    | 'crimson'
    | 'pink'
    | 'plum'
    | 'purple'
    | 'violet'
    | 'indigo'
    | 'blue'
    | 'cyan'
    | 'teal'
    | 'green'
    | 'grass'
    | 'brown'
    | 'orange'
    | 'sky'
    | 'mint'
    | 'lime'
    | 'yellow'
    | 'amber'
    | 'gold'
    | 'bronze'
    | 'gray'
    | 'mauve'
    | 'slate'
    | 'sage'
    | 'olive'
    | 'sand'
    children: string
    size?: 'large' | 'small'
    dot?: boolean
}

function Badge({ color, children, size, dot }: Props) {
    let classes = [BadgeStyles['sbui-badge']]
    if (color) {
        classes.push(BadgeStyles[`sbui-badge--${color}`])
    }
    if (size === 'large') {
        classes.push(BadgeStyles['sbui-badge--large'])
    }

    return (
        <span className={classes.join(' ')}>
            {dot && (
                <svg
                    className={`${BadgeStyles[`sbui-badge-dot`]} ${BadgeStyles[`sbui-badge--${color}`]
                        }`}
                    fill="currentColor"
                    viewBox="0 0 8 8"
                >
                    <circle className="animate-ping origin-center" cx="4" cy="4" r="5" />
                    <circle cx="4" cy="4" r="3" />
                </svg>
            )}

            {children}
        </span>
    )
}
export default Badge