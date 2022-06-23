import { IconX } from "@supabase/ui";
import Input from "./Form/Input";
import { useFormContext } from "./Form/FormContext";
import React, { useState } from "react";
import { FieldArray, ArrayHelpers } from "./FieldArray";

const KeyRegex = new RegExp(/[a-zA-Z_]+[a-zA-Z0-9_]*/);

interface KeyValuePair {
    key: string,
    value: string
}

interface Props {
    labelKey: string,
    labelValue: string,
    valueKey: string,
    onChange?: (x: React.ChangeEvent<HTMLInputElement>) => void
}

export default function KeyValue({
    labelKey,
    labelValue,
    valueKey = "keyvalue",
}: Props) {

    const { values } = useFormContext();
    const [inputError, setInputError] = useState<string>("");

    /*
    const [keys, setKeys] = useState<string[]>(value);

    const updateValues = (key: string, value?: string) => {
        const newValues = structuredClone(values[valueKey]);
        newValues[key] = value;

        const event = {
            target: {
                type: "text",
                name: valueKey,
                value: newValues
            }
        } as React.ChangeEvent<HTMLInputElement>;
        if (formContextOnChange) formContextOnChange(event);
    }

    const onNewKey = (input: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
        const inputValue = input.currentTarget.value.trim();

        if (inputValue && !keys.includes(inputValue)) {
            setKeys([...keys, inputValue]);
            updateValues(inputValue, inputValue);
            input.currentTarget.value = "";
        }
    }*/

    return (
        <div className="flex flex-col font-normal text-base">
            <div className="flex flex-row justify-between items-end text-scale-1100 text-sm" key="title">
                <span className="basis-1/2 m-2 ml-0 my-0">{labelKey}</span>
                <span className="basis-1/2 m-2 my-0">{labelValue}</span>
                <div className="block w-[21px] h-[21px]"></div>
            </div>
            <FieldArray
                name={valueKey}
                render={(arrayHelpers: ArrayHelpers) => (
                    <div>
                        {values[valueKey].length > 0 && values[valueKey].map((env: KeyValuePair, index: number) => {
                            return (
                                <div className="flex flex-row justify-between items-end" key={env.key} id="env-container">
                                    <Input className="basis-1/2 m-2 ml-0" layout="vertical" defaultValue={env.key} key="key" name={`${valueKey}.${index}.key`} disabled />
                                    <Input className="basis-1/2 m-2" layout="vertical" defaultValue={env.value} key="value" name={`${valueKey}.${index}.value`} />
                                    <IconX className="cursor-pointer mb-4" color="#a0a0a0" fill="#a0a0a0" stroke="#a0a0a0" onClick={() => {
                                        arrayHelpers.remove(index)
                                    }} />
                                </div>
                            )
                        })}
                        <div className="flex flex-row justify-between items-start" key="new">
                            <Input className="basis-1/2 m-2 ml-0" layout="vertical" key="keynew" placeholder="Create New..." error={inputError} onBlur={(input) => {
                                if (input.currentTarget) {
                                    const newArr = structuredClone(values[valueKey]);
                                    newArr.push({ key: input.currentTarget.value, value: "" });

                                    if (KeyRegex.test(input.currentTarget.value)) {
                                        if (newArr.length === new Set(newArr.map((a: KeyValuePair) => a.key)).size) {
                                            arrayHelpers.push({ key: input.currentTarget.value, value: "" });
                                            input.currentTarget.value = "";
                                        } else {
                                            setInputError("Duplicate parameter name");
                                        }
                                    } else {
                                        setInputError("Parameter name contains invalid characters");
                                    }
                                }
                            }} onKeyDown={(input) => {
                                if (input.key === "Enter" && input.currentTarget) {
                                    input.preventDefault();
                                    const newArr = structuredClone(values[valueKey]);
                                    newArr.push({ key: input.currentTarget.value, value: "" });

                                    if (KeyRegex.test(input.currentTarget.value)) {
                                        if (newArr.length === new Set(newArr.map((a: KeyValuePair) => a.key)).size) {
                                            arrayHelpers.push({ key: input.currentTarget.value, value: "" });
                                            input.currentTarget.value = "";
                                        } else {
                                            setInputError("Duplicate parameter name");
                                        }
                                    } else {
                                        setInputError("Parameter name contains invalid characters");
                                    }
                                }
                            }} onChange={(input) => {
                                const newArr = structuredClone(values[valueKey]);
                                newArr.push({ key: input.currentTarget.value, value: "" });

                                if (KeyRegex.test(input.currentTarget.value)) {
                                    if (newArr.length === new Set(newArr.map((a: KeyValuePair) => a.key)).size) {
                                        setInputError("");
                                    } else {
                                        setInputError("Duplicate parameter name");
                                    }
                                } else {
                                    setInputError("Parameter name contains invalid characters");
                                }
                            }} shouldHandleFormik={false} />
                            <Input className="basis-1/2 m-2" layout="vertical" key="valuenew" disabled />
                            <div className="block w-[21px] h-[21px]"></div>
                        </div>
                    </div>
                )}
            />

        </div>
    )
}