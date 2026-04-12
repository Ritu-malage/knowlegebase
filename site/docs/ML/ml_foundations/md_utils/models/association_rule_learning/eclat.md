# Eclat Algorithm 
- It a type of algorithm which is used to find the frequent itemset just like Apriori Algorithm, just the way it works is different
- Eclat = Equivalence Class Transformation
- It tries to identify people who brought A also brought B
- Used in recommendation systems
- There is only Support no concept of Lift and confidence
- It finds frequent itemsets using Depth-First Search (DFS) & Set Intersection due to which it is faster than Apriori
- Finds common transactions between items
- Instead of scanning transactions again and again like Apriori it uses set intersection of transaction IDs i.e.
Instead of 

| TID | Items|
|---|---|
|T1|Milk, Bread|

We store
|Items|TID|
|---|---|
|Milk|T1, T2|
|Bread|T2, T3|

# Working 
## Given Data
- Dataset:

|TID| Items|
|---|---|
|T1| Milk, Bread|
|T2| Milk|
|T3| Bread|
|T4| Milk, Bread|
|T5| Butter|

- Min Support = 2

## Convert it to vertical format

|Items|TID|Support|
|---|---|---|
|Milk | ${T1, T2, T4}$ | support = 3 |
|Bread | ${T1, T3, T4}$ | support = 3 |
|Butter | ${T5}$ | support = 1 |

- As butter has a support less than the min support it is removed thus the remaining items are Milk and Bread

## Generate Itemsets of length 2

- $Milk \cap Bread$

|Items|TID|Support|
|---|---|---|
|${Milk, Bread}$| ${T1, T4}$|2|

- It is equal to the min support thus we retain this itemset

## Generate Itemsets of length 3
- As only 2 items are there we can create an itemset which is of length 3
- Stop here

## Final frequest itemsets
- ${Milk}$
- ${Bread}$
- ${Milk, Bread}$

# Implementation
- Same implementation that is used for Apriori can be used (Just focus on support and not on confidence or lift) or manually implement from scratch
- [Basket Analysis and Optimization](https://github.com/Ritu-malage/knowlegebase/blob/main/site/docs/ML/ml_foundations/md_utils/models/association_rule_learning/practicals/apriori.ipynb)