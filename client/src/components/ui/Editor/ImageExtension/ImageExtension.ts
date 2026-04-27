import { Extension, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { ReactNodeViewRenderer } from '@tiptap/react'
import TiptapImage from '@tiptap/extension-image'
import { Editor } from 'reactjs-tiptap-editor'
import ActionImageButton from './components/ActionImageButton'
import ImageView from './components/ImageView'
import {
  createImageUpload,
  handleImageDrop,
  handleImagePaste,
} from './image-upload'

interface GeneralOptions<T> {
  divider: boolean
  spacer: boolean
  button: ButtonView<T>
  toolbar?: boolean
}

interface ButtonViewParams<T = unknown> {
  editor: Editor
  extension: Extension<T>
  t: (path: string) => string
}

interface ButtonViewReturn {
  component: unknown
  componentProps: ButtonViewReturnComponentProps
  componentSlots?: ButtonViewReturnComponentSlots
}

interface ButtonViewReturnComponentProps {
  action?: (value?: unknown) => void
  isActive?: () => boolean
  icon?: unknown
  tooltip?: string
  [x: string]: unknown
}

interface ButtonViewReturnComponentSlots {
  dialog: () => unknown
  [x: string]: () => unknown
}

type ButtonView<T = unknown> = (
  options: ButtonViewParams<T>,
) => ButtonViewReturn | ButtonViewReturn[]

export interface SetImageAttrsOptions {
  src?: string
  alt?: string
  caption?: string
  width?: number | string | null
  align?: 'left' | 'center' | 'right'
  inline?: boolean
  flipX?: boolean
  flipY?: boolean
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageCustomUpload: {
      setImageInline: (options: Partial<SetImageAttrsOptions>) => ReturnType
      updateImage: (options: Partial<SetImageAttrsOptions>) => ReturnType
      setAlignImage: (align: 'left' | 'center' | 'right') => ReturnType
    }
  }
}

export interface IImageOptions extends GeneralOptions<IImageOptions> {
  upload?: (file: File) => Promise<string>
  HTMLAttributes?: Record<string, unknown>
  multiple?: boolean
  acceptMimes?: string[]
  maxSize?: number
  resourceImage: 'upload' | 'link' | 'both'
  defaultInline?: boolean
  enableAlt?: boolean
  onError?: (error: {
    type: 'size' | 'type' | 'upload'
    message: string
    file?: File
  }) => void
}

const DEFAULT_OPTIONS: Partial<IImageOptions> = {
  acceptMimes: ['image/jpeg', 'image/gif', 'image/png', 'image/jpg'],
  maxSize: 1024 * 1024 * 5,
  multiple: true,
  resourceImage: 'both',
  defaultInline: false,
  enableAlt: true,
}

export const ImageExtension = TiptapImage.extend<IImageOptions>({
  group: 'inline',
  inline: true,
  defining: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return {
      ...DEFAULT_OPTIONS,
      ...this.parent?.(),
      upload: () => Promise.reject('Image Upload Function'),
      button: ({ editor, extension }) => ({
        component: ActionImageButton,
        componentProps: {
          action: () => true,
          upload: extension.options.upload,
          disabled: !editor.can().setImage?.({ src: '' }),
          editor,
        },
      }),
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      flipX: { default: false },
      flipY: { default: false },
      width: {
        default: null,
        parseHTML: (el: HTMLElement) => {
          const width = el.style.width || el.getAttribute('width') || null
          return width ? Number.parseInt(width, 10) : null
        },
        renderHTML: (attrs: { width?: number }) => ({ width: attrs.width }),
      },
      align: {
        default: 'center',
        parseHTML: (el: HTMLElement) => el.getAttribute('align'),
        renderHTML: (attrs: { align?: string }) => ({ align: attrs.align }),
      },
      inline: {
        default: false,
        parseHTML: (el: HTMLElement) => Boolean(el.getAttribute('inline')),
        renderHTML: (attrs: { inline?: boolean }) => ({ inline: attrs.inline }),
      },
      alt: {
        default: '',
        parseHTML: (el: HTMLElement) => el.getAttribute('alt'),
        renderHTML: (attrs: { alt?: string }) => ({ alt: attrs.alt }),
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageView)
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImageInline:
        (options) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              ...options,
              inline: options.inline ?? this.options.defaultInline,
            },
          }),
      updateImage:
        (options) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, options),
      setAlignImage:
        (align) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { align }),
    }
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    const { flipX, flipY, align, inline } = HTMLAttributes
    const inlineFloat = inline && (align === 'left' || align === 'right')
    const transformStyle =
      flipX || flipY
        ? `transform: rotateX(${flipX ? '180' : '0'}deg) rotateY(${flipY ? '180' : '0'}deg);`
        : ''
    const textAlignStyle = inlineFloat ? '' : `text-align: ${align};`
    const floatStyle = inlineFloat ? `float: ${align};` : ''
    const marginStyle = inlineFloat
      ? align === 'left'
        ? 'margin: 1em 1em 1em 0;'
        : 'margin: 1em 0 1em 1em;'
      : ''
    const style = `${floatStyle}${marginStyle}${transformStyle}`

    return [
      inline ? 'span' : 'div',
      { style: textAlignStyle, class: 'image' },
      [
        'img',
        mergeAttributes(
          { height: 'auto', style },
          this.options.HTMLAttributes ?? {},
          HTMLAttributes,
        ),
      ],
    ]
  },

  parseHTML() {
    const parse = (el: Element, img: Element | null) => {
      const width = img?.getAttribute('width')
      return {
        src: img?.getAttribute('src'),
        alt: img?.getAttribute('alt'),
        caption: img?.getAttribute('caption'),
        width: width ? Number.parseInt(width, 10) : null,
        align: img?.getAttribute('align') || el.getAttribute('style') || null,
        inline: img?.getAttribute('inline') || false,
        flipX: img?.getAttribute('flipx') === 'true',
        flipY: img?.getAttribute('flipy') === 'true',
      }
    }

    return [
      {
        tag: 'span.image img',
        getAttrs: (img: Element) => parse(img.parentElement!, img),
      },
      {
        tag: 'div[class=image]',
        getAttrs: (el: Element) => parse(el, el.querySelector('img')),
      },
    ]
  },

  addProseMirrorPlugins() {
    const uploadFn = createImageUpload({
      onUpload: this.options.upload as (file: File) => Promise<string | object>,
      defaultInline: this.options.defaultInline,
    })
    return [
      new Plugin({
        key: new PluginKey('imageDropPaste'),
        props: {
          handlePaste(view, event) {
            return handleImagePaste(view, event, uploadFn)
          },
          handleDrop(view, event, _slice, moved) {
            return handleImageDrop(view, event, moved, uploadFn)
          },
        },
      }),
    ]
  },
})

export default ImageExtension
