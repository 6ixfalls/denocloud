import { useRef, useEffect, useState, FormEvent, KeyboardEvent, ReactNode } from 'react'
import { orderBy, filter, without } from 'lodash'
import { IconCheck, IconAlertCircle, IconSearch } from '@supabase/ui'
import Popover from './Popover'

import { BadgeDisabled, BadgeSelected } from './Badges'

export interface MultiSelectOption {
    id: string | number
    value: string
    name: string
    disabled: boolean
}

interface Props {
    options: MultiSelectOption[]
    value: string[]
    label?: string
    placeholder?: string | ReactNode
    searchPlaceholder?: string
    descriptionText?: string | ReactNode
    emptyMessage?: string | ReactNode
    emptyMessageGenerator?: (input: string) => string | ReactNode
    onChange?(x: string[]): void
    removeBorderDiv?: boolean
}

/**
 * Copy styling from supabase/ui default.theme
 * input base + standard
 */

export default function MultiSelect({
    options,
    value,
    label,
    descriptionText,
    placeholder,
    searchPlaceholder = 'Search for option',
    emptyMessage,
    emptyMessageGenerator,
    onChange = () => { },
    removeBorderDiv = false,
}: Props) {
    const ref = useRef(null)

    const [selected, setSelected] = useState<string[]>(value || [])
    const [searchString, setSearchString] = useState<string>('')
    const [inputWidth, setInputWidth] = useState<number>(128)

    // Calculate width of the Popover
    useEffect(() => {
        const handleResize = () => {
            setInputWidth(ref.current ? (ref.current as any).offsetWidth : inputWidth)
        }

        handleResize()
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [ref, inputWidth])

    const width = `${inputWidth}px`

    // Order the options so disabled items are at the beginning
    const formattedOptions = orderBy(options, ['disabled'], ['desc'])

    // Options to show in Popover menu
    const filteredOptions =
        searchString.length > 0
            ? filter(formattedOptions, (option) => !option.disabled && option.name.includes(searchString))
            : filter(formattedOptions, { disabled: false })

    const checkIfActive = (option: MultiSelectOption) => {
        const isOptionSelected = (selected || []).find((x) => x === option.value)
        return isOptionSelected !== undefined
    }

    const handleChange = (option: MultiSelectOption) => {
        const _selected = selected
        const isActive = checkIfActive(option)

        const updatedPayload = isActive
            ? [...without(_selected, option.value)]
            : [..._selected.concat([option.value])]

        // Payload must always include disabled options
        const compulsoryOptions = options
            .filter((option) => option.disabled)
            .map((option) => option.name)
        const formattedPayload = [...new Set(updatedPayload.concat(compulsoryOptions))]

        setSelected(formattedPayload)
        onChange(formattedPayload)
    }

    const onKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (searchString.length > 0 && filteredOptions.length === 1) {
                handleChange(filteredOptions[0])
            }
        }
    }

    return (
        <div className="form-group">
            {label && <label className="font-normal text-scale-1100 text-sm">{label}</label>}
            <div
                className={[
                    'form-control form-control--multi-select',
                    'bg-scaleA-200 border-scale-700 border',
                    'multi-select relative block w-full space-x-1 overflow-auto rounded',
                ].join(' ')}
                ref={ref}
            >
                <Popover
                    sideOffset={4}
                    side="bottom"
                    align="start"
                    style={{ width }}
                    buttonClassName="w-full"
                    header={
                        <div className="flex items-center space-x-2 py-1">
                            <IconSearch size={14} color="#a0a0a0" stroke="#a0a0a0" />
                            <input
                                autoFocus
                                className="placeholder-scale-1000 text-scale-1100 w-full bg-transparent text-sm outline-none"
                                value={searchString}
                                placeholder={searchPlaceholder}
                                onKeyPress={onKeyPress}
                                onChange={(e: FormEvent<HTMLInputElement>) =>
                                    setSearchString(e.currentTarget.value)
                                }
                            />
                        </div>
                    }
                    overlay={
                        <div className="max-h-[225px] space-y-1 overflow-y-auto p-1">
                            {filteredOptions.length >= 1 ? (
                                filteredOptions.map((option) => {
                                    const active =
                                        selected &&
                                            selected.find((selected) => {
                                                return selected === option.value
                                            })
                                            ? true
                                            : false

                                    return (
                                        <div
                                            key={`multiselect-option-${option.value}`}
                                            onClick={() => handleChange(option)}
                                            className={[
                                                'text-scale-1100 font-normal',
                                                'flex cursor-pointer items-center justify-between transition',
                                                'space-x-1 rounded bg-transparent p-2 px-4 text-sm hover:bg-gray-600',
                                                `${active ? ' dark:bg-green-600 dark:bg-opacity-25' : ''}`,
                                            ].join(' ')}
                                        >
                                            <span>{option.name}</span>
                                            {active && (
                                                <IconCheck
                                                    size={16}
                                                    strokeWidth={3}
                                                    className={`cursor-pointer transition ${active ? ' dark:text-green-900' : ''
                                                        }`}
                                                />
                                            )}
                                        </div>
                                    )
                                })
                            ) : options.length === 0 ? (
                                <div
                                    className={removeBorderDiv ? [
                                        'dark:border-dark flex h-full w-full flex-col',
                                        'items-center justify-center p-3',
                                    ].join(' ') : ""}
                                >
                                    {emptyMessageGenerator ? (emptyMessageGenerator(searchString)) : emptyMessage ? (
                                        emptyMessage
                                    ) : (
                                        <div className="flex w-full items-center space-x-2">
                                            <IconAlertCircle strokeWidth={1.5} size={18} color="#a0a0a0" stroke="#a0a0a0" />
                                            <p className="text-scale-1000 text-sm">No options available</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div
                                    className={removeBorderDiv ? [
                                        'dark:border-dark flex h-full w-full flex-col',
                                        'items-center justify-center p-3',
                                    ].join(' ') : ""}
                                >
                                    {emptyMessageGenerator ? (emptyMessageGenerator(searchString)) : emptyMessage ? (
                                        emptyMessage
                                    ) : (
                                        <div className="flex w-full items-center space-x-2">
                                            <p className="text-scale-1000 text-sm">No options found</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    }
                    onOpenChange={() => setSearchString('')}
                >
                    <div
                        className={[
                            'flex w-full flex-wrap items-start gap-1.5 p-1.5 font-normal text-scale-1200',
                            `${selected.length === 0 ? 'h-9' : ''}`,
                        ].join(' ')}
                    >
                        {selected.length === 0 && placeholder && (
                            <div className="text-scale-800 px-2 text-sm font-normal" key="multi-select-placeholder">{placeholder}</div>
                        )}
                        {/* eslint-disable-next-line */}
                        {formattedOptions.map((option) => {
                            const active =
                                selected &&
                                selected.find((selected) => {
                                    return selected === option.value
                                })

                            if (option.disabled) {
                                return <BadgeDisabled key={option.id} name={option.name} />
                            } else if (active) {
                                return (
                                    <BadgeSelected
                                        key={option.id}
                                        name={option.name}
                                        handleRemove={() => handleChange(option)}
                                    />
                                )
                            }
                        })}
                    </div>
                </Popover>
            </div>

            {descriptionText && <span className="form-text text-muted">{descriptionText}</span>}
        </div>
    )
}