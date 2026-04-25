import { http } from './api'
import type { ApiResponse, PagedList } from '@/types'
import type { 
  DanhMucDto, DanhMucSearch, DanhMucCreateVM, DanhMucEditVM,
  NhomDanhMucDto, NhomDanhMucSearch, NhomDanhMucCreateVM, NhomDanhMucEditVM 
} from '@/types/danhMuc'

export const nhomDanhMucApi = {
  async getData(search: NhomDanhMucSearch): Promise<ApiResponse<PagedList<NhomDanhMucDto>>> {
    return http.post('/api/NhomDanhMuc/GetData', search)
  },
  async getById(id: string): Promise<ApiResponse<NhomDanhMucDto>> {
    return http.get(`/api/NhomDanhMuc/${id}`)
  },
  async create(body: NhomDanhMucCreateVM): Promise<ApiResponse<NhomDanhMucDto>> {
    return http.post('/api/NhomDanhMuc', body)
  },
  async update(id: string, body: NhomDanhMucEditVM): Promise<ApiResponse<NhomDanhMucDto>> {
    return http.post(`/api/NhomDanhMuc/${id}`, body)
  },
  async remove(id: string): Promise<ApiResponse<string>> {
    return http.post(`/api/NhomDanhMuc/${id}/Delete`)
  }
}

export const danhMucApi = {
  async getData(search: DanhMucSearch): Promise<ApiResponse<PagedList<DanhMucDto>>> {
    return http.post('/api/DanhMuc/GetData', search)
  },
  async getById(id: string): Promise<ApiResponse<DanhMucDto>> {
    return http.get(`/api/DanhMuc/${id}`)
  },
  async create(body: DanhMucCreateVM): Promise<ApiResponse<DanhMucDto>> {
    return http.post('/api/DanhMuc', body)
  },
  async update(id: string, body: DanhMucEditVM): Promise<ApiResponse<DanhMucDto>> {
    return http.post(`/api/DanhMuc/${id}`, body)
  },
  async remove(id: string): Promise<ApiResponse<string>> {
    return http.post(`/api/DanhMuc/${id}/Delete`)
  }
}
