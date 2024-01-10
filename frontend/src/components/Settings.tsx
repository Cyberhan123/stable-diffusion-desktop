import {Button, Col, Drawer, Form, Input, InputNumber, Row, Select, Spin, Switch} from "antd";
import {FC} from "react";
import {useRequest} from "ahooks";
import {GetDirPath, GetFilePath, GetOptions, SetOptions} from "../../wailsjs/go/main/App";
import {Environment} from "../../wailsjs/runtime";

type SettingsProps = {
    open: boolean;
    onClose: () => void;
}
// VaePath               string
// TaesdPath             string
// LoraModelDir          string
// VaeDecodeOnly         bool
// VaeTiling             bool
// FreeParamsImmediately bool
// Threads               int
// Wtype                 WType
// RngType               RNGType
// Schedule              Schedule
// GpuEnable             bool
const Settings: FC<SettingsProps> = (props) => {
    const [form] = Form.useForm()
    const {data, loading} = useRequest(async () => {
        const platform = await Environment()
        const result = await GetOptions();
        form.setFieldsValue(result)
        return platform
    }, {})

    const {runAsync: setOptions, loading: setOptionsLoading} = useRequest(async (params) => {
        await SetOptions(params)
    }, {
        manual: true
    })

    const VaePath = Form.useWatch('VaePath', form);
    const TaesdPath = Form.useWatch('TaesdPath', form);
    const LoraModelDir = Form.useWatch('LoraModelDir', form);
    return <Drawer
        closeIcon={true}
        title="Settings"
        placement={"right"}
        closable={false}
        open={props?.open}
        onClose={async () => {
            await setOptions(form.getFieldsValue())
            props.onClose()
        }}
    >
        <Spin spinning={loading || setOptionsLoading}
              tip={setOptionsLoading ? "Apply setting and reloading ..." : "Loading"}>
            <Form
                form={form}
                layout="vertical"
            >
                <Form.Item
                    label="Vae Path"
                    name="VaePath"
                >
                    <Button
                        onClick={async () => {
                            const path = await GetFilePath("Select Vae Path")
                            if (path?.length > 0) {
                                form.setFieldValue("VaePath", path)
                            }
                        }}
                    >
                        Select Vae Path
                    </Button>
                    <Input
                        value={VaePath}
                        readOnly
                        bordered={false}
                    />
                </Form.Item>
                <Form.Item
                    label="Taesd Path"
                    name="TaesdPath"
                >
                    <Button
                        onClick={async () => {
                            const path = await GetFilePath("Select Taesd Path")
                            if (path?.length > 0) {
                                form.setFieldValue("TaesdPath", path)
                            }
                        }}
                    >
                        Select Taesd Path
                    </Button>
                    <Input
                        value={TaesdPath}
                        readOnly
                        bordered={false}
                    />
                </Form.Item>
                <Form.Item
                    label="Lora Model Dir"
                    name="LoraModelDir"
                >
                    <Button
                        onClick={async () => {
                            const path = await GetDirPath("Lora Model Dir")
                            if (path?.length > 0) {
                                form.setFieldValue("LoraModelDir", path)
                            }
                        }}
                    >
                        Select Lora Model Dir
                    </Button>
                    <Input
                        value={LoraModelDir}
                        readOnly
                        bordered={false}
                    />
                </Form.Item>
                <Form.Item style={{marginBottom: 0}}>
                    <Row>
                        <Col span={12}>
                            <Form.Item
                                label="Vae Decode Only"
                                name="VaeDecodeOnly"
                            >
                                <Switch/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Vae Tiling"
                                name="VaeTiling">
                                <Switch/>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form.Item>

                <Form.Item style={{marginBottom: 0}}>
                    <Row>
                        <Col>
                            <Form.Item
                                label="Free Params Immediately"
                                name="FreeParamsImmediately"
                            >
                                <Switch/>
                            </Form.Item>
                        </Col>
                        <Col>
                            <Form.Item
                                label="CPU Threads"
                                name="Threads"
                            >
                                <InputNumber/>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form.Item>
                <Form.Item
                    label="Weight Type"
                    name="Wtype">
                    <Select
                        options={[
                            {label: 'F32', value: 0},
                            {label: 'F16', value: 1},
                            {label: 'Q4_0', value: 2},
                            {label: 'Q4_1', value: 3},
                            {label: 'Q5_0', value: 6},
                            {label: 'Q5_1', value: 7},
                            {label: 'Q8_0', value: 8},
                            {label: 'Q8_1', value: 9},
                            {label: 'Q2_K', value: 10},
                            {label: 'Q3_K', value: 11},
                            {label: 'Q4_K', value: 12},
                            {label: 'Q5_K', value: 13},
                            {label: 'Q6_K', value: 14},
                            {label: 'Q8_K', value: 15},
                            {label: 'I8', value: 16},
                            {label: 'I16', value: 17},
                            {label: 'I32', value: 18},
                        ]}
                    />
                </Form.Item>
                <Form.Item
                    label={"Rng Type"}
                    name={"RngType"}
                >
                    <Select
                        options={[
                            {label: "Default RNG", value: 0},
                            {label: "CUDA RNG", value: 1},
                        ]}
                    />
                </Form.Item>
                <Form.Item
                    label={"Schedule"}
                    name={"Schedule"}>
                    <Select
                        options={[
                            {label: "Default", value: 0},
                            {label: "DISCRETE", value: 1},
                            {label: "KARRAS", value: 2},
                            {label: "N_SCHEDULES", value: 3},
                        ]}
                    />
                </Form.Item>
                <Form.Item
                    label={"GPU Enable"}
                    name={"GpuEnable"}>
                    <Switch disabled={data?.platform != "windows"}/>
                </Form.Item>
            </Form>
        </Spin>
    </Drawer>
}
export default Settings