import Paragraph from '@tiptap/extension-paragraph'

export const ParagraphFix = Paragraph.extend({
  renderHTML({ HTMLAttributes }) {
    return [
      'p',
      {
        ...HTMLAttributes,
        style: `text-align:left; ${String(HTMLAttributes.style || '')}`,
      },
      0,
    ]
  },
})
