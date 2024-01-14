package main

import (
	"github.com/seasonjs/stable-diffusion"
	"log"
	"net"
	"net/rpc"
)

type App struct {
	sd        *sd.Model
	options   *sd.Options
	modelPath string
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

type LoadFromFileArgs struct {
	ModelPath string
}

type LoadFromFileResult struct {
}

func (a *App) LoadFromFile(arg LoadFromFileArgs, result *LoadFromFileResult) error {
	err := a.sd.LoadFromFile(arg.ModelPath)
	if err != nil {
		log.Fatal("load model error:", err)
		return err
	}
	a.modelPath = arg.ModelPath
	return err
}

func main() {
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
