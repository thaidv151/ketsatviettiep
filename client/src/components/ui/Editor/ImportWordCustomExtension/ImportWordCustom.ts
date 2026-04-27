import { uploadService } from '@/services/upload.service'
import { ImportWord } from 'reactjs-tiptap-editor/importword'

export const ImportWordCustom = ImportWord.configure({
  upload: async (files: File[]) => {
    const uploaded = await Promise.all(
      files.map(async (file) => {
        try {
          const src = await uploadService.uploadFile(file)
          return {
            src: src ?? '',
            alt: file.name,
          }
        } catch (err) {
          console.error('Upload image failed', err)
          return {
            src: '',
            alt: file.name,
          }
        }
      }),
    )

    return uploaded
  },
})
