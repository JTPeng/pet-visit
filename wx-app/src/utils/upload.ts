import { env } from './env';
import { getToken } from '../api/request';

export interface UploadResult {
  url: string;
  key: string;
}

export function chooseImage(count = 1): Promise<string[]> {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => resolve(res.tempFilePaths as string[]),
      fail: (err) => reject(err),
    });
  });
}

export function uploadFile(filePath: string): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const token = getToken();
    uni.uploadFile({
      url: `${env.apiBaseUrl}/upload/image`,
      filePath,
      name: 'file',
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const body = JSON.parse(res.data);
          if (body.code === 0) {
            resolve(body.data as UploadResult);
            return;
          }
          uni.showToast({ title: body.message || '上传失败', icon: 'none' });
          reject(body);
        } else {
          uni.showToast({ title: '上传失败', icon: 'none' });
          reject(res);
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络异常', icon: 'none' });
        reject(err);
      },
    });
  });
}

export async function uploadFiles(filePaths: string[]): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  for (const path of filePaths) {
    const result = await uploadFile(path);
    results.push(result);
  }
  return results;
}

export async function chooseAndUpload(count = 1): Promise<UploadResult[]> {
  const paths = await chooseImage(count);
  return uploadFiles(paths);
}
