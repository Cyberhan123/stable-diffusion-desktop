package main

//import (
//	_ "embed"
//	"os"
//	"path/filepath"
//)
//
////go:embed backend/stable-diffusion-cpp/stable-diffusion-cpp-backend.exe
//var StableDiffusionCppBackend []byte
//
//func releaseAdditionalFiles() error {
//	currentDir, err := os.Getwd()
//	if err != nil {
//		return err
//	}
//
//	relativePath := "stable-diffusion-cpp-backend.exe"
//	fullPath := filepath.Join(currentDir, relativePath)
//	if _, err := os.Stat(fullPath); err != nil {
//		//if os. {
//		//
//		//}
//	}
//
//	//data, err := embededData.ReadFile(fullPath)
//	//if err != nil {
//	//	fmt.Println("无法读取嵌入的数据:", err)
//	//	return
//	//}
//	//
//	//fmt.Println("嵌入的数据:", string(data))
//	return nil
//}
