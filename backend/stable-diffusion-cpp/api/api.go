package api

import sd "github.com/seasonjs/stable-diffusion"

type LoadFromFileArgs struct {
	ModelPath string
}

type LoadFromFileResult struct {
}

type SetOptionsResult struct {
}

type PredictArgs struct {
	Prompt string
	Params sd.FullParams
}

type PredictResult struct {
	Images []string
}

type PredictImageArgs struct {
	InitImage string
	Prompt    string
	Params    sd.FullParams
}

type PredictImageResult struct {
	Images []string
}

type GetLogsArgs struct {
	Index int
	Size  int
	Total int
}

type GetLogsResult struct {
	Logs []string
}
