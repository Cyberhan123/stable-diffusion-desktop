package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
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
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	a.options = a.defaultUserSetting()
	a.loadUserSetting()
	model, err := sd.NewAutoModel(*a.options)
	if err != nil {
		runtime.LogError(ctx, err.Error())
	}
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

	if len(initImage) == 0 {
		return nil
	}

	file, err := os.ReadFile(initImage)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return nil
	}

	reader := bytes.NewReader(file)

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

func (a *App) GetOptions() sd.Options {
	return *a.options
}

func (a *App) SetOptions(option sd.Options) {
	runtime.LogDebug(a.ctx, fmt.Sprintf("%+v", *a.options))
	a.options = &option
	if a.modelLoaded || len(a.modelPath) > 0 {
		a.sd.SetOptions(option)
	}
	a.saveUserSetting()
}

func (a *App) SaveImage(imageBase64 string) bool {
	dialog, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Image Files (*.png)",
				Pattern:     "*.png",
			},
		},
	})
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

	if filepath.Ext(dialog) != ".png" {
		dialog += ".png"
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

func (a *App) GetFilePath(title string) string {
	dialog, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{})
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return ""
	}
	return dialog
}

func (a *App) GetDirPath(title string) string {
	dialog, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{})
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return ""
	}
	return dialog
}

func (a *App) loadUserSetting() bool {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return false
	}

	appDataDir := filepath.Join(homeDir, "stable-diffusion-desktop")
	if _, err := os.Stat(appDataDir); os.IsNotExist(err) {
		err = os.MkdirAll(appDataDir, 0700)
		if err != nil {
			runtime.LogError(a.ctx, err.Error())
			return false
		}
		a.saveUserSetting()
		return true
	}

	settingFile, err := os.ReadFile(filepath.Join(appDataDir, "options.json"))
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		a.options = a.defaultUserSetting()
		return false
	}

	var settings sd.Options

	err = json.Unmarshal(settingFile, &settings)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		a.options = a.defaultUserSetting()
		return false
	}

	a.options = &settings
	if a.options.Threads <= 0 {
		a.options.Threads = goruntime.NumCPU() - 2 // 2 threads for rest of the system
	}
	return true
}

func (a *App) saveUserSetting() bool {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		a.options = a.defaultUserSetting()
		return false
	}

	appDataDir := filepath.Join(homeDir, "stable-diffusion-desktop")

	settingFile, err := os.Create(filepath.Join(appDataDir, "options.json"))
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return false
	}
	defer settingFile.Close()

	settingJson, err := json.Marshal(a.options)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return false
	}

	_, err = settingFile.Write(settingJson)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return false
	}
	return true
}

func (a *App) defaultUserSetting() *sd.Options {
	options := sd.DefaultOptions
	// all always keep false until we can introduce cuda
	options.GpuEnable = false
	options.FreeParamsImmediately = false
	options.Threads = goruntime.NumCPU() - 2 // 2 threads for rest of the system
	options.Wtype = sd.COUNT
	return &options
}

type InitImageResult struct {
	Path        string
	Base64Image string
}

func (a *App) GetInitImage() *InitImageResult {
	path, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Filters: []runtime.FileFilter{{
			DisplayName: "Image Files (*.png)",
			Pattern:     "*.png",
		}},
	})

	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return nil
	}

	if len(path) > 0 {
		if _, err := os.Stat(path); err != nil {
			runtime.LogError(a.ctx, err.Error())
			return nil
		}
	}
	file, err := os.ReadFile(path)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return nil
	}
	base64String := base64.StdEncoding.EncodeToString(file)
	return &InitImageResult{
		Path:        path,
		Base64Image: "data:image/png;base64," + base64String,
	}
}
