import {Col, Drawer, Form, Input, InputNumber, Row, Select, Skeleton, Switch} from "antd";
import {FC} from "react";
import {useRequest} from "ahooks";
import {GetOptions} from "../../wailsjs/go/main/App";
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
    const {data,loading} = useRequest(async () => {
        const platform = await Environment()
        debugger
        const result = await GetOptions();
        form.setFieldsValue(result)
        return platform
    }, {})
    return <Drawer
        closeIcon={true}
        title="Settings"
        placement={"right"}
        closable={false}
        open={props?.open}
        onClose={() => {
            props.onClose()
        }}
    >
        <Skeleton loading={loading}>
            <Form
                form={form}
                layout="vertical"
            >
                <Form.Item
                    label="Vae Path"
                    name="VaePath"
                >
                    <Input type="file"/>
                </Form.Item>
                <Form.Item
                    label="Taesd Path"
                    name="TaesdPath"
                >
                    <Input type="file"/>
                </Form.Item>
                <Form.Item
                    label="Lora Model Dir"
                    name="LoraModelDir"
                >
                    <Input type="file"/>
                </Form.Item>
                <Form.Item>
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

                <Form.Item>
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
                    <Switch disabled={data?.platform!="windows"}/>
                </Form.Item>
            </Form>
        </Skeleton>
    </Drawer>
}
export default Settings