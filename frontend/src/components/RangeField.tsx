import {FC, FormEventHandler} from "react";

type RangeFieldProps = {
    name: string;
    placeholder: string;
    min: number;
    max: number;
    step: number;
    value: number;
    onInput: FormEventHandler<HTMLInputElement>;

}

const RangeField:FC<RangeFieldProps> = ({name, placeholder, min, max, step, value, onInput}) => {
    return <div className="range-slider">
            <span style={{display: "block",color: "#817f7f"}}>{placeholder}</span>
            <input className="range-slider__range" type="range" min={min} max={max} name={name} step={step} value={value} onInput={onInput} />
            <span className="range-slider__value">{value}</span>
        </div>;
}
export default RangeField;