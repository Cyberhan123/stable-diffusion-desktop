package main

import (
	"bytes"
	"context"
	"encoding/base64"
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
}

// NewApp creates a new App application struct
func NewApp() *App {

	return &App{
		options: &sd.DefaultStableDiffusionOptions,
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

	modelPath := dialog[0]

	if len(dialog) > 1 {
		modelPath = filepath.Dir(dialog[0])
	}

	err = a.sd.LoadFromFile(modelPath)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return false
	}
	a.modelLoaded = true
	return true
}

func (a *App) Predict(prompt string) []string {
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
		result = append(result, base64String)
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
	return result
}

func (a *App) SetOptions(option sd.StableDiffusionOptions) {
	a.sd.SetOptions(option)
}

func (a *App) ReNewInstance() bool {
	if a.sd != nil {
		err := a.sd.Close()
		if err != nil {
			return false
		}
		a.sd = nil
	}
	a.modelLoaded = false
	model, err := sd.NewStableDiffusionAutoModel(*a.options)
	if err != nil {
		return false
	}
	a.sd = model
	return true
}
