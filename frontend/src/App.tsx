import {useState} from 'react';
import {App as AntdApp, Button, ConfigProvider, Flex, Layout, Segmented, Space, theme} from "antd";
import {AlertOutlined, FileImageOutlined, FileOutlined, FontColorsOutlined, SettingOutlined} from "@ant-design/icons";
import Predict from "./pages/Predict";
import {useRequest} from "ahooks";
import {GetOptions, LoadFromFile, SetOptions} from "../wailsjs/go/main/App";
import Settings from "./components/Settings";

import './App.css'

const {darkAlgorithm, defaultAlgorithm} = theme;

function App() {
    const [model, setModel] = useState<string | number>("text")
    const [hasLoadModel, setHasLoadModel] = useState(false)
    const [open, setOpen] = useState(false);
    const [isDark, setIsDark] = useState<boolean>(window?.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false);
    const {runAsync: loadModel, loading: loadModelLoading} = useRequest(async () => {
        return await LoadFromFile()
    }, {
        manual: true
    })
    const {data: options, loading: optionsLoading} = useRequest(async () => {
        const result = await GetOptions();
        return result
    }, {
        refreshDeps: [open]
    })
    const {runAsync: setOptions, loading: setOptionsLoading} = useRequest(async (params) => {
        await SetOptions(params)
    }, {
        manual: true
    })
    return <ConfigProvider theme={{algorithm: isDark ? darkAlgorithm : defaultAlgorithm}}>
        <AntdApp>
            <Layout>
                <Layout.Content style={{height: "100vh", padding: 12}}>
                    <Flex justify={"space-between"}>
                        <Segmented
                            value={model}
                            onChange={async (value) => {
                                setModel(value)
                                if (value === "text") {
                                    await setOptions({
                                        ...options,
                                        VaeDecodeOnly: true,
                                    })
                                }
                                if (value === "image") {
                                    await setOptions({
                                        ...options,
                                        VaeDecodeOnly: false,
                                    })
                                }
                            }}
                            options={[
                                {label: 'Text Predict Image', value: "text", icon: <FontColorsOutlined/>},
                                {label: 'Image Predict Image', value: "image", icon: <FileImageOutlined/>},
                            ]}
                        />
                        <Space size={12}>
                            <Button
                                icon={<FileOutlined/>}
                                loading={loadModelLoading || optionsLoading || setOptionsLoading}
                                onClick={async () => {
                                    const result = await loadModel()
                                    if (result) {
                                        setHasLoadModel(true)
                                    }
                                }}
                            >
                                Select Model
                            </Button>
                            <Button
                                loading={loadModelLoading || optionsLoading || setOptionsLoading}
                                icon={<SettingOutlined/>}
                                onClick={() => {
                                    setOpen(true)
                                }}>
                                Settings
                            </Button>
                            <Button
                                icon={<AlertOutlined/>}
                                onClick={() => setIsDark((prevState) => !prevState)}>
                                {isDark ? "Light Theme" : "Dark Theme"}
                            </Button>
                        </Space>
                    </Flex>
                    <Predict hasLoadModel={hasLoadModel} predictType={model} isDark={isDark} loading={loadModelLoading || optionsLoading || setOptionsLoading}/>
                    <Settings
                        open={open}
                        optionsLoading={setOptionsLoading || optionsLoading || loadModelLoading}
                        options={options}
                        onOptionsChange={async (options) => {
                            await setOptions(options)
                        }}
                        onClose={() => {
                            setOpen(false)
                        }}
                    />
                </Layout.Content>
            </Layout>
        </AntdApp>
    </ConfigProvider>
}

export default App
