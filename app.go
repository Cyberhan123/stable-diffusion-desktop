package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	sd "github.com/seasonjs/stable-diffusion"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"image"
	"image/png"
	"io"
	"os"
	"path/filepath"
	goruntime "runtime"
	"strings"
)

// App struct
type App struct {
	ctx         context.Context
	sd          *sd.Model
	options     *sd.Options
	modelLoaded bool
	modelPath   string
}

// NewApp creates a new App application struct
func NewApp() *App {
	options := sd.DefaultOptions
	if goruntime.GOOS == "windows" {
		options.GpuEnable = true
	} else {
		options.GpuEnable = false
	}
	options.FreeParamsImmediately = true

	return &App{
		options: &options,
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	model, err := sd.NewAutoModel(*a.options)
	if err != nil {
		runtime.LogError(ctx, err.Error())
	}
	a.ctx = ctx
	a.sd = model
	a.sd.SetLogCallback(func(level sd.LogLevel, text string) {
		runtime.EventsEmit(ctx, "log", level, text)
	})
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

func (a *App) Predict(prompt string, params sd.FullParams) []string {

	if len(prompt) == 0 {
		return nil
	}

	if !a.modelLoaded {
		return nil
	}
	var writers []io.Writer
	for i := 0; i < params.BatchCount; i++ {
		buffer := new(bytes.Buffer)
		writers = append(writers, buffer)
	}

	err := a.sd.Predict(prompt, params, writers)
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

func (a *App) PredictImage(initImage, prompt string, params sd.FullParams) []string {
	if !a.modelLoaded {
		return nil
	}
	decodedBytes, err := base64.StdEncoding.DecodeString(initImage)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return nil
	}

	reader := bytes.NewReader(decodedBytes)

	var writers []io.Writer
	for i := 0; i < params.BatchCount; i++ {
		buffer := new(bytes.Buffer)
		writers = append(writers, buffer)
	}

	err = a.sd.ImagePredict(reader, prompt, params, writers)
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

func (a *App) SetOptions(option sd.Options) {
	runtime.LogDebug(a.ctx, fmt.Sprintf("%+v", *a.options))
	a.options = &option
	a.sd.SetOptions(option)
}

func (a *App) SaveImage(imageBase64 string) bool {
	dialog, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{})
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return false
	}

	if len(dialog) == 0 {
		return false
	}

	parts := strings.Split(imageBase64, ";base64,")
	if len(parts) != 2 {
		_, _ = runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
			Type:    runtime.InfoDialog,
			Title:   "Save Image Failed",
			Message: err.Error(),
		})
		return false
	}

	decoded, err := base64.StdEncoding.DecodeString(parts[1])
	if err != nil {
		_, _ = runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
			Type:    runtime.InfoDialog,
			Title:   "Save Image Failed",
			Message: err.Error(),
		})
		runtime.LogError(a.ctx, err.Error())
		return false
	}

	reader := strings.NewReader(string(decoded))
	img, _, err := image.Decode(reader)
	if err != nil {
		_, _ = runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
			Type:    runtime.InfoDialog,
			Title:   "Save Image Failed",
			Message: err.Error(),
		})
		runtime.LogError(a.ctx, err.Error())
		return false
	}

	file, err := os.Create(dialog)
	if err != nil {
		_, _ = runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
			Type:    runtime.InfoDialog,
			Title:   "Save Image Failed",
			Message: err.Error(),
		})
		runtime.LogError(a.ctx, err.Error())
		return false
	}
	defer file.Close()

	err = png.Encode(file, img)
	if err != nil {
		_, _ = runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
			Type:    runtime.InfoDialog,
			Title:   "Save Image Failed",
			Message: err.Error(),
		})
		runtime.LogError(a.ctx, err.Error())
		return false
	}

	_, _ = runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
		Type:    runtime.InfoDialog,
		Title:   "Save Image Success",
		Message: fmt.Sprintf("Image saved to %s", dialog),
	})

	return true
}
