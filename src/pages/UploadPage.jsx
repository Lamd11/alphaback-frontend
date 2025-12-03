import { useState } from 'react';
import { uploadModel } from '../services/uploadService';
import './UploadPage.css';

function UploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [modelId, setModelId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate .class file extension
    if (!file.name.toLowerCase().endsWith('.class')) {
      setErrorMessage('Please select a .class file');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setErrorMessage('');
    setUploadStatus('idle');
    setModelId(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a file first');
      return;
    }

    try {
      setUploadStatus('uploading');
      setUploadProgress(0);
      setErrorMessage('');

      const result = await uploadModel(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      setModelId(result.modelId);
      setUploadStatus('success');
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
      setErrorMessage(
        error.response?.data?.error ||
        error.message ||
        'Upload failed. Please try again.'
      );
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setModelId(null);
    setErrorMessage('');
    // Reset file input
    document.getElementById('file-input').value = '';
  };

  return (
    <div className="upload-page">
      <div className="container">
        <h1>AlphaBack Model Upload</h1>
        <p className="subtitle">Upload your trading model (.class file)</p>

        <div className="upload-card">
          {uploadStatus === 'success' ? (
            <div className="success-view">
              <div className="success-icon">✓</div>
              <h2>Upload Successful!</h2>
              <div className="model-id-container">
                <label>Model ID:</label>
                <code className="model-id">{modelId}</code>
              </div>
              <p className="info-text">
                Your model has been uploaded and is pending verification.
              </p>
              <button onClick={handleReset} className="btn btn-secondary">
                Upload Another Model
              </button>
            </div>
          ) : (
            <div className="upload-view">
              <div className="file-input-container">
                <input
                  id="file-input"
                  type="file"
                  accept=".class"
                  onChange={handleFileSelect}
                  disabled={uploadStatus === 'uploading'}
                  className="file-input"
                />
                <label htmlFor="file-input" className="file-input-label">
                  {selectedFile ? selectedFile.name : 'Choose .class file'}
                </label>
              </div>

              {selectedFile && uploadStatus === 'idle' && (
                <div className="file-info">
                  <p>Selected: <strong>{selectedFile.name}</strong></p>
                  <p>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
              )}

              {uploadStatus === 'uploading' && (
                <div className="progress-container">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="progress-text">{uploadProgress}% uploaded</p>
                </div>
              )}

              {errorMessage && (
                <div className="error-message">
                  {errorMessage}
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploadStatus === 'uploading'}
                className="btn btn-primary"
              >
                {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Model'}
              </button>
            </div>
          )}
        </div>

        <div className="info-section">
          <h3>How it works:</h3>
          <ol>
            <li>Select your compiled Java model (.class file)</li>
            <li>Click "Upload Model" to upload to S3</li>
            <li>Your model will be validated by the Verify service</li>
            <li>Once validated, it will be ready for simulation</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default UploadPage;
