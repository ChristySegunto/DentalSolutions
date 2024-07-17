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
from torchvision import transforms
from facenet_pytorch import InceptionResnetV1
from mtcnn.mtcnn import MTCNN
import cv2
import io
from PIL import Image
import base64
import json
from io import BytesIO


# Initialize FaceNet model
model = InceptionResnetV1(pretrained='vggface2').eval()

# Load your known face embeddings and labels (this is just an example)
known_face_embeddings = [...]  # List of numpy arrays
known_face_labels = [...]

# Initialize FaceNet model
resnet = InceptionResnetV1(pretrained='vggface2').eval()

# Initialize MTCNN for face detection
mtcnn = MTCNN()

# Initialize MTCNN for face detection
detector = MTCNN()

@csrf_exempt
def capture_images(request):
    if request.method == 'POST':
        try:
            image = request.FILES['image']
            patient_username = request.POST['patient_username']

            # Save the image to the media directory
            path = default_storage.save(os.path.join('images', patient_username, 'raw', image.name), ContentFile(image.read()))

            # Read the saved image
            image_path = os.path.join('media', path)
            img = cv2.imread(image_path)
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

            # Detect faces
            boxes, probs = mtcnn.detect(img_rgb)
            if boxes is not None:
                for box in boxes:
                    # Extract face
                    x1, y1, x2, y2 = map(int, box)
                    face = img_rgb[y1:y2, x1:x2]
                    face = cv2.resize(face, (160, 160))

                    # Convert to tensor and get embedding
                    face_tensor = np.moveaxis(face, -1, 0) / 255.0  # Normalize to [0, 1]
                    face_tensor = torch.tensor(face_tensor, dtype=torch.float32)
                    embedding = resnet(face_tensor.unsqueeze(0)).detach().numpy().flatten()

                    # Save embedding
                    embedding_path = os.path.join('media', 'images', patient_username, 'embeddings', f'{image.name}.npy')
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
        data = json.loads(request.body)
        image_data = data['image']
        image_data = image_data.split(',')[1]  # Remove the data URL prefix
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))

        # Get the face embedding of the received image
        unknown_face_embedding = get_face_embedding(image)

        # Compare with known embeddings
        match = False
        for known_embedding in known_face_embeddings:
            distance = np.linalg.norm(known_embedding - unknown_face_embedding)
            if distance < 1.0:  # You can adjust the threshold as needed
                match = True
                break

        return JsonResponse({'match': match})

    return JsonResponse({'error': 'Invalid request method'}, status=400)


