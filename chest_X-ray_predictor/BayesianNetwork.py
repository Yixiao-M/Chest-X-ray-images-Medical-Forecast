from pgmpy.models import BayesianModel
from pgmpy.estimators import BayesianEstimator
from pgmpy.inference import VariableElimination
import pandas as pd

model = BayesianModel([('label', 'fever'),
                       ('label', 'fatigue'),
                       ('label', 'dyspnea'),
                       ('label', 'chest_pain'),
                       ('label', 'weight_loss'),
                       ('label', 'cough'),
                       ('cough', 'sputum'),
                       ('cough', 'hemoptysis')])

df = pd.read_csv("./Data/train/train.csv")
df = df.drop(columns=['filename'],axis=1)


model.fit(df,estimator=BayesianEstimator)


# # evaluate the model
# test = pd.read_csv("./Data/test/test.csv")
# test = test.drop(columns=['filename'],axis=1)
# predict_data=test.drop(columns=['label'],axis=1)
# y_pred = model.predict(predict_data)
# print((y_pred['label']==test['label']).sum()/len(test))
# # test accuracy 0.8584779706275033

# predict_data = json.load(open('1.json'))
# predict_data = pd.read_json(predict_data,orient='records')
# predict_data = predict_data.drop(columns=['filename'],axis=1)
# y_pred = model.predict(predict_data)
# print(y_pred.loc[0]['label'])

data = pd.read_csv('1.csv')

data = data.drop(columns=['filename','label'],axis=1)
data = data.to_dict('records')[0]
# print(data)
model_infer = VariableElimination(model)
q_cdp = model_infer.query(variables=['label'],evidence=data)
print(q_cdp)
print(q_cdp.get_value(label=0))