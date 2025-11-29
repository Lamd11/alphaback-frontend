import axios from 'axios';

const API_URL = import.meta.env.VITE_MODEL_UPLOAD_API_URL;

/**
 * Step 1: Request a pre-signed URL from the Model Upload Service
 * @param {string} fileName - The name of the file to upload (must end with .class)
 * @returns {Promise<Object>} Response with model_id, uploadUrl, s3Key, status
 */
export async function requestPresignedUrl(fileName) {
  console.log('Requesting presigned URL for:', fileName);
  console.log('API URL:', API_URL);

  const response = await axios.post(API_URL, {
    fileName: fileName
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  console.log('Presigned URL response:', response.data);
  return response.data;
}

/**
 * Step 2: Upload the file to S3 using the pre-signed URL
 * @param {string} uploadUrl - The pre-signed URL from Step 1
 * @param {File} file - The file object to upload
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<void>}
 */
export async function uploadFileToS3(uploadUrl, file, onProgress) {
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentage);
      }
    }
  });
}

/**
 * Complete upload flow: request URL and upload file
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<Object>} Upload result with model_id
 */
export async function uploadModel(file, onProgress) {
  // Step 1: Get pre-signed URL
  const presignedData = await requestPresignedUrl(file.name);

  // Step 2: Upload to S3
  await uploadFileToS3(presignedData.uploadUrl, file, onProgress);

  return {
    modelId: presignedData.model_id,
    s3Key: presignedData.s3Key,
    status: presignedData.status
  };
}
