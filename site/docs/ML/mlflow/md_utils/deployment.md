# MLFlow Deployment and Hosting

# Problem Statement
- To predict house prices
- Regression problem

# Steps
- Write the scripts
- Push it to GitHub
- To store artifacts S3 bucket can be used
- Create EC2 instance for MLFlow tracking


# Steps to run MLFlow server on EC2 instance
- Open the remote system for the EC2 instance
- Setup MLFlow in it
- This is a 1 time thing
```bash
sudo apt update

# Install python pip
sudo apt install python3-pip

# Install virtualenv
pip install virtualenv

# Create directory
mkdir mlflow

# Install dependencies within your environemnt
pip install mlflow awscli boto3 setuptools

# Configure AWS so that it can access S3 and other AWS components
aws configure
```
- This will prompt you to enter the AWS access key details
- Now the whole setup of MLFlow in the EC2 instance is completed
- Now tracking server must be started
```bash
mlflow server -h 0.0.0.0 --backend-store-uri sqlite:///mlflow.db --default-artifact-root s3://< path >
```
- In the S3 path provided the artifacts will be stored
- In the instance we need to enable the port 5000 under security groups and inbound rules
- The type must be Custom TCP, Port = 5000, Source = Anywhere IPv4. Then save the rule
- Then copy the Public IPV4 DNS and then paste this in the browswer 
`PublicIPv4DNS/5000`, this will be tracking server URI for MLFlow
- Now you will be able to run MLFlow server on the EC2 instance


# Amazon SageMaker
- Fully managed ML platform from AWS
- It helps in:
    - Build ML models
    - Train at scale
    - Tune hyperparameters
    - Deploy models as APIs
    - Monitor models in production
- You dont have to manage the servers manually 
- Its an end-to-end ML platform for training + deployment + MLOps.
- MLFlow helps in tracking, logging, pacakaging while sagemaker helps in scaling the training infrastructue, deployment infrastructure and manage the endpoints
- Its like train on sage maker and log its metrics in MLFlow 


# Setup of sageMaker
- Add you github repo onto Amazon Sage Makers git repositories
- Then create a notebook instance within Amazon sageMaker
- The role to the notebook must have access to the repository, and S3
- Now run the training on the sageMaker
- The tracking URI must be set to the EC2 instance where MLFlow setup is done
- Then after comparing the models, register the best model
- Now run the below command in the notebook to deploy models from MLFlow to Amazon Sage maker
```bash
mlflow sagemaker build-and-push-container --container xgb --env-manager conda
```
- Docker image will be built 
- It used the container called xgb
- Installs all the dependencies using conda
- Pushes the image to AWS ECR



# Deployment methods
- First we need to train the model
- Log the model using MLFlow
- Register the model
- Test it locally if you are able to test it 
```bash
mlflow models serve -m models:< path > -p 5000
```

## Option1 of deployment
- One way is to directly load the MLFlow model in your Flask or FastAPI
```python
import mlflow.pyfunc

model = mlflow.pyfunc.load_model("models:/<path>")

@app.post("/predict")
def predict(data):
    return model.predict(data)
```

## Option2 of deployment : Docker container
- We can build docker image using 
1. MLFlows built in Docker build
```bash
mlflow models build-docker \
    -m "models:/<path>" \
    -n <"Model Name"> \
    --enable-mlserver
```
2. Custom Dockerfile
```dockerfile
FROM python:3.10-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY model/ /app/model

COPY src/serve.py

EXPOSE 8080

CMD ["python", "serve.py"]
```
- In serve.py the model will be loaded from the registry 
- One the image is build via CI/CD pipeline you can push the docker image into ECR
- Then deploy it using AWS Agemaker, EKS etc
- The ECR image will just contain code, and in that there will be a part when the models will be loaded from the registry
- The model artifacts will not be baked into the image, its pulled at the containers startup


## Option3 of deployment : Deploy through SageMaker
```bash
mlflow sagemaker deploy \
    --model-uri models:< path > \
    --app-name < name of the app >
```
- This will build the container
- Pushes the image to ECR
- Creates and endpoint
- Handles scaling
