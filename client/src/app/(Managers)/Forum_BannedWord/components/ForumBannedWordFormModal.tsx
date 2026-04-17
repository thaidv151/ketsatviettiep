'use client'

import { useEffect } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { Dialog, Form, FormItem } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import type {
    ForumBannedWordDto,
    ForumBannedWordCreateRequest,
    ForumBannedWordEditRequest,
} from '@/@types/Forum/forumBannedWord'

const schema = z.object({
    id: z.string().optional(),
    word: z.string().min(1, 'Vui lòng nhập từ/cụm từ').max(500),
    category: z.string().max(100).optional().or(z.literal('')),
    isActive: z.boolean(),
    sortOrder: z.coerce.number().int(),
    note: z.string().max(500).optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

interface ForumBannedWordFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (
        data: ForumBannedWordCreateRequest | ForumBannedWordEditRequest,
    ) => Promise<void> | void
    title: string
    initialData?: ForumBannedWordDto | null
    isEdit?: boolean
}

export function ForumBannedWordFormModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    initialData,
    isEdit = false,
}: ForumBannedWordFormModalProps) {
    const {
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            id: '',
            word: '',
            category: '',
            isActive: true,
            sortOrder: 0,
            note: '',
        },
    })

    useEffect(() => {
        if (!isOpen) return
        if (initialData && isEdit) {
            reset({
                id: initialData.id,
                word: initialData.word,
                category: initialData.category ?? '',
                isActive: initialData.isActive,
                sortOrder: initialData.sortOrder ?? 0,
                note: initialData.note ?? '',
            })
        } else {
            reset({
                id: '',
                word: '',
                category: '',
                isActive: true,
                sortOrder: 0,
                note: '',
            })
        }
    }, [initialData, isEdit, isOpen, reset])

    const onFormSubmit = handleSubmit(async (values) => {
        const payload: ForumBannedWordCreateRequest | ForumBannedWordEditRequest =
            isEdit && values.id
                ? {
                      id: values.id,
                      word: values.word.trim(),
                      category: values.category?.trim() || null,
                      isActive: values.isActive,
                      sortOrder: values.sortOrder,
                      note: values.note?.trim() || null,
                  }
                : {
                      word: values.word.trim(),
                      category: values.category?.trim() || null,
                      isActive: values.isActive,
                      sortOrder: values.sortOrder,
                      note: values.note?.trim() || null,
                  }
        await onSubmit(payload)
    })

    return (
        <Dialog isOpen={isOpen} onClose={onClose} width={520}>
            <h4 className="text-lg font-extrabold text-slate-800 mb-4">{title}</h4>
            <Form onSubmit={onFormSubmit}>
                <FormItem
                    label="Từ / cụm từ cấm"
                    invalid={Boolean(errors.word)}
                    errorMessage={errors.word?.message}
                >
                    <Controller
                        name="word"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="So khớp không phân biệt hoa thường"
                                className="rounded-sm"
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Nhóm (tùy chọn)"
                    invalid={Boolean(errors.category)}
                    errorMessage={errors.category?.message}
                >
                    <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="Ví dụ: chung, spam…"
                                className="rounded-sm"
                            />
                        )}
                    />
                </FormItem>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormItem
                        label="Thứ tự"
                        invalid={Boolean(errors.sortOrder)}
                        errorMessage={errors.sortOrder?.message}
                    >
                        <Controller
                            name="sortOrder"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="number"
                                    className="rounded-sm"
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem label="Áp dụng">
                        <Controller
                            name="isActive"
                            control={control}
                            render={({ field }) => (
                                <label className="flex items-center gap-2 text-sm text-slate-700 mt-2">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300"
                                        checked={field.value}
                                        onChange={(e) =>
                                            field.onChange(e.target.checked)
                                        }
                                    />
                                    <span>Đang bật</span>
                                </label>
                            )}
                        />
                    </FormItem>
                </div>
                <FormItem
                    label="Ghi chú"
                    invalid={Boolean(errors.note)}
                    errorMessage={errors.note?.message}
                >
                    <Controller
                        name="note"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="Nội bộ quản trị"
                                className="rounded-sm"
                            />
                        )}
                    />
                </FormItem>
                <div className="flex justify-end gap-2 mt-6">
                    <Button
                        type="button"
                        variant="plain"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        variant="solid"
                        loading={isSubmitting}
                        className="bg-[#1677ff] hover:bg-[#0958d9]"
                    >
                        Lưu
                    </Button>
                </div>
            </Form>
        </Dialog>
    )
}
