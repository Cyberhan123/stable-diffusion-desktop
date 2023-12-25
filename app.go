package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	sd "github.com/seasonjs/stable-diffusion"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"io"
	"path/filepath"
)

// App struct
type App struct {
	ctx         context.Context
	sd          *sd.StableDiffusionModel
	options     *sd.StableDiffusionOptions
	modelLoaded bool
	modelPath   string
}

// NewApp creates a new App application struct
func NewApp() *App {
	options := sd.DefaultStableDiffusionOptions
	options.GpuEnable = false
	options.FreeParamsImmediately = true
	options.NegativePrompt = ""
	return &App{
		options: &options,
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	model, err := sd.NewStableDiffusionAutoModel(*a.options)
	if err != nil {
		runtime.LogError(ctx, err.Error())
	}
	a.ctx = ctx
	a.sd = model
}

func (a *App) LoadFromFile() bool {
	dialog, err := runtime.OpenMultipleFilesDialog(a.ctx, runtime.OpenDialogOptions{})
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return false
	}

	// cancel dialog
	if len(dialog) == 0 {
		return false
	}

	runtime.LogDebug(a.ctx, dialog[0])

	a.modelPath = dialog[0]

	if len(dialog) > 1 {
		a.modelPath = filepath.Dir(dialog[0])
	}

	err = a.sd.LoadFromFile(a.modelPath)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return false
	}
	a.modelLoaded = true
	return true
}

func (a *App) Predict(prompt string) []string {

	if len(prompt) == 0 {
		return nil
	}

	if !a.modelLoaded {
		return nil
	}
	var writers []io.Writer
	for i := 0; i < a.options.BatchCount; i++ {
		buffer := new(bytes.Buffer)
		writers = append(writers, buffer)
	}

	err := a.sd.Predict(prompt, writers)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return nil
	}

	var result []string
	for _, writer := range writers {
		base64String := base64.StdEncoding.EncodeToString(writer.(*bytes.Buffer).Bytes())
		result = append(result, "data:image/png;base64,"+base64String)
	}

	return result
}

func (a *App) PredictImage(initImage, prompt string) string {
	if !a.modelLoaded {
		return ""
	}
	decodedBytes, err := base64.StdEncoding.DecodeString(initImage)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return ""
	}

	reader := bytes.NewReader(decodedBytes)

	//var writers []io.Writer
	//for i := 0; i < a.options.BatchCount; i++ {
	//	buffer := new(bytes.Buffer)
	//	writers = append(writers, buffer)
	//}

	var buffer bytes.Buffer

	err = a.sd.ImagePredict(reader, prompt, &buffer)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return ""
	}

	var result string
	//for _, writer := range buffer {
	//	base64String := base64.StdEncoding.EncodeToString(writer.(*bytes.Buffer).Bytes())
	//	result = append(result, base64String)
	//}

	result = base64.StdEncoding.EncodeToString(buffer.Bytes())
	return "data:image/png;base64," + result
}

type SDOption struct {
	NegativePrompt   string
	CfgScale         float32
	Width            int
	Height           int
	SampleMethod     sd.SampleMethod
	SampleSteps      int
	Strength         float32
	Seed             int64
	BatchCount       int
	GpuEnable        bool
	OutputsImageType sd.OutputsImageType
}

func (a *App) SetOptions(option SDOption) {
	if len(option.NegativePrompt) > 0 && a.options.NegativePrompt != option.NegativePrompt {
		a.options.NegativePrompt = option.NegativePrompt
	}

	if a.options.CfgScale != option.CfgScale {

	}

	if a.options.Width != option.Width {
		a.options.Width = option.Width
	}

	if a.options.Height != option.Height {
		a.options.Height = option.Height
	}

	if a.options.SampleMethod != option.SampleMethod {
		a.options.SampleMethod = option.SampleMethod
	}

	if a.options.SampleSteps != option.SampleSteps {
		a.options.SampleSteps = option.SampleSteps
	}

	if a.options.Strength != option.Strength {
		a.options.Strength = option.Strength
	}

	if a.options.Seed != option.Seed {
		a.options.Seed = option.Seed
	}

	if a.options.BatchCount != option.BatchCount {
		a.options.BatchCount = option.BatchCount
	}

	if a.options.BatchCount != option.BatchCount {
		a.options.BatchCount = option.BatchCount
	}

	//if a.options.GpuEnable != option.GpuEnable {
	//	a.options.GpuEnable = option.GpuEnable
	//}

	if len(option.OutputsImageType) > 0 && a.options.OutputsImageType != option.OutputsImageType {
		a.options.OutputsImageType = option.OutputsImageType
	}
	runtime.LogDebug(a.ctx, fmt.Sprintf("%+v", *a.options))
	a.sd.SetOptions(*a.options)
}

//func (a *App) ReNewInstance(option sd.StableDiffusionOptions) bool {
//	if a.sd != nil {
//		err := a.sd.Close()
//		if err != nil {
//			return false
//		}
//		a.sd = nil
//	}
//
//	model, err := sd.NewStableDiffusionAutoModel(*a.options)
//	if err != nil {
//		return false
//	}
//	a.sd = model
//
//	if a.modelLoaded {
//		err = a.sd.LoadFromFile(a.modelPath)
//		if err != nil {
//			return false
//		}
//		a.modelLoaded = true
//	}
//	return true
//}
