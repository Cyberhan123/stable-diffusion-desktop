import {FC, FormEventHandler, useState} from "react";

type TextAreaFieldProps = {
    name: string;
    placeholder: string;
    value: string;
    onInput: FormEventHandler<HTMLTextAreaElement>;
}

const TextAreaField: FC<TextAreaFieldProps> = ({name, placeholder, value, onInput}) => {
    const [fieldCls, setFieldCls] = useState({classes: ""});
    const updateFocus = () => setFieldCls({classes: "focus"});
    const updateBlur = () => {
        if (value == "") {
            setFieldCls({classes: ""});
        }
    };
    return <div className="text-area-field-box">
        <textarea
            className={value == "" ? fieldCls.classes : 'focus'}
            name={name}
            value={value}
            onInput={onInput}
            onFocus={updateFocus}
            onBlur={updateBlur}/>
        <span data-placeholder={placeholder}/>
    </div>;
}
export default TextAreaField;