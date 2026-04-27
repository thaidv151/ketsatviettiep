'use client'
import { SearchOutlined, DownOutlined, FileTextOutlined, TagOutlined, ReloadOutlined } from '@ant-design/icons'
import { Input, Select, Button } from 'antd'

export type BannerSearchState = {
  keyword: string
  isActive: '' | 'true' | 'false'
}

type Props = {
  expanded: boolean
  onToggle: () => void
  form: BannerSearchState
  onFormChange: (next: BannerSearchState) => void
  onSearch: () => void
  onReset: () => void
}

const primaryBtn = 'bg-[#1677ff] hover:bg-[#0958d9] border-[#1677ff] font-bold uppercase tracking-widest text-[10px] h-10'

export default function BannerSearch({ expanded, onToggle, form, onFormChange, onSearch, onReset }: Props) {
  return (
    <div className={`mb-5 bg-white rounded-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 transition-all duration-500 ${expanded ? 'overflow-visible' : 'overflow-hidden'}`}>
      <div
        className="px-8 py-5 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 select-none"
        onClick={onToggle} role="button" tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') onToggle() }}
      >
        <div className="flex items-center gap-4">
          <div className={`h-11 w-11 rounded-sm flex items-center justify-center transition-all duration-300 ${expanded ? 'bg-[#1677ff] text-white' : 'bg-slate-100 text-slate-400'}`}>
            <SearchOutlined style={{ fontSize: 20 }} />
          </div>
          <div><h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.15em]">Công cụ tìm kiếm</h3></div>
        </div>
        <div className={`transition-all duration-500 text-slate-300 ${expanded ? 'rotate-180 text-[#1677ff]' : ''}`}><DownOutlined /></div>
      </div>

      <div className={`transition-all duration-700 ${expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            {/* Từ khóa */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2.5">
                <div className="p-1 rounded-sm bg-blue-50 text-[#1677ff]"><FileTextOutlined /></div>Từ khóa
              </label>
              <Input
                allowClear placeholder="Tiêu đề banner…" value={form.keyword}
                className="rounded-sm h-10"
                onChange={(e) => onFormChange({ ...form, keyword: e.target.value })}
              />
            </div>

            {/* Trạng thái */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2.5">
                <div className="p-1 rounded-sm bg-blue-50 text-[#1677ff]"><TagOutlined /></div>Trạng thái
              </label>
              <Select
                className="w-full h-10" placeholder="Tất cả"
                value={form.isActive || undefined} allowClear
                options={[{ value: 'true', label: 'Đang hiển thị' }, { value: 'false', label: 'Đã ẩn' }]}
                onChange={(v) => onFormChange({ ...form, isActive: (v ?? '') as '' | 'true' | 'false' })}
              />
            </div>

            {/* Buttons */}
            <div className="md:col-span-2 lg:col-span-3 flex items-end gap-3 lg:justify-end">
              <Button type="text" icon={<ReloadOutlined />} className="text-slate-400 font-bold text-[10px] uppercase tracking-widest h-10" onClick={onReset}>Xóa lọc</Button>
              <Button type="primary" icon={<SearchOutlined />} className={primaryBtn} onClick={onSearch}>Tìm kiếm</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
