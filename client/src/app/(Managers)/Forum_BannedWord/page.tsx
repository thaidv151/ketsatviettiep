'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    Home,
    ChevronRight,
    Search,
    ChevronDown,
    Tag,
    Ban,
    FileText,
} from 'lucide-react'
import { HiOutlinePlus, HiOutlineSearch, HiOutlineRefresh } from 'react-icons/hi'
import { Card, Button, Input } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { showToast } from '@/components/ui/toast/toastUtils'
import { extractErrorMessage } from '@/utils/errorUtils'
import forumBannedWordService from '@/services/Forum/forumBannedWordService'
import { ForumBannedWordTable, ForumBannedWordFormModal } from './components'
import type {
    ForumBannedWordDto,
    ForumBannedWordSearchParams,
    ForumBannedWordPagedResult,
    ForumBannedWordCreateRequest,
    ForumBannedWordEditRequest,
} from '@/@types/Forum/forumBannedWord'

const emptyPaged: ForumBannedWordPagedResult = {
    items: [],
    totalCount: 0,
    pageIndex: 1,
    pageSize: 10,
    totalPage: 0,
}

export default function ForumBannedWordPage() {
    const [data, setData] = useState<ForumBannedWordPagedResult>(emptyPaged)
    const [loading, setLoading] = useState(false)
    const [searchParams, setSearchParams] = useState<ForumBannedWordSearchParams>(
        {
            keyword: '',
            isActive: '',
            pageIndex: 1,
            pageSize: 10,
            sortColumn: 'SortOrder',
            sortOrder: 'asc',
        },
    )
    const [searchForm, setSearchForm] = useState({
        keyword: '',
        isActive: '',
    })
    const [isSearchExpanded, setIsSearchExpanded] = useState(false)
    const [showFormModal, setShowFormModal] = useState(false)
    const [formEdit, setFormEdit] = useState(false)
    const [selectedItem, setSelectedItem] = useState<ForumBannedWordDto | null>(
        null,
    )
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const queryParams = useMemo(
        (): ForumBannedWordSearchParams => ({ ...searchParams }),
        [searchParams],
    )

    const loadData = useCallback(async (params: ForumBannedWordSearchParams) => {
        try {
            setLoading(true)
            const response = await forumBannedWordService.getData(params)
            if (response.success && response.data) {
                setData(response.data)
            } else {
                showToast(
                    extractErrorMessage(
                        response.error,
                        'Có lỗi xảy ra khi tải dữ liệu',
                    ),
                    'danger',
                )
            }
        } catch (error) {
            showToast(
                extractErrorMessage(error, 'Có lỗi xảy ra khi tải dữ liệu'),
                'danger',
            )
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadData(queryParams)
    }, [queryParams, loadData])

    const handleSearch = () => {
        setSearchParams((p) => ({
            ...p,
            keyword: searchForm.keyword.trim(),
            isActive: searchForm.isActive.trim(),
            pageIndex: 1,
        }))
    }

    const handleResetFilters = () => {
        setSearchForm({ keyword: '', isActive: '' })
        setSearchParams((p) => ({
            ...p,
            keyword: '',
            isActive: '',
            pageIndex: 1,
        }))
    }

    const handlePageChange = (page: number) => {
        setSearchParams((p) => ({ ...p, pageIndex: page }))
    }

    const handlePageSizeChange = (pageSize: number) => {
        setSearchParams((p) => ({ ...p, pageSize, pageIndex: 1 }))
    }

    const openCreate = () => {
        setSelectedItem(null)
        setFormEdit(false)
        setShowFormModal(true)
    }

    const openEdit = (item: ForumBannedWordDto) => {
        setSelectedItem(item)
        setFormEdit(true)
        setShowFormModal(true)
    }

    const handleFormSubmit = async (
        payload: ForumBannedWordCreateRequest | ForumBannedWordEditRequest,
    ) => {
        try {
            const res = formEdit
                ? await forumBannedWordService.update(
                      payload as ForumBannedWordEditRequest,
                  )
                : await forumBannedWordService.create(
                      payload as ForumBannedWordCreateRequest,
                  )
            if (res.success) {
                showToast(formEdit ? 'Đã cập nhật' : 'Đã thêm từ cấm', 'success')
                setShowFormModal(false)
                setSelectedItem(null)
                void loadData(queryParams)
            } else {
                showToast(
                    extractErrorMessage(res.error, 'Không thể lưu'),
                    'danger',
                )
            }
        } catch (error) {
            showToast(extractErrorMessage(error, 'Có lỗi xảy ra khi lưu'), 'danger')
        }
    }

    const handleToggleActive = async (item: ForumBannedWordDto) => {
        try {
            const res = await forumBannedWordService.toggleActive(item.id)
            if (res.success) {
                showToast('Đã cập nhật trạng thái áp dụng', 'success')
                void loadData(queryParams)
            } else {
                showToast(
                    extractErrorMessage(res.error, 'Không thể cập nhật'),
                    'danger',
                )
            }
        } catch (error) {
            showToast(
                extractErrorMessage(error, 'Có lỗi xảy ra khi cập nhật'),
                'danger',
            )
        }
    }

    const handleDeleteClick = (item: ForumBannedWordDto) => {
        setSelectedItem(item)
        setShowDeleteModal(true)
    }

    const handleDelete = async () => {
        if (!selectedItem) return
        try {
            const response = await forumBannedWordService.delete(selectedItem.id)
            if (response.success) {
                showToast('Đã xóa', 'success')
                setShowDeleteModal(false)
                setSelectedItem(null)
                void loadData(queryParams)
            } else {
                showToast(
                    extractErrorMessage(response.error, 'Không thể xóa'),
                    'danger',
                )
            }
        } catch (error) {
            showToast(
                extractErrorMessage(error, 'Có lỗi xảy ra khi xóa'),
                'danger',
            )
        }
    }

    return (
        <div className="space-y-6 pb-12 bg-slate-50/50 min-h-screen -m-4 p-4 lg:-m-8 lg:p-8">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-5">
                <Home
                    size={14}
                    className="hover:text-[#1677ff] cursor-pointer"
                />
                <ChevronRight size={14} />
                <span className="hover:text-[#1677ff] cursor-pointer">
                    Quản lý
                </span>
                <ChevronRight size={14} />
                <span className="font-semibold text-[#0958d9]">
                    Từ cấm bình luận
                </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-[#1677ff] rounded-sm">
                        <Ban size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none uppercase">
                            Từ cấm bình luận
                        </h2>
                        <p className="text-slate-500 mt-1.5 text-sm font-medium">
                            Cấu hình DB — cache danh sách đang bật ~2 phút trên server
                        </p>
                    </div>
                </div>
                <Button
                    variant="solid"
                    icon={<HiOutlinePlus />}
                    className="bg-[#1677ff] hover:bg-[#0958d9] shrink-0"
                    onClick={openCreate}
                >
                    Thêm từ cấm
                </Button>
            </div>

            <div
                className={`mb-5 group/card bg-white rounded-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] ${isSearchExpanded ? 'overflow-visible' : 'overflow-hidden'}`}
            >
                <div
                    className="px-8 py-5 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 group select-none"
                    onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setIsSearchExpanded(!isSearchExpanded)
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <div className="flex items-center gap-4">
                        <div
                            className={`h-11 w-11 rounded-sm flex items-center justify-center transition-all duration-300 ${isSearchExpanded ? 'bg-[#1677ff] text-white shadow-[0_4px_20px_rgba(22,119,255,0.25)]' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 shadow-inner'}`}
                        >
                            <Search size={20} />
                        </div>
                        <div className="flex flex-col text-left">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.15em]">
                                Công cụ tìm kiếm
                            </h3>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                {isSearchExpanded
                                    ? 'Nhấn để thu gọn'
                                    : 'Nhấn để mở rộng bộ lọc'}
                            </span>
                        </div>
                    </div>
                    <div
                        className={`transition-all duration-500 ease-spring text-slate-300 group-hover:text-slate-500 ${isSearchExpanded ? 'rotate-180 text-[#1677ff]' : ''}`}
                    >
                        <ChevronDown size={22} strokeWidth={2.5} />
                    </div>
                </div>
                <div
                    className={`transition-all duration-700 ease-in-out ${isSearchExpanded ? 'max-h-[2000px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}
                >
                    <div className="p-8 bg-linear-to-b from-white to-slate-50/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                            <div className="group space-y-2 md:col-span-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2.5">
                                    <div className="p-1 rounded-sm bg-blue-50 text-[#1677ff]">
                                        <FileText size={12} />
                                    </div>
                                    Từ khóa
                                </label>
                                <Input
                                    size="sm"
                                    placeholder="Tìm trong từ cấm hoặc nhóm…"
                                    value={searchForm.keyword}
                                    className="bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1677ff] transition-all rounded-sm h-10 px-4"
                                    onChange={(e) =>
                                        setSearchForm((p) => ({
                                            ...p,
                                            keyword: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="group space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2.5">
                                    <div className="p-1 rounded-sm bg-blue-50 text-[#1677ff]">
                                        <Tag size={12} />
                                    </div>
                                    Áp dụng
                                </label>
                                <select
                                    title="Lọc trạng thái"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-sm h-10 px-4 text-sm text-slate-800 focus:bg-white focus:border-[#1677ff] focus:outline-none transition-all"
                                    value={searchForm.isActive}
                                    onChange={(e) =>
                                        setSearchForm((p) => ({
                                            ...p,
                                            isActive: e.target.value,
                                        }))
                                    }
                                >
                                    <option value="">Tất cả</option>
                                    <option value="true">Đang bật</option>
                                    <option value="false">Đang tắt</option>
                                </select>
                            </div>
                            <div className="md:col-span-2 lg:col-span-3 flex items-end gap-3 lg:justify-end">
                                <Button
                                    variant="plain"
                                    onClick={handleResetFilters}
                                    icon={<HiOutlineRefresh />}
                                    className="text-slate-400 hover:text-slate-600 font-bold text-[10px] uppercase tracking-widest h-10 px-3 rounded-sm"
                                >
                                    Xóa lọc
                                </Button>
                                <Button
                                    variant="solid"
                                    onClick={handleSearch}
                                    icon={<HiOutlineSearch />}
                                    className="bg-[#1677ff] hover:bg-[#0958d9] text-white font-bold text-[10px] uppercase tracking-[0.2em] h-10 px-4 rounded-sm"
                                >
                                    Tìm kiếm
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Card
                className="rounded-sm border border-slate-200 shadow-sm"
                bodyClass="p-0"
            >
                <ForumBannedWordTable
                    data={data}
                    loading={loading}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    onEdit={openEdit}
                    onDelete={handleDeleteClick}
                    onToggleActive={handleToggleActive}
                    onClearFilters={handleResetFilters}
                />
            </Card>

            <ForumBannedWordFormModal
                isOpen={showFormModal}
                onClose={() => {
                    setShowFormModal(false)
                    setSelectedItem(null)
                }}
                onSubmit={handleFormSubmit}
                title={formEdit ? 'Sửa từ cấm' : 'Thêm từ cấm'}
                initialData={selectedItem}
                isEdit={formEdit}
            />

            {showDeleteModal && selectedItem && (
                <ConfirmDialog
                    isOpen={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false)
                        setSelectedItem(null)
                    }}
                    onConfirm={handleDelete}
                    title="Xác nhận xóa"
                    type="danger"
                    confirmText="Xóa"
                >
                    <p className="text-slate-600">
                        Xóa từ cấm{' '}
                        <span className="font-semibold">{selectedItem.word}</span>
                        ? Thao tác không thể hoàn tác.
                    </p>
                </ConfirmDialog>
            )}
        </div>
    )
}
