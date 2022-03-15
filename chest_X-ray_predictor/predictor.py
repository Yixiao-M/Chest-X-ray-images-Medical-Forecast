from tensorflow.keras.models import load_model
from pgmpy.models import BayesianModel
from pgmpy.estimators import BayesianEstimator
from pgmpy.inference import VariableElimination
import numpy as np
import pandas as pd
import tensorflow as tf
import sys
import json

test_image_path = "./IM-0011-0001.jpeg"
classes = ["Covid-19", "Normal", "Pneumonia", "Tuberculosis"]

path = './chest_X-ray_predictor/'
# build the bayesian network
def buildBN():

    model = BayesianModel([('label', 'fever'),
                           ('label', 'fatigue'),
                           ('label', 'dyspnea'),
                           ('label', 'chest_pain'),
                           ('label', 'weight_loss'),
                           ('label', 'cough'),
                           ('cough', 'sputum'),
                           ('cough', 'hemoptysis')])

    # read the train data
    df = pd.read_csv(path + "Data/train/train.csv")
    df = df.drop(columns=['filename'], axis=1)

    # train the model
    model.fit(df, estimator=BayesianEstimator)

    return model

def BNPredictor(data):

    pred = []
    model = buildBN()

    model_infer = VariableElimination(model)
    q_cdp = model_infer.query(variables=['label'], evidence=data)

    pred.append(q_cdp.get_value(label=0))
    pred.append(q_cdp.get_value(label=1))
    pred.append(q_cdp.get_value(label=2))
    pred.append(q_cdp.get_value(label=3))

    return np.array(pred)


# process the image
def processImg(filename):
    # load the image
    img = tf.io.read_file(filename)
    # decode
    img = tf.image.decode_image(img, channels=3)
    # resize
    img = tf.image.resize(img, [224, 224])
    # normalize
    img = tf.image.convert_image_dtype(img, tf.float32)
    img = img / 255.0

    img = tf.expand_dims(img, axis=0)

    return img

# load the ResNet
def loadResNet():

    model = load_model(path + "chest_X-ray_predictor.h5")

    return model

# predict disease by chest X-ray
def ResNetPredictor(img):
    ResNetModel = loadResNet()

    pred = ResNetModel.predict(img)

    return pred[0]



def predictor(filename):

  # read the data
  data = pd.read_csv(filename)

  # get the filename of image
  imgName = data.loc[0]['filename']

  # remove the useless data
  data = data.drop(columns=['filename','label', 'agree'],axis=1)

  # covert data(Dataframe) into dict
  data = data.to_dict('records')[0]

  # get image
  img = processImg(path + 'Temp/{}'.format(imgName))

  # combine the two predictor
  pred = ResNetPredictor(img)

  pred += BNPredictor(data)

  return pred/2


def savePred(pred,filename):
    pred = pred.tolist()
    dict = {}
    dict[classes[0]] = round(pred[0], 4)
    dict[classes[1]] = round(pred[1], 4)
    dict[classes[2]] = round(pred[2], 4)
    dict[classes[3]] = round(pred[3], 4)

    with open(path + 'Temp/{}.json'.format(filename),'w') as f:
        json.dump(dict,f)



if __name__ == '__main__':

   filename = sys.argv[1]
   pred = predictor(path + 'Temp/{}.csv'.format(filename))
   savePred(pred, filename)