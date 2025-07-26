q1 = {'apples': 100, 'bananas': 50, 'oranges': 75} 
q2 = {'apples': 120, 'bananas': 60, 'grapes': 40}

# {'apples': 220, 'bananas': 110, 'oranges': 75, 'grapes': 40}
from collections import Counter


# Convert to Counter and add
result = dict(Counter(q1) + Counter(q2))
print(result)

print((Counter(q1)))