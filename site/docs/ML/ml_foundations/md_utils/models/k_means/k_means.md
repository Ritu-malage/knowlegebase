# K-Means Clustering

- K-Means Clustering is an unsupervised machine learning algorithm used to group similar data points into clusters.
- The goal is to minimize the distance between data points and their assigned cluster center.

# Working

1. Choose the number of clusters i.e. K
2. Randomly initialise K “centroids” (center points)
3. Assign each data point to the nearest centroid
4. Recalculate the centroids (average of points in each cluster)
5. Repeat steps 3–4 until centroids stop changing


# Cons
- Sensitive to:
    - Initial centroid selection
- Requires you to choose K beforehand
- Doesn’t handle non-linear shapes well
- Struggles with outliers
- Choosing the right K can be tricky (use methods like Elbow Method)

# Elbow method

- The Elbow Method is used to determine the optimal number of clusters (K) in K-Means clustering by drawing a plot between the no of clusters and WCSS (With cluster sum of squares)
- As you increase the number of clusters (K), the model fits the data better (error decreases).
- But after a certain point, the improvement slows down forming an “elbow” shape in the graph.
- That “elbow point” is considered the best K.
- X-axis → Number of clusters (K)
- Y-axis → Within-Cluster Sum of Squares (WCSS) (error)
- $WCSS = \sum_{i=1}^{K} \sum_{x \in C_i} |x - \mu_i|^2$
- Where, 
    - WCSS -> Measures how tightly grouped the clusters are
    - Lower WCSS = better clustering

# Working of elbow method
1. Run K-Means for different values of K (e.g., 1 to 10)
2. Compute WCSS for each K
3. Plot the graph
4. Find the “elbow point” where the decrease slows
5. Choose that K

# Random initialisation trap

- When we choose the k centroids randomly it generates different results each time the initialised centroids changes
- This is known as the random initialisation trap
- The result is not deterministic
- To avoid this K Means ++ algorithm is used

# K means ++

- Works similar to K Means but just the way the centroids are initialised changes
- It solves one of the biggest problems in regular K-Means: that is random initialisation trap
- Forest centroids is chosen at random
- For example Imagine placing K shops in a city:
    - K-Means: randomly place them → might cluster in one area
    - K-Means++: place them far apart → better coverage of the city

# Working of K Means ++

1. Pick the first centroid randomly from the data points
2. For each remaining point, compute its distance from the nearest chosen centroid
3. Select the next centroid with probability proportional to the square of that distance
    - Farther points have a higher chance of being chosen
4. Repeat until K centroids are chosen
5. Then run normal K-Means

# Implementation

- K-Means is an unsupervised learning algorithm, i.e. There are no target label (y values)
- This implies that we are not predicting anything we are just grouping data
- So there’s no “training vs testing accuracy” like in supervised models.
- Instead use the entire dataset to find clusters and then evaluate using metrics like WCSS
- If you want to test the generalisation of the cluster prediction then you can use train test split
- As k means is a distance based algorithm scaling and normalisation must be performed

```python
from sklearn.cluster import KMeans
model = KMeans(n_clusters= no_of_clusters, init= 'k-means++', random_state=42)
model.fit(X)
print(f"WCSS: {model.intertia_}")

# Cluster labels for each point
labels = model.labels_

# To know the centroids values
centroids = model.cluster_centers_

# Prediction
 model.predict(new_data)
```

- Where,
    - init: Which initialisation technique must be used for initialising the starting centroids if it’s set to k-means ++ it avoids random initialisation trap
