import AxiosBase from './axios/AxiosBase';

export interface UploadResponse {
  url: string;
  name: string;
  size: number;
}

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await AxiosBase.post<UploadResponse>('/admin/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url;
};

export const uploadService = {
  uploadFile,
};
