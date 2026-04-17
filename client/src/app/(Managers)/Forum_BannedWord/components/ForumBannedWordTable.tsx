'use client'

import { HiOutlineSearch } from 'react-icons/hi'
import { Ban, Pencil, Power, Trash2 } from 'lucide-react'
import { Button, Pagination, Skeleton, Table } from '@/components/ui'
import type {
    ForumBannedWordDto,
    ForumBannedWordPagedResult,
} from '@/@types/Forum/forumBannedWord'

interface ForumBannedWordTableProps {
    data: ForumBannedWordPagedResult
    loading: boolean
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    onEdit: (item: ForumBannedWordDto) => void
    onDelete: (item: ForumBannedWordDto) => void
    onToggleActive: (item: ForumBannedWordDto) => void
    onClearFilters?: () => void
}

const COL_COUNT = 8

export function ForumBannedWordTable({
    data,
    loading,
    onPageChange,
    onPageSizeChange,
    onEdit,
    onDelete,
    onToggleActive,
    onClearFilters,
}: ForumBannedWordTableProps) {
    const formatDate = (dateString?: string) => {
        if (!dateString) return '--'
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const renderSkeleton = () => (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
                <div
                    key={index}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-sm"
                >
                    <Skeleton className="w-12 h-12 rounded" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    )

    if (loading) {
        return <div className="p-6">{renderSkeleton()}</div>
    }

    return (
        <>
            <div className="overflow-x-auto lg:overflow-visible">
                <Table className="w-full border-collapse">
                    <Table.THead>
                        <Table.Tr className="bg-slate-50 border-b border-slate-200">
                            <Table.Th className="w-[56px] text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50/50">
                                STT
                            </Table.Th>
                            <Table.Th className="min-w-[180px] text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50/50">
                                Từ cấm
                            </Table.Th>
                            <Table.Th className="w-[120px] text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50/50">
                                Nhóm
                            </Table.Th>
                            <Table.Th className="w-[100px] text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50/50">
                                Áp dụng
                            </Table.Th>
                            <Table.Th className="w-[80px] text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50/50">
                                Thứ tự
                            </Table.Th>
                            <Table.Th className="min-w-[140px] text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50/50">
                                Ghi chú
                            </Table.Th>
                            <Table.Th className="w-[130px] text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50/50">
                                Ngày tạo
                            </Table.Th>
                            <Table.Th className="w-[140px] sticky right-0 z-20 bg-slate-50 border-l border-slate-200 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest shadow-[-4px_0_8px_rgba(0,0,0,0.02)]">
                                Thao tác
                            </Table.Th>
                        </Table.Tr>
                    </Table.THead>
                    <Table.TBody>
                        {data.items && data.items.length > 0 ? (
                            data.items.map((item, index) => (
                                <Table.Tr
                                    key={item.id}
                                    className="group hover:bg-slate-50/50 border-b border-slate-100 transition-all duration-200"
                                >
                                    <Table.Td className="text-center p-3 font-mono text-xs text-slate-400">
                                        {(data.pageIndex - 1) * data.pageSize +
                                            index +
                                            1}
                                    </Table.Td>
                                    <Table.Td className="p-3">
                                        <span
                                            className="text-sm font-semibold text-slate-800"
                                            title={item.word}
                                        >
                                            {item.word}
                                        </span>
                                    </Table.Td>
                                    <Table.Td className="p-3 text-xs text-slate-600 truncate max-w-[120px]">
                                        {item.category?.trim() || '—'}
                                    </Table.Td>
                                    <Table.Td className="p-3 text-center">
                                        <span
                                            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                                item.isActive
                                                    ? 'border-blue-200 bg-blue-50 text-blue-800'
                                                    : 'border-slate-200 bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            {item.isActive ? 'Bật' : 'Tắt'}
                                        </span>
                                    </Table.Td>
                                    <Table.Td className="p-3 text-center text-xs font-mono text-slate-600">
                                        {item.sortOrder}
                                    </Table.Td>
                                    <Table.Td className="p-3 text-xs text-slate-600 line-clamp-2 max-w-[200px]">
                                        {item.note?.trim() || '—'}
                                    </Table.Td>
                                    <Table.Td className="p-3 text-center text-xs text-slate-600">
                                        {formatDate(item.createdDate)}
                                    </Table.Td>
                                    <Table.Td className="p-3 sticky right-0 z-20 bg-white group-hover:bg-slate-50 border-l border-slate-200 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] transition-colors">
                                        <div className="flex flex-wrap justify-center gap-1">
                                            <button
                                                type="button"
                                                title="Sửa"
                                                className="p-1.5 rounded-sm text-slate-600 hover:bg-slate-100"
                                                onClick={() => onEdit(item)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                title={
                                                    item.isActive
                                                        ? 'Tắt áp dụng'
                                                        : 'Bật áp dụng'
                                                }
                                                className="p-1.5 rounded-sm text-[#1677ff] hover:bg-blue-50"
                                                onClick={() =>
                                                    onToggleActive(item)
                                                }
                                            >
                                                <Power className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                title="Xóa"
                                                className="p-1.5 rounded-sm text-red-600 hover:bg-red-50"
                                                onClick={() => onDelete(item)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </Table.Td>
                                </Table.Tr>
                            ))
                        ) : (
                            <Table.Tr>
                                <Table.Td
                                    colSpan={COL_COUNT}
                                    className="text-center py-20 bg-slate-50/30"
                                >
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="relative mb-6">
                                            <div className="absolute inset-0 bg-indigo-100/50 rounded-full blur-2xl animate-pulse" />
                                            <div className="relative p-8 bg-white rounded-full shadow-sm border border-slate-100">
                                                <Ban className="h-14 w-14 text-slate-300" />
                                            </div>
                                        </div>
                                        <p className="text-xl font-extrabold text-slate-700 mb-2 uppercase tracking-tight">
                                            Chưa có từ cấm
                                        </p>
                                        <p className="text-slate-400 max-w-[320px] mx-auto text-sm leading-relaxed">
                                            Thêm từ hoặc cụm từ để lọc nội dung bình luận (cache
                                            server ~2 phút).
                                        </p>
                                        {onClearFilters ? (
                                            <Button
                                                variant="plain"
                                                size="sm"
                                                className="mt-6 font-bold text-[#1677ff] hover:text-[#0958d9] hover:bg-blue-50"
                                                onClick={onClearFilters}
                                            >
                                                Xóa bộ lọc
                                            </Button>
                                        ) : null}
                                    </div>
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.TBody>
                </Table>
            </div>

            {data.totalCount > 0 && (
                <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-white rounded-sm border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#1677ff] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
                        <HiOutlineSearch className="h-4 w-4 text-[#1677ff]" />
                        <span>
                            Hiển thị{' '}
                            <span className="text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded ml-1">
                                {(data.pageIndex - 1) * data.pageSize + 1}
                            </span>
                            <span className="mx-1.5">-</span>
                            <span className="text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                                {Math.min(
                                    data.pageIndex * data.pageSize,
                                    data.totalCount,
                                )}
                            </span>
                            <span className="mx-2 text-slate-300">/</span>
                            <span className="text-[#1677ff] font-extrabold text-[13px]">
                                {data.totalCount}
                            </span>
                            <span className="ml-1.5">mục</span>
                        </span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-sm border border-slate-100 flex flex-wrap items-center justify-center gap-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <span className="whitespace-nowrap">Số dòng</span>
                            <select
                                title="Chọn số bản ghi hiển thị"
                                value={data.pageSize}
                                onChange={(e) =>
                                    onPageSizeChange(Number(e.target.value))
                                }
                                className="border border-slate-200 rounded-sm px-2 py-1.5 text-sm bg-white text-slate-800 font-medium min-w-18"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </label>
                        <Pagination
                            currentPage={data.pageIndex}
                            total={data.totalCount}
                            pageSize={data.pageSize}
                            onChange={onPageChange}
                        />
                    </div>
                </div>
            )}
        </>
    )
}
