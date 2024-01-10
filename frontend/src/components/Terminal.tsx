import {useMount, useUnmount} from "ahooks";
import {useRef, useState} from "react";
import {Terminal as XTerminal} from "xterm";
import "xterm/css/xterm.css";
import {FitAddon} from "xterm-addon-fit";
import {EventsOn} from "../../wailsjs/runtime";
import {Select} from "antd";

const Terminal = () => {
    const [logLevel, setLogLevel] = useState<number>(1); // 0: debug, 1: info, 2: warn, 3: error
    const terminal = useRef<XTerminal>(null);
    const terminalContainerRef = useRef<HTMLDivElement>(null);
    useMount(() => {
        EventsOn("log", (level, text) => {
            if (!!terminal?.current) {
                if (level < logLevel) {
                    return;
                }
                terminal.current.write(`${text}\r`);
                terminal.current.flush();
            }
            console.log(text)
        });
        terminal.current = new XTerminal({
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            fontWeight: 1,
            fontSize: 12,
            theme: {
                background: "rgb(42,42,42)",
            },
            rows: Math.ceil(
                (terminalContainerRef.current.clientHeight -
                    150) /
                14
            ),
        });
        terminal.current.open(terminalContainerRef.current);
        const fitAddon = new FitAddon();
        terminal.current.loadAddon(fitAddon);
        fitAddon.fit();
    })
    useUnmount(() => {
        terminal.current?.dispose?.()
    })
    return <div>
        <Select
            onChange={(value) => setLogLevel(value)}
            value={logLevel}
            defaultValue={1}
            style={{width: 120, marginBottom: 12}}
            options={[
                {label: "Debug", value: 0},
                {label: "Info", value: 1},
                {label: "Warn", value: 2},
                {label: "Error", value: 3},
            ]}
        />
        <div ref={terminalContainerRef} style={{width: "100%", height: 200}}/>
    </div>

}
export default Terminal;