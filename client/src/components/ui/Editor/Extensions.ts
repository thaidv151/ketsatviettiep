import { uploadService } from '@/services/upload.service'
import { getFullImagePath } from '@/lib/path-utils'
import { BaseKit } from 'reactjs-tiptap-editor'
import { Attachment } from 'reactjs-tiptap-editor/attachment'
import { Blockquote } from 'reactjs-tiptap-editor/blockquote'
import { Bold } from 'reactjs-tiptap-editor/bold'
import { BulletList } from 'reactjs-tiptap-editor/bulletlist'
import { Clear } from 'reactjs-tiptap-editor/clear'
import { Color } from 'reactjs-tiptap-editor/color'
import { FontFamily } from 'reactjs-tiptap-editor/fontfamily'
import { FontSize } from 'reactjs-tiptap-editor/fontsize'
import { Heading } from 'reactjs-tiptap-editor/heading'
import { Highlight } from 'reactjs-tiptap-editor/highlight'
import { History } from 'reactjs-tiptap-editor/history'
import { HorizontalRule } from 'reactjs-tiptap-editor/horizontalrule'
import { Iframe } from 'reactjs-tiptap-editor/iframe'
import { ImportWord } from 'reactjs-tiptap-editor/importword'
import { Indent } from 'reactjs-tiptap-editor/indent'
import { Italic } from 'reactjs-tiptap-editor/italic'
import { LineHeight } from 'reactjs-tiptap-editor/lineheight'
import { Link } from 'reactjs-tiptap-editor/link'
import { MoreMark } from 'reactjs-tiptap-editor/moremark'
import { ColumnActionButton } from 'reactjs-tiptap-editor/multicolumn'
import { OrderedList } from 'reactjs-tiptap-editor/orderedlist'
import { SearchAndReplace } from 'reactjs-tiptap-editor/searchandreplace'
import { SlashCommand } from 'reactjs-tiptap-editor/slashcommand'
import { Strike } from 'reactjs-tiptap-editor/strike'
import { Table } from 'reactjs-tiptap-editor/table'
import { TableOfContents } from 'reactjs-tiptap-editor/tableofcontent'
import { TaskList } from 'reactjs-tiptap-editor/tasklist'
import { TextAlign } from 'reactjs-tiptap-editor/textalign'
import { TextUnderline } from 'reactjs-tiptap-editor/textunderline'
import { Video } from 'reactjs-tiptap-editor/video'
import { ImageExtension } from './ImageExtension/ImageExtension'

const imageExtensionConfigured = ImageExtension.configure({
  upload: async (file: File) => getFullImagePath(await uploadService.uploadFile(file)),
})

const videoConfigured = Video.configure({
  upload: async (file: File) => getFullImagePath(await uploadService.uploadFile(file)),
})

const importWordConfigured = ImportWord.configure({
  upload: (files: File[]) => {
    const uploaded = files.map((file) => ({
      src: URL.createObjectURL(file),
      alt: file.name,
    }))
    return Promise.resolve(uploaded)
  },
})

const attachmentConfigured = Attachment.configure({
  upload: async (file: File) => getFullImagePath(await uploadService.uploadFile(file)),
})

const baseCoreExtensions = [
  BaseKit.configure({
    placeholder: {
      showOnlyCurrent: true,
    },
    characterCount: false,
  }),
  FontFamily,
  FontSize,
  Bold,
  Italic,
  TextUnderline,
  Strike,
  Link,
]

export function buildExtensions(isUploadFile = true) {
  const uploadExtensions = isUploadFile
    ? [imageExtensionConfigured, videoConfigured]
    : []

  const tailUploadExtensions = isUploadFile
    ? [importWordConfigured, attachmentConfigured]
    : []

  return [
    ...baseCoreExtensions,
    ...uploadExtensions,
    History,
    SearchAndReplace,
    TableOfContents,
    Clear,
    Heading.configure({ spacer: true }),
    MoreMark,
    Color.configure({ spacer: true }),
    Highlight,
    BulletList,
    OrderedList,
    TextAlign.configure({ types: ['heading', 'paragraph'], spacer: true }),
    Indent,
    LineHeight,
    TaskList.configure({
      spacer: true,
      taskItem: {
        nested: true,
      },
    }),
    Blockquote,
    SlashCommand,
    HorizontalRule,
    ColumnActionButton,
    Table,
    Iframe,
    ...tailUploadExtensions,
  ]
}

export const extensions = buildExtensions(true)
