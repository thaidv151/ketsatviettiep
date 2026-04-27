'use client'

import {
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import RichTextEditor, { Editor as TiptapEditor } from 'reactjs-tiptap-editor'

import 'reactjs-tiptap-editor/style.css'
import 'react-image-crop/dist/ReactCrop.css'
import { buildExtensions } from './Extensions'

const localeImport = () => import('reactjs-tiptap-editor/locale-bundle')

export interface EditorRef {
  getEditor: () => TiptapEditor | undefined
  insertHtml: (html: string) => void
}

interface EditorProps {
  value?: string
  onChange?: (value: string) => void
  isUploadFile?: boolean
}

const Editor = forwardRef<EditorRef, EditorProps>((props, ref) => {
  const { value = '', onChange, isUploadFile = true } = props
  const editorRef = useRef<{ editor: TiptapEditor } | null>(null)

  const extensions = useMemo(
    () => buildExtensions(isUploadFile),
    [isUploadFile],
  )

  const onValueChange = useCallback(
    (val: string) => {
      requestAnimationFrame(() => {
        onChange?.(val)
      })
    },
    [onChange],
  )

  useImperativeHandle(ref, () => ({
    getEditor: () => editorRef.current?.editor,
    insertHtml: (html: string) => {
      const editor = editorRef.current?.editor
      if (editor) {
        editor
          .chain()
          .focus()
          .insertContent(html, {
            parseOptions: {
              preserveWhitespace: true,
            },
          })
          .run()
      }
    },
  }))

  useEffect(() => {
    localeImport().then((mod) => mod.locale.setLang('vi'))
  }, [])

  return (
    <main className="flex h-full flex-1 flex-col">
      <div className="rich-text-editor-container h-full flex-1 border-none">
        <RichTextEditor
          key={isUploadFile ? 'editor-upload-on' : 'editor-upload-off'}
          ref={editorRef}
          output="html"
          content={value}
          dark={false}
          onChangeContent={onValueChange}
          extensions={extensions as any}
          bubbleMenu={{
            render: (_props, bubbleDefaultDom) => {
              return <>{bubbleDefaultDom}</>
            },
          }}
        />
        <style jsx global>{`
          .rich-text-editor-container .rte-container {
            height: 100% !important;
            display: flex;
            flex-direction: column;
          }
          .rich-text-editor-container .rte-content {
            flex: 1;
            overflow-y: auto;
            min-height: 500px !important;
          }
          .rich-text-editor-container .ProseMirror {
            min-height: 500px !important;
            height: 100% !important;
          }
          .rich-text-editor-container .rte-wrapper {
            height: 100%;
            display: flex;
            flex-direction: column;
            border: none !important;
          }
        `}</style>
      </div>
    </main>
  )
})

Editor.displayName = 'Editor'

export default Editor
