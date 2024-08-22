import tensorflow as tf
import numpy as np
from PIL import Image
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from keras.models import load_model
import os
import json
import traceback

import sys
import io

# Definir o padrão de codificação para UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


# Definir o threshold
threshold = 0.877976

# Configurar seeds para reprodutibilidade
np.random.seed(42)
tf.random.set_seed(42)

# Carregar o modelo
model_path = './src/api/json/M1_weights_epoch_90.h5'
if not os.path.isfile(model_path):
    raise FileNotFoundError(f"O modelo não foi encontrado: {model_path}")

model = load_model(model_path)
print('Modelo carregado do disco')

# Compilar o modelo
model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])

def classificadora(path, model, dir):
    classificados = {'attributes': {}}
    
    if not dir:  # Processamento de uma única imagem
        resize_output = path[:-4] + '_128x128_' + path[-4:]
        try:
            with Image.open(path) as picture:
                resized_pic = picture.resize((128, 128), Image.LANCZOS)
                resized_pic.save(resize_output)

            sample = img_to_array(load_img(path=resize_output, color_mode="rgb", target_size=None))
            processing_img = np.expand_dims(sample, axis=0)
            processed_image = processing_img / 255.0

            prediction = model.predict(processed_image)
            print(f"Previsão para {path}: {prediction[0][0]}")
            return [resize_output, prediction[0][0], "wet" if prediction[0][0] > threshold else "dry"]
        except Exception as e:
            print(f"Erro ao processar a imagem individual {path}: {e}")
            traceback.print_exc()
    
    else:  # Processamento de várias imagens em um diretório
        counter = 0
        for filename in os.listdir(path):
            if filename.lower().endswith(('.jpg')):
                img_path = os.path.join(path, filename)
                print(f"Processando {img_path}")

                try:
                    with Image.open(img_path) as picture:
                        resized_pic = picture.resize((128, 128), Image.LANCZOS)
                        resized_pic.save(img_path)
                except Exception as e:
                    print(f"Erro ao redimensionar a imagem {img_path}: {e}")
                    traceback.print_exc()
                    continue

                try:
                    sample = img_to_array(load_img(path=img_path, color_mode="rgb", target_size=None))
                    processing_img = np.expand_dims(sample, axis=0)
                    processed_image = processing_img / 255.0
                    prediction = model.predict(processed_image)

                    file = {
                        'name': filename,
                        'classified_as': "wet" if prediction[0][0] > threshold else "dry",
                        'score': str(prediction[0][0])
                    }

                    classificados['attributes'][f'{counter + 1}'] = file
                    counter += 1
                except Exception as e:
                    print(f"Erro ao processar a previsão para a imagem {img_path}: {e}")
                    traceback.print_exc()

    output_path = './src/api/json/classificados.json'
    try:
        with open(output_path, 'w', encoding='utf-8') as filepath:
            json.dump(classificados, filepath, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"Erro ao salvar o arquivo JSON: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    classificadora('./src/api/img/', model, True)
