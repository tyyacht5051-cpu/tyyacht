import fs from 'fs';
import path from 'path';
import { config } from '../config/env';

/**
 * 디렉토리를 안전하게 생성 (리눅스 권한 고려)
 */
export function ensureDirectory(dirPath: string): void {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, {
        recursive: true,
        mode: 0o755 // 리눅스에서 rwxr-xr-x 권한
      });
      console.log(`📁 Created directory: ${dirPath}`);
    }
  } catch (error) {
    console.error(`❌ Failed to create directory ${dirPath}:`, error);
    throw error;
  }
}

/**
 * 파일을 안전하게 추가 (로그 파일 등)
 */
export function appendToFile(filePath: string, content: string): void {
  try {
    // 디렉토리가 없으면 생성
    const dirPath = path.dirname(filePath);
    ensureDirectory(dirPath);

    fs.appendFileSync(filePath, content, {
      encoding: 'utf8',
      mode: 0o644 // 리눅스에서 rw-r--r-- 권한
    });
  } catch (error) {
    console.error(`❌ Failed to append to file ${filePath}:`, error);
    throw error;
  }
}

/**
 * 파일을 안전하게 작성
 */
export function writeFile(filePath: string, content: string): void {
  try {
    // 디렉토리가 없으면 생성
    const dirPath = path.dirname(filePath);
    ensureDirectory(dirPath);

    fs.writeFileSync(filePath, content, {
      encoding: 'utf8',
      mode: 0o644 // 리눅스에서 rw-r--r-- 권한
    });
  } catch (error) {
    console.error(`❌ Failed to write file ${filePath}:`, error);
    throw error;
  }
}

/**
 * 업로드 디렉토리 초기화
 */
export function initializeUploadDirectories(): void {
  const uploadDirs = [
    path.join(process.cwd(), config.UPLOAD_PATH),
    path.join(process.cwd(), config.UPLOAD_PATH, 'photos'),
    path.join(process.cwd(), config.UPLOAD_PATH, 'videos'),
    path.join(process.cwd(), config.UPLOAD_PATH, 'thumbnails'),
    path.join(process.cwd(), config.UPLOAD_PATH, 'notices'),
    path.join(process.cwd(), config.LOG_PATH)
  ];

  console.log('📁 Initializing directories...');
  uploadDirs.forEach(dir => {
    ensureDirectory(dir);
  });
  console.log('✅ All directories initialized');
}

/**
 * 파일 존재 여부 확인
 */
export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * 안전한 파일 삭제
 */
export function safeDeleteFile(filePath: string): boolean {
  try {
    if (fileExists(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted file: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Failed to delete file ${filePath}:`, error);
    return false;
  }
}