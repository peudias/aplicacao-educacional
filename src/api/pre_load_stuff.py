# Miscelanious Modules
import tensorflow as tf
import numpy as np
import keras as K
import sklearn as sk
from PIL import Image
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from keras import backend as K

threshold=0.877976
np.random.seed(42)
tf.random.set_seed(42)

# Leu o arquivo com os pesos iniciais do modelo:
model = load_model('./models/M1_weights_epoch_90.h5')
print('Loaded model from disk')

#Compilou o modelo:
model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])


def classificadora(path, model):
    resize_output = path[:-4] + '_128x128_' + path[-4:]
    with Image.open(path) as picture:
        resized_pic = picture.resize((128, 128), Image.LANCZOS)
        resized_pic.save(resize_output)

    sample = img_to_array(load_img(path=resize_output, color_mode="rgb", target_size=None))
    processing_img = np.expand_dims(sample, axis=0)
    processed_image = processing_img/255

    prediction = model.predict(processed_image)

    return [resize_output, prediction[0][0], "wet" if (prediction[0] > threshold)[0] else "dry" ]

#print(classificadora('./imgs-api/test/wet/istockphoto-183808583-612x612.jpg',model))
