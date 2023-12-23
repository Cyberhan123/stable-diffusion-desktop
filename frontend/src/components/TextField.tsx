import {FC, FormEventHandler, useState} from "react";

type TextFieldProps = {
    name: string;
    placeholder: string;
    value: string |number;
    onInput: FormEventHandler<HTMLInputElement>;
}

const TextField: FC<TextFieldProps> = ({name, placeholder, value, onInput}) => {
    const [fieldCls, setFieldCls] = useState({classes: ""});
    const updateFocus = () => setFieldCls({classes: "focus"});
    const updateBlur = () => {
        setFieldCls({classes: ""});
    };
    return <div className="input-text-field-box">
        <input
            type="text"
            className={value == "" ? fieldCls.classes : 'focus'}
            name={name}
            value={value}
            onInput={onInput}
            onFocus={updateFocus}
            onBlur={updateBlur}
        />
        <span data-placeholder={placeholder}></span>
    </div>;
}
export default TextField;