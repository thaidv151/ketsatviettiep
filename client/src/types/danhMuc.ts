export interface NhomDanhMucDto {
  id: string
  maNhomDanhMuc: string
  tenNhomDanhMuc: string
  iconUrl?: string
  thuTuHienThi?: number
}

export interface NhomDanhMucSearch {
  query?: string
  pageIndex: number
  pageSize: number
  sortColumn?: string
  sortOrder?: string
}

export interface NhomDanhMucCreateVM {
  maNhomDanhMuc: string
  tenNhomDanhMuc: string
  iconUrl?: string
  thuTuHienThi?: number
}

export interface NhomDanhMucEditVM extends NhomDanhMucCreateVM {}

export interface DanhMucDto {
  id: string
  maDanhMuc: string
  tenDanhMuc: string
  moTa?: string
  maNhomDanhMuc: string
  iconUrl?: string
  loaiNgonNgu?: string
  thuTuHienThi?: number
  isActive: boolean
  duongDanFile?: string
  urlLink?: string
}

export interface DanhMucSearch {
  query?: string
  maNhomDanhMuc?: string
  pageIndex: number
  pageSize: number
  sortColumn?: string
  sortOrder?: string
}

export interface DanhMucCreateVM {
  maDanhMuc: string
  tenDanhMuc: string
  moTa?: string
  maNhomDanhMuc: string
  iconUrl?: string
  loaiNgonNgu?: string
  thuTuHienThi?: number
  isActive: boolean
  duongDanFile?: string
  urlLink?: string
}

export interface DanhMucEditVM extends DanhMucCreateVM {}
