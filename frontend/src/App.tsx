import {useLayoutEffect, useState} from 'react';
import {useMount} from "ahooks";
import {ConfigProvider, Layout, theme} from "antd";
import Predict from "./pages/Predict";

import './App.css';

const {darkAlgorithm, defaultAlgorithm} = theme;

function App() {
    const [isDark, setIsDark] = useState<boolean>(window?.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false);

    return <ConfigProvider theme={{algorithm: isDark ? darkAlgorithm : defaultAlgorithm}}>
        <Layout>
            <Layout.Content style={{height: "100vh"}}>
                <Predict/>
            </Layout.Content>
        </Layout>
    </ConfigProvider>
}

export default App
