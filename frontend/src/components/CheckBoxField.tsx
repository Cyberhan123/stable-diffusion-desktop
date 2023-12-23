import {FC} from "react";

interface CheckBoxEvent extends MouseEvent {
    target: HTMLInputElement & { name: string }
}

type CheckBoxFieldProps = {
    name: string;
    placeholder: string;
    value: boolean;
    onChange: (e: CheckBoxEvent) => void;
}

const CheckBoxField: FC<CheckBoxFieldProps> = ({name, placeholder, value, onChange}) => {
    return <div className="check-field">
        <input className="checkbox-input" type="checkbox" name={name} value="0" checked={value} onInput={(e) => {
            const event = e as unknown as CheckBoxEvent;
            event.target.name = name;
            event.target.checked = !value;
            onChange(event);
        }}/>
        <span>{placeholder}</span>
    </div>;
}
export default CheckBoxField;