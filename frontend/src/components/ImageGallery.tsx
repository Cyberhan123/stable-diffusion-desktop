import {FC, useState} from "react";
import {Image, Spin} from "antd";

type ImageGalleryProps = {
    loading?: boolean | undefined;
    images: string[];
}

const ImageGallery: FC<ImageGalleryProps> = ({images, loading}) => {
    const [currentImage, setCurrentImage] = useState<number>(0);

    return <Spin tip="Loading..." spinning={loading}>
        <div className="image-gallery">
            <ul>
                {images?.map?.((image, idx) =>
                    <li>
                        <img src={image} onClick={() => setCurrentImage(idx)}
                             className={currentImage == idx ? "selected" : ""} alt={""}/>
                    </li>
                )}
            </ul>
            <div className="preview">
                {/*<button className="button-holo" style={{margin: "10px 0"}} role="button" onClick={() => {*/}
                {/*}}>*/}
                {/*    Download*/}
                {/*</button>*/}
                <div className="image-preview" style={{position: "relative"}}>
                    <Image.PreviewGroup
                        items={images}
                    >
                        <Image
                            width={300}
                            src={images?.[currentImage]}
                        />
                    </Image.PreviewGroup>
                </div>
            </div>
        </div>
    </Spin>;
}
export default ImageGallery;