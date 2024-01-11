import {useState} from 'react';
import {App as AntdApp, Button, ConfigProvider, Flex, Layout, Segmented, Space, theme} from "antd";
import {FileImageOutlined, FileOutlined, FontColorsOutlined, SettingOutlined} from "@ant-design/icons";
import Predict from "./pages/Predict";
import {useRequest} from "ahooks";
// import {LoadFromFile} from "../wailsjs/go/main/App";

import './App.css'
import Settings from "./components/Settings";

const {darkAlgorithm, defaultAlgorithm} = theme;

function App() {
    const [model, setModel] = useState<string | number>(1)
    const [hasLoadModel, setHasLoadModel] = useState(false)
    const [open, setOpen] = useState(false);
    const [isDark, setIsDark] = useState<boolean>(window?.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false);
    const {runAsync: loadModel, loading: loadModelLoading} = useRequest(async () => {
        // return await LoadFromFile()
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
                            onChange={(value) => {
                                setModel(value)
                            }}
                            options={[
                                {label: 'Text Predict Image', value: 1, icon: <FontColorsOutlined/>},
                                // {label: 'Image Predict Image', value: 2, icon: <FileImageOutlined/>},
                            ]}
                        />
                        <Space size={12}>
                            <Button
                                icon={<FileOutlined />}
                                loading={loadModelLoading}
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
                                icon={<SettingOutlined />}
                                onClick={() => {
                                setOpen(true)
                            }}>
                                Settings
                            </Button>
                            <Button onClick={() => setIsDark((prevState) => !prevState)}>
                                {isDark ? "Light Theme" : "Dark Theme"}
                            </Button>
                        </Space>
                    </Flex>
                    {
                        model === 1 && <Predict hasLoadModel={hasLoadModel}/>
                    }
                    <Settings
                        open={open}
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
