import {FC} from "react";
import {Dropdown, Form, Input, List, Modal, Select} from "antd";

const data = [
    'Racing car sprays burning fuel into crowd.',
    'Japanese princess to wed commoner.',
    'Australian walks 100km after outback crash.',
    'Man charged over missing wedding girl.',
    'Los Angeles battles huge wildfires.',
];

const ModelHub: FC = () => {
    const [modal, contextHolder] = Modal.useModal();
    const [form] = Form.useForm();
    return <div>
        <List
            style={{height: "90%", marginTop: 20}}
            size="large"
            header={<div>
                <Dropdown.Button menu={{
                    items: [
                        {key: 'Local', label: 'Import Model From Local'}],
                    onClick: ({key}) => {
                        if (key === "Local") {
                            modal.confirm({
                                title: 'Add Local Model To Model Hub',
                                icon: null,
                                content: <div>
                                    <Form form={form}>
                                        <Form.Item label={"Migration options"} name={"Migration"}>
                                            <Select
                                                options={[
                                                    {value: 'Copy', label: 'Copy To Model Hub'},
                                                    {value: 'Move', label: 'Move To Model Hub'},
                                                ]}
                                            />
                                        </Form.Item>
                                        <Form.Item label={"Model Path"} name={"ModelPath"}>
                                            <Input placeholder={"A model file or folder"}/>
                                        </Form.Item>
                                    </Form>
                                </div>,
                                onOk() {
                                  const params = form.getFieldsValue();
                                },
                                onCancel() {},
                            })
                        }
                    }
                }}
                onClick={()=>{
                    modal.confirm({
                        title: 'Add huggingface Model To Model Hub',
                        icon: null,
                        content: <div>
                            <Form form={form}>
                                <Form.Item label={"Model Repo"} name={"Repo"}>
                                    <Input placeholder={"justinpinkney/miniSD"}/>
                                </Form.Item>
                            </Form>
                        </div>,
                        onOk() {
                            const params = form.getFieldsValue();
                        },
                        onCancel() {},
                    })
                }}
                >
                    Import Model From HuggingFace
                </Dropdown.Button>
            </div>}
            bordered
            dataSource={data}
            renderItem={(item) => <List.Item>{item}</List.Item>}
        />
        <div>
            {contextHolder}
        </div>
    </div>
}

export default ModelHub;