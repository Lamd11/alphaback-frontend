import json
import os
import uuid
from datetime import datetime, timezone

import boto3

AWS_REGION = os.getenv("AWS_REGION")
MODEL_BUCKET = os.getenv("MODELS_BUCKET")
MODEL_UPLOAD_TABLE = os.getenv("UPLOAD_STATUS_TABLE")

if not AWS_REGION:
    raise RuntimeError("AWS_REGION env var is not set")
if not MODEL_BUCKET:
    raise RuntimeError("MODELS_BUCKET env var is not set")
if not MODEL_UPLOAD_TABLE:
    raise RuntimeError("UPLOAD_STATUS_TABLE env var is not set")

s3_client = boto3.client("s3", region_name=AWS_REGION)
dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
table = dynamodb.Table(MODEL_UPLOAD_TABLE)


def _response(status_code, body_dict):
    """Helper function to return response with CORS headers"""
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "POST, OPTIONS"
        },
        "body": json.dumps(body_dict)
    }


def lambda_handler(event, context):
    """
    Main Lambda handler function
    Parameters:
        event: Dict containing the Lambda function event data
        context: Lambda runtime context
    Returns:
        Dict containing status message
    """
    # Handle OPTIONS preflight request for CORS
    if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS":
        return _response(200, {"message": "OK"})

    try:
        body = event.get("body") or "{}"
        # For HTTP API, body is a JSON string
        data = json.loads(body)
    except Exception:
        return _response(400, {"error": "Invalid JSON body"})

    file_name = data.get("fileName")

    if not file_name:
        return _response(400, {"error": "fileName is required"})

    if not file_name.lower().endswith(".class"):
        return _response(400, {"error": "fileName must end with .class"})

    # Generate model_id and S3 key
    model_id = str(uuid.uuid4())
    s3_key = f"java-classes/{model_id}/{file_name}"

    try:
        upload_url = s3_client.generate_presigned_url(
            ClientMethod="put_object",
            Params={"Bucket": MODEL_BUCKET, "Key": s3_key},
            ExpiresIn=3600,
        )
    except Exception as e:
        return _response(500, {"error": f"Failed to generate pre-signed URL: {str(e)}"})

    # Store upload status in DynamoDB
    now = datetime.now(timezone.utc).isoformat()

    item = {
        "model_id": model_id,
        "s3Key": s3_key,
        "status": "PRESIGNED_CREATED",
        "createdAt": now,
        "updatedAt": now,
    }

    try:
        table.put_item(Item=item)
    except Exception as e:
        return _response(500, {"error": f"Failed to write to DynamoDB: {str(e)}"})

    return _response(200, {
        "message": "Pre-signed URL created",
        "model_id": model_id,
        "uploadUrl": upload_url,
        "s3Key": s3_key,
        "status": "PRESIGNED_CREATED",
    })
