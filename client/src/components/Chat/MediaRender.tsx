import { React, FC }  from 'react';

interface MediaRenderProps {
    url: string;
    isRight: boolean
}

const MediaRender: FC<MediaRenderProps> = ({url, isRight}: MediaRenderProps ) => {
    const align = isRight ? "right" : "left";
    const justify = isRight ? "flex-end" : "flex-start"
    var isImage:boolean = url.endsWith("png") || url.endsWith("jpg") || url.endsWith("jpeg")
    var isVideo:boolean = url.endsWith("mp4")
    console.log(String(url))
    console.log(justify)
    if (isImage) {
        return (
            <div style={{textAlign: align, justifyContent: justify}}>
                <img src={url} width="30%"/>
            </div>
        );
    } else if (isVideo) {
        return (
            <div style={{textAlign: align, justifyContent: justify}}>
                <video width="30%" autoPlay={true} muted={true}>
                    <source src={url}/>
                </video>
            </div>
        );
    } else {
        return null;
    };
  };
  
  export default MediaRender;
