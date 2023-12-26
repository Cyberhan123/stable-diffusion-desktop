import {useState} from 'react';
import ImageGallery from "./components/ImageGallery";

import './App.css';
import {useRequest} from "ahooks";
import {LoadFromFile, Predict, SetOptions} from "../wailsjs/go/main/App";
import {Button, Col, Flex, Form, Input, InputNumber, Layout, Row, Select, Slider} from "antd";
import Terminal from "./components/Terminal";


function App() {
    const [hasLoadModel, setHasLoadModel] = useState(false)

    const [form] = Form.useForm();

    const {runAsync: loadModel, loading: loadModelLoading} = useRequest(async () => {
        return await LoadFromFile()
    }, {
        manual: true
    })

    const {runAsync: predict, loading: predictLoading, data: images} = useRequest(async (params) => {
        const formatParams = {
            ...params,
            Width: Number(params.Width),
            Height: Number(params.Height),
            BatchCount: Number(params.BatchCount)
        }
        await SetOptions(formatParams);
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
                            <Form.Item label="Sampler Method" name="SampleMethod">
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
                                <Row>
                                    <Col span={12}>
                                        <Form.Item label={"width"} name={"Width"}>
                                            <InputNumber min={128} max={1024} step={128}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={"height"} name={"Height"}>
                                            <InputNumber min={128} max={1024} step={128}/>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form.Item>
                            <Form.Item label={"Batch Count"} name={"BatchCount"}>
                                <Slider
                                    min={1}
                                    max={50}
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
                                style={{marginLeft: 20}}
                                type="primary"
                                disabled={!hasLoadModel}
                                onClick={async () => {
                                    const params = form.getFieldsValue()
                                    await predict(params)
                                }}>
                                {predictLoading ? "Cancel" : "Generate"}
                            </Button>
                        </div>
                        <Flex gap="middle" vertical>
                                <ImageGallery images={images} loading={predictLoading}/>
                                <Terminal/>
                        </Flex>
                    </Col>
                </Row>
            </Layout.Content>
        </Layout>
    </div>;
}

export default App
