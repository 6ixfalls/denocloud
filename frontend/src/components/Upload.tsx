import React, { useState } from 'react'
// @ts-ignore
import UploadStyles from './Upload.module.css'

function Upload({ label, children }: any) {
    return <h1>WIP</h1>
}

function Dragger({
    label,
    afterLabel,
    beforeLabel,
    layout,
    children,
    files,
    setFile,
    className,
    title,
}: any) {
    const [classes, setClasses] = useState([UploadStyles['sbui-upload-dragger']])

    const draggedCssClass = UploadStyles['sbui-upload-dragger--dragged']

    const dragOver = (e: any) => {
        e.preventDefault()

        if (!classes.includes(draggedCssClass)) {
            let originalClasses = classes
            originalClasses.push(draggedCssClass)
            setClasses(originalClasses)
        }
    }

    const dragEnter = (e: any) => {
        e.preventDefault()
        if (!classes.includes(draggedCssClass)) {
            console.log("enter")
            let originalClasses = classes
            originalClasses.push(draggedCssClass)
            setClasses(originalClasses)
        }
    }

    const dragLeave = (e: any) => {
        e.preventDefault()

        if (classes.includes(draggedCssClass)) {
            let newClasses = classes

            for (var i = 0; i < newClasses.length; i++) {
                if (newClasses[i] === draggedCssClass) {
                    newClasses.splice(i, 1)
                }
            }
            console.log("exit")
            setClasses(newClasses)
        }
    }

    const fileDrop = (e: any) => {
        e.preventDefault()
        const newFile = e.dataTransfer.files?.[0]
        setFile(newFile)
    }

    const fileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        const newFile = e.target.files?.[0]
        setFile(newFile)
    }

    return (
        <div
            onDragOver={dragOver}
            onDragEnter={dragEnter}
            onDragLeave={dragLeave}
            onDrop={fileDrop}
        >
            <label htmlFor="file-upload" className={classes.join(' ') + " " + className} title={title}>
                <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={fileUpload}
                    accept=".js"
                />

                {children}
            </label>
        </div>
    )
}

Upload.Dragger = Dragger
export default Upload