# Accuracy
# Accuracy Paradox

- The **accuracy paradox** occurs when a model shows high accuracy but actually performs poorly.
- Accuracy is defined as the ratio of correct predictions to the total number of predictions.
- In **imbalanced datasets**, accuracy can be misleading because it doesn’t reflect the model’s ability to detect minority classes.
- Example: Consider a fraud detection dataset with 1,000 transactions, where 990 are **not fraud** and 10 are **fraud**.
    - If the model predicts **all transactions as Not Fraud**, the accuracy will be:
    - Accuracy=990/1000=99%
- Despite the high accuracy, the model fails to identify any fraudulent transactions, making it practically useless for fraud detection.