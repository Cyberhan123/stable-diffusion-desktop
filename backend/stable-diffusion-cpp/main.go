package main

import (
	"bytes"
	"encoding/base64"
	"errors"
	"github.com/cyberhan123/stable-diffusion-desktop/backend/stable-diffusion-cpp/api"
	"github.com/seasonjs/stable-diffusion"
	"io"
	"log"
	"net"
	"net/rpc"
)

type App struct {
	sd          *sd.Model
	options     *sd.Options
	modelPath   string
	modelLoaded bool
}

func NewApp(options sd.Options) (*App, error) {
	model, err := sd.NewAutoModel(options)
	if err != nil {
		return nil, err
	}

	return &App{
		sd:      model,
		options: &options,
	}, nil
}

func (a *App) LoadFromFile(arg api.LoadFromFileArgs, result *api.LoadFromFileResult) error {
	err := a.sd.LoadFromFile(arg.ModelPath)
	if err != nil {
		log.Fatal("load model error:", err)
		return err
	}
	a.modelPath = arg.ModelPath
	a.modelLoaded = true
	return err
}

func (a *App) SetOptions(options sd.Options, result *api.SetOptionsResult) error {
	a.options = &options
	a.sd.SetOptions(options)
	return nil
}

func (a *App) GetOptions(arg struct{}, result *sd.Options) error {
	*result = *a.options
	return nil
}

func (a *App) Predict(args api.PredictArgs, result *api.PredictResult) error {
	if len(args.Prompt) == 0 {
		log.Println("prompt is empty")
		return errors.New("prompt is empty")
	}

	if !a.modelLoaded {
		log.Println("model not loaded")
		return errors.New("model not loaded")
	}

	var writers []io.Writer
	for i := 0; i < args.Params.BatchCount; i++ {
		buffer := new(bytes.Buffer)
		writers = append(writers, buffer)
	}

	err := a.sd.Predict(args.Prompt, args.Params, writers)
	if err != nil {
		log.Println("predict error:", err)
		return nil
	}

	var images []string
	for _, writer := range writers {
		base64String := base64.StdEncoding.EncodeToString(writer.(*bytes.Buffer).Bytes())
		images = append(images, "data:image/png;base64,"+base64String)
	}

	*result = api.PredictResult{
		Images: images,
	}
	return nil
}

func (a *App) PredictImage(args api.PredictImageArgs, result *api.PredictImageResult) error {
	if !a.modelLoaded {
		log.Println("model not loaded")
		return errors.New("model not loaded")
	}
	decodedBytes, err := base64.StdEncoding.DecodeString(args.InitImage)
	if err != nil {
		log.Println("decode init image error:", err)
		return err
	}

	reader := bytes.NewReader(decodedBytes)

	var writers []io.Writer
	for i := 0; i < args.Params.BatchCount; i++ {
		buffer := new(bytes.Buffer)
		writers = append(writers, buffer)
	}

	err = a.sd.ImagePredict(reader, args.Prompt, args.Params, writers)
	if err != nil {
		log.Println("predict image error:", err)
		return err
	}

	var images []string
	for _, writer := range writers {
		base64String := base64.StdEncoding.EncodeToString(writer.(*bytes.Buffer).Bytes())
		images = append(images, "data:image/png;base64,"+base64String)
	}

	*result = api.PredictImageResult{
		Images: images,
	}
	return nil
}

func (a *App) GetLogs(args api.GetLogsArgs, result *api.GetLogsArgs) error {
	//TODO: implement
	return nil
}

func main() {
	defer func() {
		log.Println("server exit, recover from panic")

		recover()
	}()

	app, err := NewApp(sd.DefaultOptions)
	if err != nil {
		log.Fatal("create server error: ", err)
		return
	}

	err = rpc.Register(app)
	if err != nil {
		log.Fatal("register rpc error", err)
		return
	}

	listener, err := net.Listen("tcp", "127.0.0.1:36000")
	if err != nil {
		log.Fatal("listen error:", err)
		return
	}

	log.Println("server start at: ", listener.Addr().String())

	for {
		conn, err := listener.Accept()
		if err != nil {
			log.Println("Error accepting connection:", err)
			continue
		}
		go rpc.ServeConn(conn)
	}
}
