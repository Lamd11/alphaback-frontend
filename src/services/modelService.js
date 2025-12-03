import axios from 'axios';

const MODELS_API_URL = 'https://axth05tmk7.execute-api.us-east-2.amazonaws.com/models';

/**
 * Fetch all models from the Model Registry
 * @returns {Promise<Array>} Array of model objects
 */
export async function fetchModels() {
  try {
    const response = await axios.get(MODELS_API_URL);
    const models = response.data.items || [];

    // Parse the report JSON string for each model
    return models.map(model => {
      let parsedReport = null;
      if (model.report) {
        try {
          parsedReport = JSON.parse(model.report);
        } catch (e) {
          console.error('Failed to parse report for model:', model.model_id);
        }
      }

      return {
        ...model,
        parsedReport
      };
    });
  } catch (error) {
    console.error('Failed to fetch models:', error);
    throw error;
  }
}

/**
 * Get model name from s3_key or classPath
 * @param {Object} model - The model object
 * @returns {string} Model display name
 */
export function getModelName(model) {
  if (model.classPath) {
    // Extract class name from path (e.g., "com/example/TrendFollowerModel" -> "TrendFollowerModel")
    const parts = model.classPath.split('/');
    return parts[parts.length - 1];
  }

  if (model.s3_key) {
    // Extract from s3_key (e.g., "java-classes/.../TrendFollowerModel.class" -> "TrendFollowerModel")
    const fileName = model.s3_key.split('/').pop();
    return fileName.replace('.class', '');
  }

  return model.model_id;
}
