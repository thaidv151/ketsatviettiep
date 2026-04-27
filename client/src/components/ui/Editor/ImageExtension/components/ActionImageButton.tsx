import { Upload } from 'lucide-react'
import { useRef } from 'react'
import { Editor } from 'reactjs-tiptap-editor'

type ActionImageButtonProps = {
  action: () => true
  upload: (file: File) => Promise<string>
  disabled: boolean
  editor: Editor
}

function ActionImageButton(props: ActionImageButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const defaultInline =
    props.editor.extensionManager.extensions.find(
      (extension: { name: string; options?: { defaultInline?: boolean } }) =>
        extension.name === 'image',
    )?.options?.defaultInline || false

  const handleSelectFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const url = await props.upload(file)
      if (url) {
        props.editor
          .chain()
          .focus()
          .setImageInline({ src: url, inline: defaultInline, alt: file.name })
          .run()
      }
    } finally {
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  return (
    <>
      <Upload
        className={`size-4 ${props.disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
        onClick={() => {
          if (!props.disabled) {
            inputRef.current?.click()
          }
        }}
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSelectFile}
      />
    </>
  )
}

export default ActionImageButton
