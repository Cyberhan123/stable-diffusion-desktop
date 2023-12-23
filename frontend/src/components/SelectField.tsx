import {FC} from "react";


interface SelectEvent extends MouseEvent {
    target: HTMLLabelElement & { name: string, value: string | number }
}

type SelectFieldProps = {
    name: string;
    placeholder: string;
    value: any;
    options: string[];
    onChange: (e: SelectEvent) => void;
}
const SelectField: FC<SelectFieldProps> = ({name, placeholder, value, options, onChange}) => {
    return <div className="select-box">
        <span>{placeholder}</span>
        <div className="select-current" tabIndex={1}>
            {options.map((option, idx) =>
                <div className="select-value" key={idx}>
                    <input className="select-input" type="radio" value={idx} name={option} checked={value == idx}
                           readOnly={false}/>
                    <p className="select-input-text">{option}</p>
                </div>
            )}
        </div>
        <ul className="select-list">
            {
                options.map((option, idx) =>
                    <li key={idx}>
                        <label
                            className="select-option"
                            onClick={(e) => {
                                const event = e as unknown as SelectEvent;
                                event.target.name = name;
                                event.target.value = idx;
                                onChange(event)
                            }}
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