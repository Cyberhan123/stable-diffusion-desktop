import {useState} from 'react';
import ImageGallery from "./components/ImageGallery";

import './App.css';
import {useRequest} from "ahooks";
import {LoadFromFile, Predict, SetOptions} from "../wailsjs/go/main/App";
import {Button, Col, Form, Input, Layout, Row, Select, Slider, Space} from "antd";


function App() {
    const [hasLoadModel, setHasLoadModel] = useState(false)
    const [form] = Form.useForm();
    const [modelState, setModelState] = useState({
        loaded: false,
        sampling: true,
        sampling_info: "1/1",
        decoding: true,
        decoding_info: "1/1",
        upscale: false,
        upscaling: true,
        upscaling_info: "1/1"
    })

    const {runAsync: loadModel, loading: loadModelLoading} = useRequest(async () => {
        return await LoadFromFile()
    }, {
        manual: true
    })

    const {runAsync: predict, loading: predictLoading, data: images} = useRequest(async (params) => {
        await SetOptions(params)
        return await Predict(params.Prompt)
    }, {
        manual: true
    })

    return <div>
        <Layout>
            <Layout.Content style={{height: "100vh"}}>
                <Row style={{margin: 10}}>
                    <Col span={12}>
                        <Form
                            labelCol={{span: 8}}
                            wrapperCol={{span: 16}}
                            style={{maxWidth: 600}}
                            form={form}
                            initialValues={{
                                Prompt: "",
                                NegativePrompt: "",
                                CfgScale: 7.0,
                                Width: 512,
                                Height: 512,
                                SampleMethod: "EULER_A",
                                SampleSteps: 20,
                                Seed: 42,
                                BatchCount: 1
                            }}
                            layout="vertical"
                        >
                            <Form.Item label="Prompt" name="Prompt">
                                <Input.TextArea rows={2}/>
                            </Form.Item>
                            <Form.Item label="Negative Prompt" name="NegativePrompt">
                                <Input.TextArea rows={2}/>
                            </Form.Item>
                            <Form.Item label="Sampler Method" name="SamplerMethod">
                                <Select
                                    options={[
                                        {
                                            label: "Euler A",
                                            value: "EULER_A"
                                        },
                                        {
                                            label: "Euler",
                                            value: "EULER"
                                        },
                                        {
                                            label: "Heun",
                                            value: "HEUN"
                                        },
                                        {
                                            label: "DPM2",
                                            value: "DPM2"
                                        },
                                        {
                                            label: "DPM++ 2S A",
                                            value: "DPMPP2S_A"
                                        },
                                        {
                                            label: "DPM++ 2M",
                                            value: "DPMPP2M"
                                        },
                                        {
                                            label: "DPM++ 2M v2",
                                            value: "DPMPP2M_V2"
                                        },
                                        {
                                            label: "LCM",
                                            value: "LCM"
                                        }]}
                                />
                            </Form.Item>
                            <Form.Item>
                                <Row>
                                    <Col span={12}>
                                        <Form.Item label={"Steps"} name={["SampleSteps"]}>
                                            <Slider
                                                min={1}
                                                max={50}
                                                step={1}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={"CFG Scale"} name={["CfgScale"]}>
                                            <Slider
                                                min={1}
                                                max={20}
                                                step={0.5}
                                            />

                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form.Item>
                            <Form.Item label={"seed"} name={"Seed"}>
                                <Input type={"number"}/>
                            </Form.Item>
                            <Form.Item>
                                <Space.Compact>
                                    <Form.Item label={"width"} name={"Width"}>
                                        <Input type={"number"}/>
                                    </Form.Item>

                                    <Form.Item label={"height"} name={"Height"}>
                                        <Input type={"number"}/>
                                    </Form.Item>
                                </Space.Compact>
                            </Form.Item>
                            <Form.Item label={"Batch Count"}>
                                <Slider
                                    min={1}
                                    max={20}
                                    step={1}
                                />
                            </Form.Item>
                        </Form>
                    </Col>
                    <Col span={12}>
                        <div className="row-gen">
                            <Button
                                loading={loadModelLoading}
                                onClick={async () => {
                                    const result = await loadModel()
                                    if (result) {
                                        setHasLoadModel(true)
                                    }

                                }}>
                                Select Model
                            </Button>
                            <Button
                                type="primary"
                                disabled={!hasLoadModel}
                                onClick={async () => {
                                    const params = form.getFieldsValue()
                                    debugger
                                    // await predict(params?.prompt)
                                }}>
                                {predictLoading ? "Cancel" : "Generate"}
                            </Button>
                        </div>
                        <div style={{width: "100%", height: "40rem", position: "relative"}}>
                            <div className={`progress-background ${predictLoading ? " show-progress" : ""}`}>
                                <ul className={`progress-steps ${predictLoading ? " show-steps" : ""}`}>
                                    <li className={modelState?.loaded ? " ready" : " waiting"}
                                        data-state={modelState?.loaded ? "OK" : ""}>
                                        {modelState?.loaded ? "Model Loaded" : "Loading model"}
                                    </li>
                                    <li className={modelState?.sampling ? " waiting" : " ready"}
                                        data-state={modelState?.sampling ? "" : "OK"}>
                                        {modelState?.sampling ? `Sampling image ${modelState.sampling_info}` :
                                            `${modelState?.sampling_info} Images Generated`}
                                    </li>
                                    <li className={modelState?.decoding ? " waiting" : " ready"}
                                        data-state={modelState?.decoding ? "" : "OK"}>
                                        {modelState?.decoding ? `Decoding image ${modelState.decoding_info}` :
                                            `${modelState?.decoding_info} Images decoded`}
                                    </li>
                                    {modelState.upscale ?
                                        <li className={modelState?.upscaling ? "waiting" : "ready"}
                                            data-state={modelState?.upscaling ? "" : "OK"}>
                                            Upscaling
                                            {modelState?.upscaling_info}
                                        </li> : ""}
                                </ul>
                            </div>
                            {images?.length > 0 ? <ImageGallery images={images}/> : ""}
                        </div>
                    </Col>
                </Row>
            </Layout.Content>
        </Layout>


    </div>;
}

export default App
