import ImageGallery from "../components/ImageGallery";
import {useRequest} from "ahooks";
import {GetInitImage, Predict, PredictImage} from "../../wailsjs/go/main/App";
import {Button, Col, Collapse, CollapseProps, Flex, Form, Input, Row, Select, Slider} from "antd";
import Terminal from "../components/Terminal";
import {omit} from "lodash-es";
import {PlaySquareOutlined, PlusOutlined, RedoOutlined} from "@ant-design/icons";
import {FC, useEffect, useState} from "react";

import './Predict.css';

type ValidateStatus = Parameters<typeof Form.Item>[0]['validateStatus'];

type PredictImageProps = {
    predictType: string | number
    hasLoadModel: boolean
    isDark: boolean
}
const PredictImageFC: FC<PredictImageProps> = (props) => {
    const [form] = Form.useForm();
    const [initImage, setInitImage] = useState<{
        previewImage: string;
        path: string;
        validateStatus?: ValidateStatus;
        errorMsg?: string | null;
    }>({
        previewImage: "",
        path: "",
        validateStatus: null,
        errorMsg: null
    })

    useEffect(() => {

    }, [props.predictType])
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
        if (props.predictType === "text") {
            return await Predict(params.Prompt, fullParams)
        }
        return await PredictImage(initImage?.path ?? "", params.Prompt, fullParams)
    }, {
        manual: true
    })


    const items: CollapseProps['items'] = [
        {
            key: '1',
            label: 'Common Settings',
            children: <>
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
            </>,
        },
        {
            key: '2',
            label: 'Advanced settings',
            children: <>
                <Form.Item style={{marginBottom: 0}}>
                    <Row>
                        <Col span={12}>
                            <Form.Item label={"Sampler Method"} name={"SampleMethod"}>
                                <Select
                                    style={{width: "90%"}}
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
                                        }]
                                    }
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={"Steps"} name={["SampleSteps"]}>
                                <Slider
                                    min={1}
                                    max={50}
                                    step={1}
                                />
                            </Form.Item>

                        </Col>
                    </Row>
                </Form.Item>
                <Form.Item style={{marginBottom: 0}}>
                    <Row>
                        <Col span={12}>
                            <Form.Item label={"Clip Skip"} name={"ClipSkip"}>
                                <Slider
                                    min={0}
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
                <Form.Item label={"Batch Count"} name={"BatchCount"}>
                    <Slider
                        min={1}
                        max={50}
                        step={1}
                    />
                </Form.Item>
            </>,
        },
    ];
    return <div>
        <Row justify={"space-between"}>
            <Col span={8}>
                <Form
                    form={form}
                    initialValues={{
                        Prompt: "a lovely cat",
                        NegativePrompt: "",
                        ClipSkip: 0,
                        CfgScale: 7.0,
                        Width: 256,
                        Height: 256,
                        SampleMethod: 0,
                        SampleSteps: 20,
                        Seed: 42,
                        BatchCount: 1
                    }}
                    layout="vertical"
                >
                    {
                        props.predictType === "image" &&
                        <Form.Item label="Image" name="InitImage" style={{marginBottom: 0}}>
                            {/*<Upload*/}
                            {/*    accept={"image/png,image/jpeg"}*/}
                            {/*    name="avatar"*/}
                            {/*    listType="picture-card"*/}
                            {/*    className="avatar-uploader"*/}
                            {/*    showUploadList={false}*/}
                            {/*    beforeUpload={async (file) => {*/}
                            {/*        const isPNG = file.type === 'image/png';*/}
                            {/*        if (!isPNG) {*/}
                            {/*            setInitImage({*/}
                            {/*                value: "",*/}
                            {/*                validateStatus: "error",*/}
                            {/*                errorMsg: "Please upload a PNG file"*/}
                            {/*            })*/}
                            {/*        } else {*/}
                            {/*            const base64 = await getBase64(file)*/}
                            {/*            setInitImage({*/}
                            {/*                value: base64,*/}
                            {/*                validateStatus: null,*/}
                            {/*                errorMsg: null*/}
                            {/*            })*/}
                            {/*        }*/}
                            {/*        return isPNG || Upload.LIST_IGNORE;*/}
                            {/*    }}*/}
                            {/*>*/}
                            {/*    {(initImage?.value?.length > 0) ? <img*/}
                            {/*            style={{width: "100%"}}*/}
                            {/*            src={initImage.value}*/}
                            {/*            alt={"initImage"}*/}
                            {/*        /> :*/}
                            {/*        <button style={{border: 0, background: 'none'}} type="button">*/}
                            {/*            <PlusOutlined style={props?.isDark ? {color: "#fff"} : {}}/>*/}
                            {/*            <div style={props?.isDark ? {*/}
                            {/*                color: "#fff",*/}
                            {/*                marginTop: 8*/}
                            {/*            } : {marginTop: 8}}>Upload*/}
                            {/*            </div>*/}
                            {/*        </button>}*/}
                            {/*</Upload>*/}
                            <Button
                                type="dashed" style={{width: 100, height: 100}}
                                onClick={async () => {
                                    const result = await GetInitImage()
                                    if (!!result && (result?.Path?.length ?? 0) > 0) {
                                        setInitImage({
                                            previewImage: result.Base64Image,
                                            path: result.Path,
                                            validateStatus: null,
                                            errorMsg: null
                                        })
                                    }
                                }}
                            >
                                {(initImage?.previewImage?.length > 0) ? <img
                                        style={{width: "100%"}}
                                        src={initImage.previewImage}
                                        alt={"initImage"}
                                    /> :
                                    <div style={{border: 0, background: 'none'}}>
                                        <PlusOutlined style={props?.isDark ? {color: "#fff"} : {}}/>
                                        <div style={props?.isDark ? {
                                            color: "#fff",
                                            marginTop: 5
                                        } : {marginTop: 8}}>Upload
                                        </div>
                                    </div>}
                            </Button>
                        </Form.Item>
                    }
                    <Form.Item label="Prompt" name="Prompt">
                        <Input.TextArea showCount autoSize={{minRows: 2, maxRows: 6}} maxLength={75}/>
                    </Form.Item>
                    <Form.Item label="Negative Prompt" name="NegativePrompt">
                        <Input.TextArea showCount autoSize={{minRows: 2, maxRows: 6}} maxLength={75}/>
                    </Form.Item>
                    <Form.Item style={{marginBottom: 0}}>
                        <Button
                            loading={predictLoading}
                            icon={<PlaySquareOutlined/>}
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
                    <Collapse defaultActiveKey={['1']} bordered={false} ghost accordion size={"small"} items={items}/>
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

export default PredictImageFC
