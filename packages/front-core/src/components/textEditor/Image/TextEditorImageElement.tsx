import { styled } from '@mui/material/styles';
import { NumberSize, Resizable, ResizeDirection } from 're-resizable';
import React, { useState } from 'react';
import { Transforms } from 'slate';
import {
  ReactEditor,
  RenderElementProps,
  useFocused,
  useSelected,
  useSlate,
} from 'slate-react';
import theme from '../../../theme';
import FormatTypes, { CustomSlateImageElement } from '../TextEditorFormatType';

const MIN_DIAGONAL = 100;
const MAX_DIAGONAL = 600;

const isRefDiagonalSmallerThanMinimum = (refDiagonal: number) =>
  refDiagonal < MIN_DIAGONAL;
const isRefDiagonalBiggerThanMaximum = (refDiagonal: number) =>
  refDiagonal > MAX_DIAGONAL;

const StyledImg = styled('img')(() => {
  return {
    display: 'block',
    maxWidth: '100%',
    maxHeight: '100%',
    boxShadow: 'none',
  };
});

const TextEditorImageElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  const selected = useSelected();
  const focused = useFocused();
  const editor = useSlate();

  const imageElement = element as CustomSlateImageElement;

  const [width, setWidth] = useState<number>(
    (imageElement.width as number) || 200,
  );
  const [height, setHeight] = useState<number>(
    (imageElement.height as number) || 200,
  );
  const [theta, setTheta] = useState(Math.PI / 4); // 45 degrees or aspect ratio = 1

  const imgRef = React.useRef<HTMLImageElement>(null);

  function getElementPath() {
    return ReactEditor.findPath(editor, element);
  }

  function updateElementDimensions(newWidth: number, newHeight: number) {
    const partialImageNode: Partial<CustomSlateImageElement> = {
      width: newWidth,
      height: newHeight,
    };
    Transforms.setNodes(editor, partialImageNode, {
      at: getElementPath(),
    });
  }

  function onResizeStart() {
    ReactEditor.focus(editor);
    Transforms.select(editor, getElementPath());
  }

  function onResizeStop(
    _event: MouseEvent | TouchEvent,
    _direction: ResizeDirection,
    _refToElement: HTMLElement,
    delta: NumberSize,
  ) {
    const newWidth = width + delta.width;
    const newHeight = height + delta.height;
    updateElementDimensions(newWidth, newHeight);
    setWidth(newWidth);
    setHeight(newHeight);
  }

  function setBestImageDimensions() {
    const imgElement = element as CustomSlateImageElement;
    const refWidth =
      (imgElement.width as number) || imgRef.current!.naturalWidth;
    const refHeight =
      (imgElement.height as number) || imgRef.current!.naturalHeight;
    const refTheta = Math.atan(refHeight / refWidth);

    const refDiagonal = Math.sqrt(refWidth ** 2 + refHeight ** 2);

    let newWidth = refWidth;
    let newHeight = refHeight;
    if (isRefDiagonalSmallerThanMinimum(refDiagonal)) {
      newWidth = MIN_DIAGONAL * Math.cos(refTheta);
      newHeight = MIN_DIAGONAL * Math.sin(refTheta);
    } else if (isRefDiagonalBiggerThanMaximum(refDiagonal)) {
      newWidth = MAX_DIAGONAL * Math.cos(refTheta);
      newHeight = MAX_DIAGONAL * Math.sin(refTheta);
    }

    updateElementDimensions(newWidth, newHeight);

    setWidth(newWidth);
    setHeight(newHeight);
    setTheta(refTheta);
  }

  let resizableStyle: React.CSSProperties = {
    margin: '0px auto',
  };
  if (imageElement.align === FormatTypes.alignLeft || !imageElement.align) {
    resizableStyle = {
      float: 'left',
      marginRight: theme.spacing(2),
    };
  } else if (imageElement.align === FormatTypes.alignRight) {
    resizableStyle = {
      float: 'right',
      marginLeft: theme.spacing(2),
    };
  }

  return (
    <div {...attributes}>
      <div contentEditable={false}>
        <Resizable
          size={{ width, height }}
          onResizeStart={onResizeStart}
          onResizeStop={onResizeStop}
          lockAspectRatio
          minWidth={MIN_DIAGONAL * Math.cos(theta)}
          minHeight={MIN_DIAGONAL * Math.sin(theta)}
          maxWidth={MAX_DIAGONAL * Math.cos(theta)}
          maxHeight={MAX_DIAGONAL * Math.sin(theta)}
          style={resizableStyle}
        >
          <StyledImg
            ref={imgRef}
            src={imageElement.imageSource}
            alt=""
            onLoad={setBestImageDimensions}
            sx={[
              selected && focused && { boxShadow: '0 0 0 3px #B4D5FF' },
              imageElement.align === FormatTypes.alignCenter && {
                mx: 'auto',
              },
            ]}
          />
        </Resizable>
      </div>
      {children}
    </div>
  );
};

export default TextEditorImageElement;
