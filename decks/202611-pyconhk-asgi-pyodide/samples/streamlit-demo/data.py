import numpy as np
import pandas as pd


def load_data(rows: int) -> pd.DataFrame:
    """Three random walks, so the chart has a shape worth looking at."""
    generator = np.random.default_rng(seed=0)
    walk = generator.normal(loc=0.4, scale=2.0, size=(rows, 3)).cumsum(axis=0)
    return pd.DataFrame(walk, columns=["North", "South", "East"])
