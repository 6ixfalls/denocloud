import React from "react";
import { useParams } from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import { basicSetup } from "@codemirror/basic-setup";
import { javascript, javascriptLanguage } from "@codemirror/lang-javascript";
import { autocompletion, CompletionContext } from "@codemirror/autocomplete";
import { oneDark } from "./one-dark";
import { syntaxTree } from "@codemirror/language";
import { Loading, Button, IconUpload, Modal, Typography } from "@supabase/ui";
import Upload from "../../../components/Upload";
import Toast from "../../../components/Toast";
import { supabaseClient } from '../../../index';

const completePropertyAfter = ["PropertyName", ".", "?."]
const dontCompleteIn = ["TemplateString", "LineComment", "BlockComment",
    "VariableDefinition", "PropertyDefinition"]

function completeProperties(from: number, object: Object) {
    return {
        from,
        options: [],
        validFor: /^[\w$]*$/
    }
}

function completeFromGlobalScope(context: CompletionContext) {
    console.log("a");
    let nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1)

    if (completePropertyAfter.includes(nodeBefore.name) &&
        nodeBefore.parent?.name === "MemberExpression") {
        let object = nodeBefore.parent.getChild("Expression")
        if (object?.name === "VariableName") {
            let from = /\./.test(nodeBefore.name) ? nodeBefore.to : nodeBefore.from
            let variableName: any = context.state.sliceDoc(object.from, object.to)
            if (typeof window[variableName] == "object")
                return completeProperties(from, window[variableName])
        }
    } else if (nodeBefore.name === "VariableName") {
        return completeProperties(nodeBefore.from, window)
    } else if (context.explicit && !dontCompleteIn.includes(nodeBefore.name)) {
        return completeProperties(context.pos, window)
    }
    return null
}

class EditorComponent extends React.Component<{ project: string }, { code: string, loading: boolean, uploadOpen: boolean, errorOpen: boolean, errorMessage?: string, uploadFile?: File }> {
    constructor(props: any) {
        super(props);
        this.setFile = this.setFile.bind(this);
        this.state = {
            code: 'console.log("Welcome to DenoCloud!");',
            loading: true,
            uploadOpen: false,
            errorOpen: false
        };
    }

    async componentDidMount() {
        const { data, error } = await supabaseClient.storage.from("worker-storage").download(supabaseClient.auth.user()?.id + "/" + this.props.project + ".js");
        if (error) {
            this.setState({ code: 'console.log("Welcome to DenoCloud!");', loading: false });
        } else {
            this.setState({ code: await data?.text() || 'console.log("Welcome to DenoCloud!");', loading: false });
        }
    }

    async setFile(file: File) {
        const fileSizeMB = file.size / 1024 / 1024;
        if (file.name.endsWith(".js")) {
            if (fileSizeMB < 10) {
                this.setState({ uploadFile: file, uploadOpen: false, code: await file.text() });
            } else {
                this.setState({ errorOpen: true, errorMessage: "The file you uploaded exceeded the maximum size of 10 MB." });
            }
        } else {
            this.setState({ errorOpen: true, errorMessage: "The file you uploaded isn't a JS file!" });
        }
    }

    render() {
        return (
            <div>
                <Modal visible={this.state.errorOpen} customFooter={<div className="w-full flex flex-row mt-2"><Button type="outline" onClick={() => this.setState({ errorOpen: false })}>Confirm</Button></div>}>
                    <span className="w-11/12 mb-2 h-1/2"><h4 className="text-white text-lg font-bold p-5 pb-0">File Error</h4><span className="px-7 pb-2 font-normal text-white">{this.state.errorMessage}</span></span>
                </Modal>
                <Modal visible={this.state.uploadOpen} customFooter={<div className="w-full flex flex-row"><Button type="outline" onClick={() => this.setState({ uploadOpen: false })}>Cancel</Button></div>}>
                    <Upload.Dragger
                        layout="horizontal"
                        files={this.state.uploadFile}
                        setFile={this.setFile}
                    >
                        <div className="flex flex-col gap-8 justify-evenly">
                            <div className="space-y-1 text-center">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-1100"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <div className="flex text-sm text-gray-1100">
                                    <Typography.Text className="m-auto text-center">
                                        <span className="text-[#3ecf8e] font-normal underline">
                                            <Typography.Link
                                                style={{
                                                    textDecoration: 'none',
                                                }}
                                            >
                                                Upload a file
                                            </Typography.Link>
                                        </span>

                                        {' or drag and drop'}
                                    </Typography.Text>
                                </div>

                                <p className="text-xs text-gray-900">JS up to 50MB</p>
                                <p className="text-xs font-medium text-gray-1200">{this.state.uploadFile?.name}</p>
                            </div>
                        </div>
                    </Upload.Dragger>
                </Modal>
                <div className="w-full flex flex-row-reverse mt-3 right-5 absolute top-0 pointer-events-none">
                    <Button icon={<IconUpload />} size="medium" className="m-2 pointer-events-auto" onClick={() => this.setState({ uploadOpen: true })}>Upload File</Button>
                    <Button size="medium" className="m-2 pointer-events-auto" onClick={async () => {
                        const { error } = await supabaseClient.storage.from("worker-storage").update(supabaseClient.auth.user()?.id + "/" + this.props.project + ".js", this.state.code, { contentType: "text/javascript" });
                        if (error) {
                            Toast.toast(error.message, { type: "error" });
                        } else {
                            Toast.toast("Worker was uploaded to cloud", { type: "success" });
                        }
                    }}>Save and Deploy</Button>
                </div>
                <Loading active={this.state.loading}>
                    <CodeMirror
                        value={this.state.code}
                        className="pt-2"
                        height="90vh"
                        theme={oneDark}
                        extensions={[basicSetup, javascript({ jsx: true, typescript: true }), javascriptLanguage, javascriptLanguage.data.of({ autocompletion: completeFromGlobalScope }), autocompletion()]}
                        onChange={(value, viewUpdate) => {
                            console.log("value:", value);
                        }}
                    />
                </Loading>
            </div>
        );
    }
}

export default function Editor() {
    return (
        <EditorComponent project={useParams().project || ""} />
    );
}