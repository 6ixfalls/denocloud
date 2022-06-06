import React from "react";
import { useParams } from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import { basicSetup } from "@codemirror/basic-setup";
import { javascript, javascriptLanguage } from "@codemirror/lang-javascript";
import { autocompletion, CompletionContext } from "@codemirror/autocomplete";
import { oneDark } from "./one-dark";
import { syntaxTree } from "@codemirror/language";
import { Loading } from "@supabase/ui";

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

class EditorComponent extends React.Component<{ project: string }, { code: string | undefined, loading: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = {
            code: 'console.log("Welcome to DenoCloud!");',
            loading: true,
        };
    }

    async componentDidMount() {
        const { data, error } = await globalThis.supabaseClient.storage.from("worker-storage").download(globalThis.supabaseClient.auth.user()?.id + "/" + this.props.project + ".js");
        if (error) {
            this.setState({ code: 'console.log("Welcome to DenoCloud!");', loading: false });
        } else {
            this.setState({ code: await data?.text(), loading: false });
        }
    }

    render() {
        return (
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
        );
    }
}

export default function Editor() {
    return (
        <div>
            <EditorComponent project={useParams().project || ""} />
        </div>
    );
}