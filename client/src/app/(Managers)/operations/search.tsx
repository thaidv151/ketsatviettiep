'use client'

import { Search, ChevronDown, FileText, Tag, Layers, RefreshCcwIcon, SearchIcon } from 'lucide-react'
import { Input, Select, Button } from 'antd'
import type { ModuleDto } from '@/services/rbacAdminApi'

export type OperationSearchState = {
  keyword: string
  status: '' | 'true' | 'false'
  moduleId: string
}

type OperationSearchPanelProps = {
  expanded: boolean
  onToggle: () => void
  form: OperationSearchState
  modules: ModuleDto[]
  onFormChange: (next: OperationSearchState) => void
  onSearch: () => void
  onReset: () => void
}

const primaryBtn =
  'bg-[#1677ff] hover:bg-[#0958d9] border-[#1677ff] font-bold uppercase tracking-widest text-[10px] h-10'

export default function OperationSearchPanel({
  expanded,
  onToggle,
  form,
  modules,
  onFormChange,
  onSearch,
  onReset,
}: OperationSearchPanelProps) {
  return (
    <div
      className={`mb-5 group/card bg-white rounded-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] ${expanded ? 'overflow-visible' : 'overflow-hidden'}`}
    >
      <div
        className="px-8 py-5 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 group select-none"
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggle()
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center gap-4">
          <div
            className={`h-11 w-11 rounded-sm flex items-center justify-center transition-all duration-300 ${expanded ? 'bg-[#1677ff] text-white shadow-[0_4px_20px_rgba(22,119,255,0.25)]' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 shadow-inner'}`}
          >
            <Search size={20} />
          </div>
          <div className="flex flex-col text-left">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.15em]">
              Bộ lọc operation
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              {expanded ? 'Nhấn để thu gọn' : 'Nhấn để mở rộng bộ lọc'}
            </span>
          </div>
        </div>
        <div
          className={`transition-all duration-500 ease-spring text-slate-300 group-hover:text-slate-500 ${expanded ? 'rotate-180 text-[#1677ff]' : ''}`}
        >
          <ChevronDown size={22} strokeWidth={2.5} />
        </div>
      </div>
      <div
        className={`transition-all duration-700 ease-in-out ${expanded ? 'max-h-[2000px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}
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
                allowClear
                placeholder="Tên, mã, URL..."
                value={form.keyword}
                className="rounded-sm h-10"
                onChange={(e) =>
                  onFormChange({ ...form, keyword: e.target.value })
                }
              />
            </div>
            <div className="group space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2.5">
                <div className="p-1 rounded-sm bg-blue-50 text-[#1677ff]">
                  <Layers size={12} />
                </div>
                Module
              </label>
              <Select
                className="w-full h-10"
                placeholder="Chọn module"
                value={form.moduleId || undefined}
                options={modules.map((m) => ({ value: m.id, label: m.name }))}
                onChange={(v) => onFormChange({ ...form, moduleId: v ?? '' })}
              />
            </div>
            <div className="group space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2.5">
                <div className="p-1 rounded-sm bg-blue-50 text-[#1677ff]">
                  <Tag size={12} />
                </div>
                Hiển thị
              </label>
              <Select
                className="w-full h-10"
                placeholder="Tất cả"
                value={form.status || undefined}
                allowClear
                options={[
                  { value: 'true', label: 'Đang hiển thị' },
                  { value: 'false', label: 'Đang ẩn' },
                ]}
                onChange={(v) =>
                  onFormChange({
                    ...form,
                    status: (v ?? '') as '' | 'true' | 'false',
                  })
                }
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex items-end gap-3 lg:justify-end">
              <Button
                type="text"
                icon={<RefreshCcwIcon />}
                className="text-slate-400 font-bold text-[10px] uppercase tracking-widest h-10"
                onClick={onReset}
              >
                Xóa lọc
              </Button>
              <Button
                type="primary"
                icon={<SearchIcon />}
                className={primaryBtn}
                onClick={onSearch}
              >
                Tìm kiếm
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
