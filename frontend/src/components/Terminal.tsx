import {useMount, useUnmount} from "ahooks";
import {useRef} from "react";
import {Terminal as XTerminal} from "xterm";
import "xterm/css/xterm.css";
import {FitAddon} from "xterm-addon-fit";
import {EventsOn} from "../../wailsjs/runtime";

const Terminal = () => {
    const terminal = useRef<XTerminal>(null);
    const terminalContainerRef = useRef<HTMLDivElement>(null);
    useMount(() => {
        EventsOn("stdout", (data) => {
            console.log(data)
        });
        terminal.current = new XTerminal({
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            fontWeight: 400,
            fontSize: 14,
            rows: Math.ceil(
                (terminalContainerRef.current.clientHeight -
                    150) /
                14
            ),
        });
        terminal.current.open(terminalContainerRef.current);
        terminal.current.write("\r\n\x1b[33m$\x1b[0m ");
        const fitAddon = new FitAddon();
        terminal.current.loadAddon(fitAddon);
        fitAddon.fit();
    })
    useUnmount(() => {
        terminal.current?.dispose?.()
    })
    return <div ref={terminalContainerRef} style={{width: "100%", height: 200}}/>
}
export default Terminal;