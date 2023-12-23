import {FC, FormEventHandler} from "react";

type CheckBoxFieldProps = {
    name: string;
    placeholder: string;
    param: boolean;
    onInput: FormEventHandler<HTMLInputElement>;

}

const CheckBoxField: FC<CheckBoxFieldProps> = ({name, placeholder, param, onInput}) => {
    return <div className="check-field">
        <input className="checkbox-input" type="checkbox" name={name} value="0" checked={param} onInput={onInput}/>
        <span>{placeholder}</span>
    </div>;
}
export default CheckBoxField;