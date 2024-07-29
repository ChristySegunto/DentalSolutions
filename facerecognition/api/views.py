#VIEWS.PY
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import cv2
import numpy as np
import torch
from facenet_pytorch import InceptionResnetV1, MTCNN
from PIL import Image
import base64
import json
from io import BytesIO
from django.conf import settings  # Ensure your Django settings are imported

import pandas as pd
from django.http import JsonResponse
from statsmodels.tsa.arima.model import ARIMA
from .supabase_client import supabase  # Import Supabase client

import logging
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FaceNet model
model = InceptionResnetV1(pretrained='vggface2').eval()

# # Load your known face embeddings and labels (this is just an example)
# known_face_embeddings = []  # List of numpy arrays
# known_face_labels = []

# Initialize MTCNN for face detection
mtcnn = MTCNN()

@csrf_exempt
def capture_images(request):
    if request.method == 'POST':
        try:
            image = request.FILES['image']
            patient_username = request.POST['patient_username']

            # Save the image to the media directory
            path = default_storage.save(os.path.join('images', patient_username, 'raw', image.name), ContentFile(image.read()))

            # # Read the saved image
            # image_path = os.path.join('media', path)
            img = Image.open(path)

            # Ensure the image is in RGB format
            img_rgb = img.convert('RGB')

            # Convert image to numpy array
            img_np = np.array(img_rgb)

            # Detect faces
            boxes, probs = mtcnn.detect(img_np)
            if boxes is not None:
                for box in boxes:
                    # Extract face
                    x1, y1, x2, y2 = map(int, box)
                    face = img_np[y1:y2, x1:x2]
                    face = cv2.resize(face, (160, 160))

                    # Convert to tensor and get embedding
                    face_tensor = np.moveaxis(face, -1, 0) / 255.0  # Normalize to [0, 1]
                    face_tensor = torch.tensor(face_tensor, dtype=torch.float32)
                    embedding = model(face_tensor.unsqueeze(0)).detach().numpy().flatten()

                    # Save embedding
                    embedding_path = os.path.join('images', patient_username, 'embeddings', f'{image.name}.npy')
                    os.makedirs(os.path.dirname(embedding_path), exist_ok=True)
                    np.save(embedding_path, embedding)

            return JsonResponse({'message': 'Image captured and processed successfully!', 'path': path})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)

def get_face_embedding(image):
    # Convert image to RGB
    image = image.convert('RGB')
    # Resize to 160x160 (required input size for FaceNet)
    image = image.resize((160, 160))
    # Convert to numpy array
    image_array = np.array(image)
    # Normalize the image
    image_array = (image_array - 127.5) / 128.0
    # Convert to tensor
    image_tensor = torch.tensor(image_array).permute(2, 0, 1).unsqueeze(0).float()
    # Get the embedding
    with torch.no_grad():
        embedding = model(image_tensor).numpy().flatten()
    return embedding

@csrf_exempt
def compare_face(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            image_data = data['image']
            image_data = image_data.split(',')[1]  # Remove the data URL prefix
            image_bytes = base64.b64decode(image_data)
            image = Image.open(BytesIO(image_bytes))

            # Get the face embedding of the received image
            unknown_face_embedding = get_face_embedding(image)

            # Path to the directory containing patient folders
            base_embeddings_dir = os.path.join(settings.MEDIA_ROOT, 'images')

            # Initialize variables to track match
            match = False
            matched_patient = None

            # Iterate through each patient folder
            for patient_folder in os.listdir(base_embeddings_dir):
                patient_folder_path = os.path.join(base_embeddings_dir, patient_folder, 'embeddings')
                
                if not os.path.isdir(patient_folder_path):
                    continue
                
                # Load known face embeddings from files
                for root, _, files in os.walk(patient_folder_path):
                    for file in files:
                        if file.endswith('.npy'):
                            embedding_path = os.path.join(root, file)
                            known_embedding = np.load(embedding_path)

                            # Compare the embeddings
                            distance = np.linalg.norm(known_embedding - unknown_face_embedding)
                            if distance < 1.0:  # You can adjust the threshold as needed
                                match = True
                                matched_patient = patient_folder
                                break
                    if match:
                        break
                if match:
                    break

            # Return the result
            response_data = {'match': match}
            if match:
                response_data['patient_username'] = matched_patient

            return JsonResponse(response_data)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)


@csrf_exempt
def predict_treatment_trends(request):
    if request.method == 'GET':
        categories = ['Oral Surgery', 'Periodontics', 'Prosthodontics', 'Restorative Dentistry', 'Others']
        
        # Fetch all patient data including branch
        patient_response = supabase.table('patient').select('*').execute()
        patients = patient_response.data
        logger.info(f"Fetched {len(patients)} patients")

        patient_branch_map = {patient['patient_id']: patient['patient_branch'] for patient in patients}
        logger.info(f"Unique branches: {set(patient_branch_map.values())}")

        # Create a mapping from branches to treatment counts
        forecasts = {}

        for branch in set(patient_branch_map.values()):
            forecasts[branch] = {}
            for category in categories:
                # Fetch treatment data for the current branch and category
                response = supabase.table('patient_Treatments').select('*').eq('treatment', category).execute()
                data = response.data
                logger.info(f"Fetched {len(data)} treatments for category {category}")

                if not data:
                    forecasts[branch][category] = 0  # Set to 0 if no data available
                    continue

                df = pd.DataFrame(data)
                df['treatment_date'] = pd.to_datetime(df['treatment_date'])
                df.set_index('treatment_date', inplace=True)
                df = df.sort_index()

                try:
                    model = ARIMA(df['count'], order=(1, 1, 0))
                    model_fit = model.fit()
                    forecast = model_fit.forecast(steps=1)
                    forecasts[branch][category] = round(forecast[0], 2)
                except Exception as e:
                    logger.info(f"Error fitting ARIMA model for {branch}, {category}: {str(e)}")
                    forecasts[branch][category] = 0

    return JsonResponse(forecasts)


