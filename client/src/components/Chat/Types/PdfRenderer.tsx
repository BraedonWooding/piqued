import { FC, useEffect, useRef, useState } from "react";
import { TypeAdapterProps } from ".";
import "types";
import PDFObject from "pdfobject";
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

export const PdfRenderer: FC<TypeAdapterProps> = ({ url, type, onLoad }: TypeAdapterProps) => {
  const pdfViewerRef = useRef();

  useEffect(() => {
    var options = {
      pdfOpenParams: { scrollbar: "1", toolbar: "1", statusbar: "1", messages: "1", navpanes: "1" },
      supportRedirect: true,
	    forcePDFJS: true,
      PDFJS_URL: "/web/viewer.html",
    };

    if (pdfViewerRef?.current) PDFObject.embed(url, pdfViewerRef.current, options);
  }, [url, pdfViewerRef.current]);

  return (
    <ResizableBox width={500} height={500} resizeHandles={["w", "s", "sw", "e", "se", "ne", "nw", "n"]} lockAspectRatio={true} minConstraints={[250, 250]} >
      <div onLoad={() => onLoad(url, type)} style={{height: "100%", width: "100%"}} ref={pdfViewerRef} className="pdfViewer">
      </div>
    </ResizableBox>
  );
};
