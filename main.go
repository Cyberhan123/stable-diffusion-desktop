package main

import (
	"embed"

	"github.com/fstanis/screenresolution"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()

	// Get the height of screen resolution
	height := screenresolution.GetPrimary().Height

	fullscreen := height < 864

	// Create application with options
	err := wails.Run(&options.App{
		Title:      "stable diffusion desktop",
		Width:      1080,
		Height:     864,
		MinWidth:   1080,
		MinHeight:  864,
		Fullscreen: fullscreen,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 255, G: 255, B: 255, A: 0},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
