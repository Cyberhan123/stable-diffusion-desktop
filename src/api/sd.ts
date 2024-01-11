import {invoke} from '@tauri-apps/api/tauri'

export const txt2img = () => {
    return invoke('my_custom_command', {value: 'Hello, Async!'})
}
