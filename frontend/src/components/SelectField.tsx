import {FC, FormEventHandler} from "react";

type SelectFieldProps = {
    name: string;
    placeholder: string;
    value: any;
    options: string[];
    onSelect: FormEventHandler<HTMLLabelElement>;
}
const SelectField: FC<SelectFieldProps> = ({name, placeholder, value, options, onSelect}) => {
    return <div className="select-box">
        <span>{placeholder}</span>
        <div className="select-current" tabIndex={1}>
            {options.map((option, idx) =>
                <div className="select-value">
                    <input className="select-input" type="radio" value={idx} name={option} checked={value == idx}/>
                    <p className="select-input-text">${option}</p>
                </div>
            )}
        </div>
        <ul className="select-list">
            {
                options.map((option, idx) =>
                    <li>
                        <label
                            className="select-option"
                            id={String(idx)}
                            onClick={onSelect}
                            aria-hidden={true}>
                            {option}
                        </label>
                    </li>
                )
            }
        </ul>
    </div>;
}
export default SelectField;