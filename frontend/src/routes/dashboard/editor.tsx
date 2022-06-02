import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

export default function Editor() {
    return (
        <CodeMirror
            value='console.log("Welcome to DenoCloud!");'
            height="500px"
            theme={oneDark}
            extensions={[javascript({ jsx: true })]}
            onChange={(value, viewUpdate) => {
                console.log("value:", value);
            }}
        />
      );
}