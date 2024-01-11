import {FC, useState} from "react";
import {Image, Space, Spin} from "antd";
import {
    DownloadOutlined,
    RotateLeftOutlined,
    RotateRightOutlined,
    SwapOutlined,
    ZoomInOutlined,
    ZoomOutOutlined
} from "@ant-design/icons";
import {useRequest} from "ahooks";
import {SaveImage} from "../../wailsjs/go/main/App";
import "./ImageGallery.css";

type ImageGalleryProps = {
    loading?: boolean | undefined;
    images: string[];
}

const ImageGallery: FC<ImageGalleryProps> = ({images, loading}) => {
    const [currentImage, setCurrentImage] = useState<number>(0);

    const {runAsync: saveImage} = useRequest(async (image: string) => {
        return await SaveImage(image)
    }, {manual: true})

    return <Spin tip="Loading..." spinning={loading}>
        <div className="image-gallery">
            {
                images?.length > 0 && <>
                    <ul>
                        {images?.map?.((image, idx) =>
                            <li>
                                <img src={image} onClick={() => setCurrentImage(idx)}
                                     className={currentImage == idx ? "selected" : ""} alt={""}/>
                            </li>
                        )}
                    </ul>
                    <div className="preview">
                        <div className="image-preview" style={{position: "relative"}}>
                            <Image.PreviewGroup
                                items={images}
                                preview={{
                                    toolbarRender: (
                                        _,
                                        {
                                            transform: {scale},
                                            actions: {
                                                onFlipY,
                                                onFlipX,
                                                onRotateLeft,
                                                onRotateRight,
                                                onZoomOut,
                                                onZoomIn
                                            },
                                        },
                                    ) => (
                                        <Space size={12} className="toolbar-wrapper">
                                            <DownloadOutlined onClick={async () => {
                                                await saveImage(images?.[currentImage])

                                            }}/>
                                            <SwapOutlined rotate={90} onClick={onFlipY}/>
                                            <SwapOutlined onClick={onFlipX}/>
                                            <RotateLeftOutlined onClick={onRotateLeft}/>
                                            <RotateRightOutlined onClick={onRotateRight}/>
                                            <ZoomOutOutlined disabled={scale === 1} onClick={onZoomOut}/>
                                            <ZoomInOutlined disabled={scale === 50} onClick={onZoomIn}/>
                                        </Space>
                                    ),
                                }}
                            >
                                <Image
                                    width={300}
                                    src={images?.[currentImage]}
                                />
                            </Image.PreviewGroup>
                        </div>
                    </div>
                </>
            }
        </div>
    </Spin>;
}
export default ImageGallery;