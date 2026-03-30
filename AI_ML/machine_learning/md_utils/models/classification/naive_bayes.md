# Naive Bayes Classifer

- Naive Bayes is a machine learning algorithm that uses the concept of probability theory to classify data points.
- It uses the concept of "Bayes Theorem".
- Core idea: For a given input, the classifier calculates: *“What is the probability that this data point belongs to each class?”*. It then assigns the class with the highest probability.
- Example 
    - Suppose we want to predict whether a person will walk or drive to the office based on their age and estimated salary.  
    - Compute $P(Walks|X)$ i.e. What is the probability that the unseen user will walk to office given the features X (Age, estimated salary)
    - Compute $P(Drive|X)$ i.e. What is the probability that the unseen user will Drive given the features X (Age, estimated salary)
    - Compare both the probabilities and assign the class with the greater likelihood.
    - $P(Drives|X) = \frac{P(X|Drives)*P(Drives)}{P(X)}$
        - $P(Drives) = \frac{\text{No of users who drive to office}}{\text{Total No Of People}}$
            - What is the probability that the user might drive, irrespective of their salary or age
        - $P(X) = \frac{\text{No Of Similar Observations}}{\text{Total no of observations}}$
            - First we decide on the radius value
            - And we draw a circle of that radius keeping the new datapoint as the center
            - We are trying to find what is the probability of points which are exhibiting the similar features as that of the unseen point
            - All points within the radius will be considered as points with similar features as that of the unseen data 
        - $P(X|Drives) = \frac{\text{No of users who drive within the vicinity}}{\text{Total no of users who drive}}$
            - First draw a circle keeping the unseen data as the center
            - Consider all the samples which belong to the class "Drives"
            - It tries to compute how many samples within the circle drive when compared to the total no of samples/ users who drive
        - Similarily $P(X|Walk)$ is computed
        - Note $P(X)$ will remain the same in both cases
        - Since both probabilities are being compared against each other, since the denominator is the same in both cases we can ignore that ($P(X)$)
- As the model works based on probabilities, we dont have to standardize/ feature scale the values
- If there are only 2 classes then we can find the probability of the unseen data belonging to 1 class given the feature set and the probability of it being other class will just be 1 -  probability of it being in class 1, as the probabilities will sum up to 1
- If there are more than 1 class we will need to calculate the probabilities of unseen label belonging to each of the classes given the feature set

# Assumptions
- All features are independent of each other, given the class. Thus the algorithm is called as "Naive"


# Limitations
- The assumption of all the features being independent of each other is not realistic
- Will struggle when features are highly correlated


# Bayes Theorem 
- 2 machines prepare the spanner’s but each of the machines produces at different spanner’s
- You are given the mixture of spanners, and your task is to find all the defective spanner’s
- It is like saying what is the probability of machine 1 producing defective and what is the probability of machine 2 producing defective spanner’s
- $P(A|B) = \frac{P(B|A) * P(A)}{P(B)}$
- Where,
    - $P(A|B)$: Posterior Probability
    - $P(B|A)$: Likelihood
    - $P(A)$: Prior Probability
    - $P(B)$: Marginal Likelihood

# Implementation
- [Predict whether the person will purchase the product based on the age and estimated salary using Naive Bayes]()