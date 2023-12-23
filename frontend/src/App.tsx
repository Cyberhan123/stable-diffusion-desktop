import {useEffect, useState} from 'react';
import TextAreaField from "./components/TextAreaField";
import SelectField from "./components/SelectField";
import RangeField from "./components/RangeField";
import ImageGallery from "./components/ImageGallery";
import TextField from "./components/TextField";
import CheckBoxField from "./components/CheckBoxField";

import './App.css';
import {useRequest} from "ahooks";
import {LoadFromFile, Predict} from "../wailsjs/go/main/App";


function App() {
    const [runtime, setRuntime] = useState({
        generating: false,
        models: "",
        current_image: 0,
        images: []
    })
    const [params, setParams] = useState({
        model: 0,
        prompt: "",
        negative_prompt: "",
        cfg_scale: 7.0,
        width: 512,
        height: 512,
        steps: 20,
        seed: 42,
        random_seed: false,
        sampler: 0,
        schedule: 0,
        batch_count: 1,
        upscale: false
    })
    const [modelState, setModelState] = useState({
        loaded: false,
        sampling: true,
        sampling_info: "1/1",
        decoding: true,
        decoding_info: "1/1",
        upscale: false,
        upscaling: true,
        upscaling_info: "1/1"
    })

    // autosave params
    useEffect(() => {
        localStorage.setItem('params__sdcpp', JSON.stringify(params));
    }, [JSON.stringify(params)]);


    const updateParams = (e: any) => setParams({
        ...params,
        [e.target?.name]: e.target?.value
    });
    const updateParamsBool = (e: any) => setParams({...params, [e.target.name]: e.target.checked});
    const updateParamsInt = (e: any) => setParams({...params, [e.target.name]: Math.floor(parseFloat(e.target.value))});
    const updateParamsFloat = (e: any) => setParams({...params, [e.target.name]: parseFloat(e.target.value)})

    const {run: loadModel, loading: loadModelLoading} = useRequest(async () => {
        return await LoadFromFile()
    }, {
        manual: true
    })

    const {run: predict, loading: predictLoading, data: images} = useRequest(async (prompt: string) => {
        return await Predict(prompt)
    }, {
        manual: true
    })

    return <div>
        <h1 className="app-title">Stable Diffusion</h1>
        <div className="row-main">
            <div className="col">
                <fieldset style={{border: "none"}}>
                    <TextAreaField
                        name="prompt"
                        placeholder="Prompt"
                        value={params?.prompt}
                        onInput={updateParams}
                    />
                    <TextAreaField
                        name={"negative_prompt"}
                        placeholder={"Negative Prompt"}
                        value={params?.negative_prompt}
                        onInput={updateParams}
                    />
                </fieldset>
                <div className="row">
                    <fieldset className="col">
                        <SelectField
                            name={"sampler"}
                            placeholder={"Sampler Method"}
                            value={params?.sampler}
                            onChange={updateParamsInt}
                            options={["Euler A", "Euler", "Heun", "DPM2", "DPM++ 2S A", "DPM++ 2M", "DPM++ 2M v2", "LCM"]}
                        />
                        <RangeField
                            name={"steps"}
                            placeholder={"Steps"}
                            min={1}
                            max={50}
                            step={1}
                            value={params?.steps}
                            onInput={updateParamsInt}
                        />
                        <RangeField
                            name={"cfg_scale"}
                            placeholder={"CFG Scale"}
                            min={1}
                            max={20}
                            step={0.5}
                            value={params?.cfg_scale}
                            onInput={updateParamsFloat}
                        />
                        <TextField
                            name="seed"
                            placeholder="Seed"
                            value={params?.seed}
                            onInput={updateParamsInt}
                        />
                        <CheckBoxField
                            name="random_seed"
                            placeholder="Random seed"
                            value={params?.random_seed}
                            onChange={updateParamsBool}
                        />
                    </fieldset>
                    <fieldset className="col">
                        <SelectField
                            name="schedule"
                            placeholder="Schedule"
                            value={params?.schedule}
                            onChange={updateParamsInt}
                            options={["Default", "Discrete", "Karras"]}
                        />

                        <div className="row">
                            <fieldset className="col">
                                <TextField
                                    name="width"
                                    placeholder="Width"
                                    value={params?.width}
                                    onInput={updateParamsInt}
                                />
                            </fieldset>
                            <fieldset className="col">
                                <TextField
                                    name="height"
                                    placeholder="Height"
                                    value={params?.height}
                                    onInput={updateParamsInt}
                                />
                            </fieldset>
                        </div>
                        <CheckBoxField
                            name={"upscale"}
                            placeholder={"Upscale"}
                            value={params?.upscale}
                            onChange={updateParamsBool}
                        />
                        <RangeField
                            name="batch_count"
                            placeholder="Batch Count"
                            min={1}
                            max={40}
                            step={1}
                            value={params?.batch_count}
                            onInput={updateParamsInt}
                        />
                    </fieldset>
                </div>
            </div>
            <fieldset className="col">
                <div className="row-gen">
                    <fieldset className="col">
                        <button className="button-holo" style={{marginTop: "10px"}} role="button"
                                onClick={() => {
                                    const result = loadModel()
                                    debugger
                                }}>{"Select Model"}
                        </button>
                        {/*<SelectField*/}
                        {/*    name={"model"}*/}
                        {/*    placeholder={"Model"}*/}
                        {/*    value={params?.schedule}*/}
                        {/*    onChange={updateParams}*/}
                        {/*    options={runtime.models}*/}
                        {/*/>*/}
                    </fieldset>
                    <button className="button-holo" style={{marginTop: "10px"}} role="button"
                            onClick={() => {
                                predict(params?.prompt)
                            }}>{runtime.generating ? "Cancel" : "Generate"}</button>
                </div>
                <div style={{width: "100%", height: "40rem", position: "relative"}}>
                    <div className={`progress-background ${predictLoading ? " show-progress" : ""}`}>
                        <ul className={`progress-steps ${runtime.generating ? " show-steps" : ""}`}>
                            <li className={modelState?.loaded ? " ready" : " waiting"}
                                data-state={modelState?.loaded ? "OK" : ""}>
                                {modelState?.loaded ? "Model Loaded" : "Loading model"}
                            </li>
                            <li className={modelState?.sampling ? " waiting" : " ready"}
                                data-state={modelState?.sampling ? "" : "OK"}>
                                {modelState?.sampling ? `Sampling image ${modelState.sampling_info}` :
                                    `${modelState?.sampling_info} Images Generated`}
                            </li>
                            <li className={modelState?.decoding ? " waiting" : " ready"}
                                data-state={modelState?.decoding ? "" : "OK"}>
                                {modelState?.decoding ? `Decoding image ${modelState.decoding_info}` :
                                    `${modelState?.decoding_info} Images decoded`}
                            </li>
                            {modelState.upscale ?
                                <li className={modelState?.upscaling ? "waiting" : "ready"}
                                    data-state={modelState?.upscaling ? "" : "OK"}>
                                    Upscaling
                                    {modelState?.upscaling_info}
                                </li> : ""}
                        </ul>
                    </div>
                    {runtime.images.length > 0 ? <ImageGallery images={runtime.images}/> : ""}
                </div>
            </fieldset>
        </div>
    </div>;
}

export default App
