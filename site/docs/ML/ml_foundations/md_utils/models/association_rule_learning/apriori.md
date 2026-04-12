# Apriori Algorithm

- The Apriori Algorithm is a classic algorithm used in association rule learning, a part of Data Mining.
- It helps discover patterns, relationships, or associations between items in large datasets commonly used in market basket analysis.
- Apriori finds rules like: “If a person buys bread and butter, they are likely to buy milk.” i.e. People who brought product A also brought product B
- It’s used to generate rules

# Components of Apriori Algorithm

- Support
    - How often an itemset appears in the dataset.
    - $Support(A) = \frac{\text{Number of transactions containing A}}{\text{Total transactions}}$
- Confidence
    - Measures how often a rule is true.
    - $Confidence(A → B) = \frac{Support(A \cap B)}{Support(A)}$
    - You define a rule and then we calculate the confidence of that rule
    - Measures how often the rule is right
- Lift
    - Measures how strong an association rule is
    - $Lift(A → B) = \frac{Support(A \cap B)}{Support(A) \times Support(B)}$
    - Confidence alone can mislead. For eg: If bread is very common then $confidence(Milk → Bread)$ may look higher. So Lift checks for is this rule meaningful or is just because of bread it is popular
    - It measure how meaningful the rule is
    - Range of Lift(A → B) = $(0, \infty)$
        - If Lift = 1, it implies A and B are independent
    - 0 < Lift < 1, it implies there is a negative association between the 2 (A and B occurs together less than expected). For eg. People who buy A tend not to buy B
    - Lift > 1, implies positive association, higher the value stronger the relationship

# Working example

## Given Data
- Minimum support = 0.4 (40%)
- Dataset

| Transaction ID | Items       |
| -------------- | ----------- |
| T1             | Milk, Bread |
| T2             | Milk        |
| T3             | Bread       |
| T4             | Milk, Bread |
| T5             | Butter      |

## Compute support for each itemset
- $Support(A) = \frac{\text{Number of transactions containing A}}{\text{Total transactions}}$
- $Milk = \frac{3}{5}$ = 0.6
    - Milk appears 3 times in the dataset and the total number of transaction is 5
- $Bread = \frac{3}{5}$ = 0.6
- $Butter = \frac{1}{5}$ = 0.2
- As the ,minimum support given is 0.4, keep only those itemsets which have a support greater than or equal to 0.4 i.e. Milk, Bread

## Generate itemsets (pairs)
- Find all possible pairs with the remaining itemset
- The only possible pair is ${Milk, Bread}$

## Calculate support for itemsets(pairs)
- Now we find the no of transactions which have both these pairs appearing together
- It appears in T1, and T4 
- $Support{Milk, Bread} = \frac{2}{5}$ = 0.4
- As this is equal to the minimum support we retain it

## Generate itemsets(len = 3)
- No possible itemsets as we have only 2 items i.e. bread and milk
- So we stop here

## Final list of frequently appearing itemsets are
- $L1 → {Milk}, {Bread}$
- $L2 → {Milk, Bread}$

## Generate Association Rules
- Possible Rules
- $Rule1: Milk → Bread$
    - $Confidence = \frac{Support(Milk \cap Bread)}{Support(Milk)}$ 
    - $\frac{0.4}{0.6}$
- $Rule2: Bread → Milk$
    - $Confidence = \frac{0.4}{0.6}$ = 0.67


# Implementation
- No need of splitting the dataset into train and test, as we are trying to learn the entire dataset to generate the rules
- [Basket Analysis and Optimization](https://github.com/Ritu-malage/knowlegebase/blob/main/site/docs/ML/ml_foundations/md_utils/models/association_rule_learning/practicals/apriori.ipynb)