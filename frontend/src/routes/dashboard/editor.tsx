import CodeMirror from "@uiw/react-codemirror";
import { javascript, javascriptLanguage } from "@codemirror/lang-javascript";
import { autocompletion, CompletionContext } from "@codemirror/autocomplete";
import { oneDark } from "@codemirror/theme-one-dark";
import { syntaxTree } from "@codemirror/language"

const completePropertyAfter = ["PropertyName", ".", "?."]
const dontCompleteIn = ["TemplateString", "LineComment", "BlockComment",
    "VariableDefinition", "PropertyDefinition"]

function completeProperties(from: number, object: Object) {
    let options = []
    for (let name in object) {
        options.push({
            label: name,
            //@ts-ignore idk
            type: typeof object[name] == "function" ? "function" : "variable"
        })
    }
    return {
        from,
        options,
        validFor: /^[\w$]*$/
    }
}

function completeFromGlobalScope(context: CompletionContext) {
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

export default function Editor() {
    return (
        <CodeMirror
            value='console.log("Welcome to DenoCloud!");'
            height="500px"
            theme={oneDark}
            extensions={[javascript({ jsx: true }), javascriptLanguage.data.of({ autocompletion: completeFromGlobalScope }), autocompletion({ activateOnTyping: true })]}
            onChange={(value, viewUpdate) => {
                console.log("value:", value);
            }}
        />
    );
}