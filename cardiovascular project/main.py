import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, accuracy_score, roc_curve
data = pd.read_csv('/kaggle/input/heart-attack/heart attack level.csv')
print(data.head())
print(data.isnull().sum())
X = data.drop(columns=['Result', 'Recommendation'])
y = data['Result']  

numeric_features = ['Age', 'Heart rate', 'Systolic blood pressure', 'Diastolic blood pressure', 'Blood sugar', 'CK-MB', 'Troponin']
categorical_features = ['Gender']


plt.figure(figsize=(15, 12))
for i, feature in enumerate(numeric_features):
    plt.subplot(3, 3, i+1)
    sns.histplot(data=data, x=feature, hue='Result', multiple='stack', palette='Set1', bins=20)
    plt.title(f'Distribution of {feature} by Result')
    plt.xlabel(feature)
    plt.ylabel('Count')
plt.tight_layout()
plt.show()

plt.figure(figsize=(10, 8))
corr_matrix = data[numeric_features].corr()
sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', fmt=".2f")
plt.title('Correlation Matrix of Numeric Features')
plt.show()


preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(), categorical_features)
    ])


pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(random_state=20))
])


X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=20)


scores = cross_val_score(pipeline, X_train, y_train, cv=5, scoring='accuracy')
print("Cross-validation scores:", scores)
print("Average cross-validation score:", np.mean(scores))


pipeline.fit(X_train, y_train)


y_pred = pipeline.predict(X_test)


print("Classification Report:")
print(classification_report(y_test, y_pred))

print("Confusion Matrix:")
cm = confusion_matrix(y_test, y_pred)
print(cm)

plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=['Negative', 'Positive'],
            yticklabels=['Negative', 'Positive'])
plt.ylabel('Actual Label')
plt.xlabel('Predicted Label')
plt.title('Confusion Matrix')
plt.show()


y_pred_proba = pipeline.predict_proba(X_test)[:, 1]
roc_auc = roc_auc_score(y_test, y_pred_proba)
print(f"ROC AUC Score: {roc_auc:.2f}")

fpr, tpr, thresholds = roc_curve(y_test.map({'negative':0, 'positive':1}), y_pred_proba)
plt.figure(figsize=(8,6))
plt.plot(fpr, tpr, label=f'ROC curve (area = {roc_auc:.2f})', color='darkorange', lw=2)
plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('Receiver Operating Characteristic (ROC) Curve')
plt.legend(loc='lower right')
plt.grid(True)
plt.show()


param_grid = {
    'classifier__n_estimators': [10, 50, 100, 200],
    'classifier__max_depth': [None, 5, 10, 20]
}
grid_search = GridSearchCV(pipeline, param_grid, cv=5, scoring='accuracy')
grid_search.fit(X_train, y_train)
print("Best parameters:", grid_search.best_params_)
print("Best score:", grid_search.best_score_)


n_random_tests = 10
random_test_accuracies = []

for i in range(n_random_tests):
   
    X_train_rand, X_test_rand, y_train_rand, y_test_rand = train_test_split(
        X, y, test_size=0.2, random_state=np.random.randint(0, 10000))
    pipeline.fit(X_train_rand, y_train_rand)
    y_pred_rand = pipeline.predict(X_test_rand)
    acc = accuracy_score(y_test_rand, y_pred_rand)
    random_test_accuracies.append(acc)
    
    print(f"Random test {i+1} accuracy: {acc:.4f}")
