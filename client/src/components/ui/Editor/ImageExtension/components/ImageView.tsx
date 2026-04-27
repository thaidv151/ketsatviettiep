import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { clamp, isNumber, throttle } from 'lodash-es';

interface Size {
  width: number
  height: number
}

const ResizeDirection = {
  TOP_LEFT: 'tl',
  TOP_RIGHT: 'tr',
  BOTTOM_LEFT: 'bl',
  BOTTOM_RIGHT: 'br',
} as const

type ImageNodeAttrs = {
  src?: string
  alt?: string
  width?: number | string | null
  height?: number | string | null
  flipX?: boolean
  flipY?: boolean
  align?: 'left' | 'center' | 'right'
  inline?: boolean
}

type ImageViewProps = {
  node: { attrs: ImageNodeAttrs }
  selected: boolean
  editor: { view: { dom: Element; editable: boolean } }
  getPos: () => number
  updateAttributes: (attrs: { width: number; height: null }) => void
}

function ImageView(props: ImageViewProps) {
  const [maxSize, setMaxSize] = useState<Size>({ width: 20, height: 100000 })
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 })
  const [resizeDirections] = useState<string[]>([
    ResizeDirection.TOP_LEFT,
    ResizeDirection.TOP_RIGHT,
    ResizeDirection.BOTTOM_LEFT,
    ResizeDirection.BOTTOM_RIGHT,
  ])
  const [resizing, setResizing] = useState(false)
  const [resizerState, setResizerState] = useState({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    dir: '',
  })

  const { align = 'center', inline = false } = props?.node?.attrs
  const inlineFloat = inline && (align === 'left' || align === 'right')

  const imgAttrs = useMemo(() => {
    const { src, alt, width: w, height: h, flipX, flipY } = props?.node?.attrs
    const width = isNumber(w) ? `${w}px` : w
    const height = isNumber(h) ? `${h}px` : h
    const transformStyles: string[] = []

    if (flipX) transformStyles.push('rotateX(180deg)')
    if (flipY) transformStyles.push('rotateY(180deg)')

    return {
      src: src || undefined,
      alt: alt || undefined,
      style: {
        width: width || undefined,
        height: height || undefined,
        transform: transformStyles.join(' ') || 'none',
        ...(inlineFloat ? { float: align } : {}),
      } as React.CSSProperties,
    }
  }, [align, inlineFloat, props?.node?.attrs])

  const imageMaxStyle = useMemo(() => {
    const { width } = imgAttrs.style
    return { width: width === '100%' ? width : undefined }
  }, [imgAttrs])

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    setOriginalSize({
      width: e.currentTarget.width,
      height: e.currentTarget.height,
    })
  }

  function selectImage() {
    const { editor, getPos } = props
    // @ts-expect-error setNodeSelection is available on runtime editor commands.
    editor.commands?.setNodeSelection?.(getPos())
  }

  const getMaxSize = useCallback(
    throttle(() => {
      const { editor } = props
      const { width } = getComputedStyle(editor.view.dom)
      setMaxSize((prev) => ({
        ...prev,
        width: Number.parseInt(width, 10),
      }))
    }, 16),
    [props],
  )

  function onMouseDown(e: React.MouseEvent, dir: string) {
    e.preventDefault()
    e.stopPropagation()

    const originalWidth = originalSize.width
    const originalHeight = originalSize.height || 1
    const aspectRatio = originalWidth / originalHeight

    let width = Number(props.node.attrs.width)
    let height = Number(props.node.attrs.height)
    const maxWidth = maxSize.width

    if (width && !height) {
      width = width > maxWidth ? maxWidth : width
      height = Math.round(width / aspectRatio)
    } else if (height && !width) {
      width = Math.round(height * aspectRatio)
      width = width > maxWidth ? maxWidth : width
    } else if (!width && !height) {
      width = originalWidth > maxWidth ? maxWidth : originalWidth
      height = Math.round(width / aspectRatio)
    } else {
      width = width > maxWidth ? maxWidth : width
    }

    setResizing(true)
    setResizerState({
      x: e.clientX,
      y: e.clientY,
      w: width,
      h: height,
      dir,
    })
  }

  const onMouseMove = useCallback(
    throttle((e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!resizing) return

      const { x, w, dir } = resizerState
      const dx = (e.clientX - x) * (/l/.test(dir) ? -1 : 1)
      const width = clamp(w + dx, 20, maxSize.width)

      props.updateAttributes({
        width,
        height: null,
      })
    }, 16),
    [maxSize.width, props, resizing, resizerState],
  )

  const onMouseUp = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!resizing) return

      setResizerState({ x: 0, y: 0, w: 0, h: 0, dir: '' })
      setResizing(false)
      selectImage()
    },
    [resizing],
  )

  const onEvents = useCallback(() => {
    document.addEventListener('mousemove', onMouseMove, true)
    document.addEventListener('mouseup', onMouseUp, true)
  }, [onMouseMove, onMouseUp])

  const offEvents = useCallback(() => {
    document.removeEventListener('mousemove', onMouseMove, true)
    document.removeEventListener('mouseup', onMouseUp, true)
  }, [onMouseMove, onMouseUp])

  useEffect(() => {
    if (resizing) onEvents()
    else offEvents()
    return () => offEvents()
  }, [offEvents, onEvents, resizing])

  const resizeOb: ResizeObserver = useMemo(
    () => new ResizeObserver(() => getMaxSize()),
    [getMaxSize],
  )

  useEffect(() => {
    resizeOb.observe(props.editor.view.dom)
    return () => resizeOb.disconnect()
  }, [props.editor.view.dom, resizeOb])

  return (
    <NodeViewWrapper
      as={inline ? 'span' : 'div'}
      className="image-view"
      style={{
        float: inlineFloat ? align : undefined,
        margin: inlineFloat
          ? align === 'left'
            ? '1em 1em 1em 0'
            : '1em 0 1em 1em'
          : undefined,
        display: inline ? 'inline' : 'block',
        textAlign: inlineFloat ? undefined : align,
        width: imgAttrs.style?.width ?? 'auto',
        ...(inlineFloat ? {} : imageMaxStyle),
      }}
    >
      <div
        data-drag-handle
        draggable="true"
        style={imageMaxStyle}
        className={`image-view__body ${props?.selected ? 'image-view__body--focused' : ''} ${resizing ? 'image-view__body--resizing' : ''}`}
      >
        <img
          alt={imgAttrs.alt}
          className="image-view__body__image block"
          height="auto"
          onClick={selectImage}
          onLoad={onImageLoad}
          src={imgAttrs.src}
          style={imgAttrs.style}
        />

        {props?.editor.view.editable && (props?.selected || resizing) && (
          <div className="image-resizer">
            {resizeDirections?.map((direction) => {
              return (
                <span
                  className={`image-resizer__handler image-resizer__handler--${direction}`}
                  key={`image-dir-${direction}`}
                  onMouseDown={(e) => onMouseDown(e, direction)}
                />
              )
            })}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

export default ImageView
