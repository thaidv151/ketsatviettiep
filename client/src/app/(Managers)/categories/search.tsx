'use client'
import { SearchOutlined, DownOutlined, FileTextOutlined, TagOutlined, ReloadOutlined } from '@ant-design/icons'
import { Input, Select, Button } from 'antd'

export type CategorySearchState = {
  keyword: string
  isActive: '' | 'true' | 'false'
}

type Props = {
  expanded: boolean
  onToggle: () => void
  form: CategorySearchState
  onFormChange: (next: CategorySearchState) => void
  onSearch: () => void
  onReset: () => void
}

const primaryBtn = 'bg-[#1677ff] hover:bg-[#0958d9] border-[#1677ff] font-bold uppercase tracking-widest text-[10px] h-10'

export default function CategorySearch({ expanded, onToggle, form, onFormChange, onSearch, onReset }: Props) {
  return (
    <div className={`mb-5 group/card bg-white rounded-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] ${expanded ? 'overflow-visible' : 'overflow-hidden'}`}>
      <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 group select-none"
        onClick={onToggle} role="button" tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle() } }}>
        <div className="flex items-center gap-4">
          <div className={`h-11 w-11 rounded-sm flex items-center justify-center transition-all duration-300 ${expanded ? 'bg-[#1677ff] text-white shadow-[0_4px_20px_rgba(22,119,255,0.25)]' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 shadow-inner'}`}>
            <SearchOutlined style={{ fontSize: 20 }} />
          </div>
          <div className="flex flex-col text-left">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.15em]">Công cụ tìm kiếm</h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              {expanded ? 'Nhấn để thu gọn' : 'Nhấn để mở rộng bộ lọc'}
            </span>
          </div>
        </div>
        <div className={`transition-all duration-500 text-slate-300 group-hover:text-slate-500 ${expanded ? 'rotate-180 text-[#1677ff]' : ''}`}>
          <DownOutlined style={{ fontSize: 22 }} />
        </div>
      </div>
      <div className={`transition-all duration-700 ease-in-out ${expanded ? 'max-h-[2000px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-8 bg-linear-to-b from-white to-slate-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            <div className="group space-y-2 md:col-span-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2.5">
                <div className="p-1 rounded-sm bg-blue-50 text-[#1677ff]"><FileTextOutlined /></div>
                Từ khóa
              </label>
              <Input allowClear placeholder="Tên danh mục, slug…" value={form.keyword} className="rounded-sm h-10"
                onChange={(e) => onFormChange({ ...form, keyword: e.target.value })} />
            </div>
            <div className="group space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2.5">
                <div className="p-1 rounded-sm bg-blue-50 text-[#1677ff]"><TagOutlined /></div>
                Trạng thái
              </label>
              <Select className="w-full h-10" placeholder="Tất cả" value={form.isActive || undefined} allowClear
                options={[{ value: 'true', label: 'Hoạt động' }, { value: 'false', label: 'Ẩn' }]}
                onChange={(v) => onFormChange({ ...form, isActive: (v ?? '') as '' | 'true' | 'false' })} />
            </div>
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
