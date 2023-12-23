import {FC, useState} from "react";

type ImageGalleryProps = {
    images: { info: string, data: string }[];
}

const ImageGallery: FC<ImageGalleryProps> = ({images}) => {
    const [showInfo, setShowInfo] = useState({classes: "image-info"});
    const [currentImage, setCurrentImage] = useState<number>(1);
    const leave = () => {
        setShowInfo({classes: "image-info"});
    };

    const enter = () => {
        setShowInfo({classes: "show-info"});
    };

    return <div className="image-gallery">
        <ul>
            {images.map((image, idx) =>
                <li>
                    <img src={image.data} onClick={() => setCurrentImage(idx)}
                         className={currentImage == idx ? "selected" : ""} alt={""}/>
                </li>
            )}
        </ul>
        <div className="preview">
            <button className="button-holo" style={{margin: "10px 0"}} role="button" onClick={()=>{}}>
                Download
            </button>
            <div className="image-preview" style={{position: "relative"}} onMouseOver={enter} onMouseOut={leave}>
                <span
                    className={showInfo.classes}>{images[currentImage].info}</span>
                <img src={images[currentImage].data} alt={""}/>
            </div>
        </div>
    </div>;
}
export default ImageGallery;