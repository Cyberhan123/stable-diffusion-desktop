package tests

import (
	"github.com/cyberhan123/stable-diffusion-desktop/backend/stable-diffusion-cpp/api"
	"net/rpc"
	"testing"
)

func TestLoadModelFileAndTextPredict(t *testing.T) {
	client, err := rpc.Dial("tcp", "127.0.0.1:36000")
	if err != nil {
		t.Fatal("dialing", err)
		return
	}
	defer client.Close()

	args := &api.LoadFromFileArgs{
		ModelPath: "./models/miniSD.ckpt",
	}
	reply := new(api.LoadFromFileResult)
	err = client.Call(api.SDAppLoadFromFile, args, reply)
	if err != nil {
		t.Fatal("call", err)
		return
	}
	t.Log(reply)

	args2 := &api.PredictArgs{
		Prompt: "hello world",
	}
	reply2 := new(api.PredictResult)
	err = client.Call(api.SDAppPredict, args2, reply2)
	if err != nil {
		t.Fatal("App.Predict call", err)
		return
	}
	t.Log(reply2)
}
