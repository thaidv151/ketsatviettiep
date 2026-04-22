import appConfig from '@/configs/app.config';

/**
 * Lấy đường dẫn đầy đủ của ảnh từ một path tương đối.
 * Nếu path đã là URL tuyệt đối hoặc là base64, trả về chính nó.
 */
export function getFullImagePath(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) {
    return path;
  }
  
  const prefix = appConfig.apiPrefix.endsWith('/') 
    ? appConfig.apiPrefix.slice(0, -1) 
    : appConfig.apiPrefix;
    
  const relativePath = path.startsWith('/') ? path : `/${path}`;
  
  return `${prefix}${relativePath}`;
}
