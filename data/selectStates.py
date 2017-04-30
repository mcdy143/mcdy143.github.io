import pandas as pd

df = pd.read_csv('healthQuality.csv')
fState = df[pd.isnull(df['County'])]
print(fState)
fState.to_csv('healthQualityState.csv', index=False)
