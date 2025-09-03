#!/usr/bin/env python3
import sys

with open(sys.argv[1]) as f:
    code = f.read()

exec(code)
