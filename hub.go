package main

import (
	"context"
	"github.com/seasonjs/hf-hub/api"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"os"
	"path/filepath"
	"strings"
)

type Hub struct {
	ctx context.Context
}

func NewHub() *App {
	return &App{}
}

func (h *Hub) startup(ctx context.Context) {
	h.ctx = ctx
}

type LocalModalTaskParams struct {
	Migration string
	ModelPath string
}

func (h *Hub) SetLocalModalTask(params LocalModalTaskParams) {

}

type HuggingfaceRepoTaskParams struct {
	Repo string
}

func (h *Hub) SetHuggingfaceRepoTask(params HuggingfaceRepoTaskParams) *api.RepoInfo {
	name := strings.Split(params.Repo, "/")
	if len(name) != 2 {
		return nil
	}
	if name[1] == "" {
		return nil
	}
	builder, err := api.NewApiBuilder()
	if err != nil {
		runtime.LogError(h.ctx, err.Error())
		return nil
	}
	hapi := builder.
		WithCacheDir(h.GetHubPath()).
		Build()

	repo := api.NewRepo(params.Repo, api.Model)

	info, err := hapi.Repo(repo).Info()

	return info
}

func (h *Hub) GetHubPath() string {
	//todo custom path
	return h.defaultHubPath()
}

func (h *Hub) defaultHubPath() string {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		runtime.LogError(h.ctx, err.Error())
		return ""
	}
	hubPath := filepath.Join(homeDir, "stable-diffusion-desktop", "hub")
	return hubPath
}

func (h *Hub) SetHubPath(path string) bool {
	//todo
	return false
}

func (h *Hub) HubSettingsPath() string {
	return h.GetHubPath() + "/settings.json"
}

func (h *Hub) GetHubSettings() string {
	return ""
}
func (h *Hub) SetHubSettings() {

}
