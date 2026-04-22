'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Modal, Spin } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { uploadFile } from '@/services/upload.service';
import { getFullImagePath } from '@/lib/path-utils';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  /** Đường dẫn ảnh hiện tại (được truyền từ Form.Item) */
  value?: string;
  /** Hàm callback khi có sự thay đổi (để Form.Item nhận dữ liệu) */
  onChange?: (url: string) => void;
  /** Chữ hiển thị bên dưới icon upload */
  placeholder?: string;
  /** Giới hạn kích thước file (MB), mặc định 2MB */
  maxSize?: number;
}

/**
 * Component Upload ảnh dùng chung, tích hợp mượt mà với Ant Design Form.Item.
 * Hỗ trợ:
 * - Upload file lên server qua API.
 * - Hiển thị preview ảnh sau khi upload.
 * - Tự động cập nhật giá trị vào Form qua props value/onChange.
 */
const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  placeholder = 'Tải ảnh',
  maxSize = 2
}) => {
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { toast } = useToast();

  // Đồng bộ fileList khi value (đường dẫn từ form) thay đổi
  useEffect(() => {
    if (value) {
      setFileList([
        {
          uid: '-1',
          name: 'image.png',
          status: 'done',
          url: getFullImagePath(value),
        },
      ]);
    } else {
      setFileList([]);
    }
  }, [value]);

  const handlePreview = async (file: UploadFile) => {
    setPreviewImage(getFullImagePath(file.url || (file.preview as string)));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    // Nếu xóa ảnh, báo lại cho Form
    if (newFileList.length === 0) {
      onChange?.('');
    }
  };

  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
    if (!isJpgOrPng) {
      toast({
        variant: 'destructive',
        title: 'Lỗi định dạng',
        description: 'Bạn chỉ có thể tải lên định dạng JPG/PNG/WebP!',
      });
    }
    const isLtSize = file.size / 1024 / 1024 < maxSize;
    if (!isLtSize) {
      toast({
        variant: 'destructive',
        title: 'Lỗi kích thước',
        description: `Ảnh phải nhỏ hơn ${maxSize}MB!`,
      });
    }
    return isJpgOrPng && isLtSize;
  };

  const handleCustomRequest = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setLoading(true);
    try {
      // Gọi API upload lên server
      const url = await uploadFile(file as File);

      onSuccess(url);
      // Cập nhật đường dẫn trả về vào Form
      onChange?.(url);
      toast({
        variant: 'success',
        title: 'Thành công',
        description: 'Tải ảnh lên thành công',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      onError(error);
      toast({
        variant: 'destructive',
        title: 'Lỗi upload',
        description: 'Tải ảnh lên thất bại!',
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div className="flex flex-col items-center justify-center">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>{placeholder}</div>
    </div>
  );

  return (
    <>
      <Upload
        name="file"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={true}
        fileList={fileList}
        maxCount={1}
        beforeUpload={beforeUpload}
        customRequest={handleCustomRequest}
        onPreview={handlePreview}
        onChange={handleChange}
      >
        {fileList.length >= 1 ? null : uploadButton}
      </Upload>

      <Modal
        open={previewOpen}
        title="Xem trước ảnh"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        centered
      >
        <img alt="preview" style={{ width: '100%', borderRadius: '8px' }} src={previewImage} />
      </Modal>
    </>
  );
};

export default ImageUpload;
