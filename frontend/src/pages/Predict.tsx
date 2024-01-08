import ImageGallery from "../components/ImageGallery";
import {useRequest} from "ahooks";
import {Predict} from "../../wailsjs/go/main/App";
import {Button, Col, Flex, Form, Input, Row, Select, Slider} from "antd";
import Terminal from "../components/Terminal";
import {omit} from "lodash-es";

import '../App.css';
import {RedoOutlined} from "@ant-design/icons";
import {FC} from "react";

type PredictImageProps = {
    hasLoadModel: boolean
}
const PredictImage: FC<PredictImageProps> = (props) => {

    const [form] = Form.useForm();
    // NegativePrompt   string
    // ClipSkip         int
    // CfgScale         float32
    // Width            int
    // Height           int
    // SampleMethod     SampleMethod
    // SampleSteps      int
    // Strength         float32
    // Seed             int64
    // BatchCount       int
    // OutputsImageType OutputsImageType
    const {runAsync: predict, loading: predictLoading, data: images} = useRequest(async (params) => {
        const fullParams = omit(params, ["Prompt", "RandomSeed"])
        fullParams.Width = Number(fullParams.Width)
        fullParams.Height = Number(fullParams.Height)
        fullParams.SampleMethod = Number(fullParams.SampleMethod)
        fullParams.SampleSteps = Number(fullParams.SampleSteps)
        fullParams.Seed = Number(fullParams.Seed)
        fullParams.BatchCount = Number(fullParams.BatchCount)
        fullParams.OutputsImageType = "PNG"
        return await Predict(params.Prompt, fullParams)
    }, {
        manual: true
    })

    return <div>
        <Row justify={"space-between"}>
            <Col span={8}>

                <Form
                    form={form}
                    initialValues={{
                        Prompt: "",
                        NegativePrompt: "",
                        CfgScale: 7.0,
                        Width: 512,
                        Height: 512,
                        SampleMethod: 0,
                        SampleSteps: 20,
                        Seed: 42,
                        BatchCount: 1
                    }}
                    layout="vertical"
                >
                    <Form.Item label="Prompt" name="Prompt">
                        <Input.TextArea autoSize={{minRows: 2, maxRows: 6}} maxLength={75}/>
                    </Form.Item>
                    <Form.Item label="Negative Prompt" name="NegativePrompt">
                        <Input.TextArea autoSize={{minRows: 2, maxRows: 6}} maxLength={75}/>
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            size={"large"}
                            style={{width: "100%"}}
                            disabled={!props.hasLoadModel}
                            onClick={async () => {
                                const params = form.getFieldsValue()
                                await predict(params)
                            }}
                        >
                            Generate
                        </Button>
                    </Form.Item>
                    <Form.Item label="Sampler Method" name="SampleMethod">
                        <Select
                            options={[
                                {
                                    label: "Euler A",
                                    value: 0
                                },
                                {
                                    label: "Euler",
                                    value: 1
                                },
                                {
                                    label: "Heun",
                                    value: 2
                                },
                                {
                                    label: "DPM2",
                                    value: 3
                                },
                                {
                                    label: "DPM++ 2S A",
                                    value: 4
                                },
                                {
                                    label: "DPM++ 2M",
                                    value: 5
                                },
                                {
                                    label: "DPM++ 2M v2",
                                    value: 6
                                },
                                {
                                    label: "LCM",
                                    value: 7
                                }]}
                        />
                    </Form.Item>
                    <Form.Item style={{marginBottom: 0}}>
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
                    <Form.Item style={{marginBottom: 0}}>
                        <Row justify={"space-between"}>
                            <Col span={10}>
                                <Form.Item label={"Seed"} name={"Seed"}>
                                    <Input type={"number"}/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={"Random seed"} name={"RandomSeed"}>
                                    <Button
                                        icon={<RedoOutlined/>}
                                        onClick={() => {
                                            form.setFieldValue("Seed", Math.floor(Math.random() * Math.pow(10, 9)))
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form.Item>
                    <Form.Item style={{marginBottom: 0}}>
                        <Row justify={"space-between"}>
                            <Col span={10}>
                                <Form.Item label={"width"} name={"Width"}>
                                    <Input type={"number"} min={128} max={1024} step={128}/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={"height"} name={"Height"}>
                                    <Input type={"number"} min={128} max={1024} step={128}/>
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
            <Col span={15}>
                <Flex gap="middle" vertical>
                    <ImageGallery images={images} loading={predictLoading}/>
                    <Terminal/>
                </Flex>
            </Col>
        </Row>
    </div>;
}

export default PredictImage
