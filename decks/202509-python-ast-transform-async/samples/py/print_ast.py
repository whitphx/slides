import ast

print(ast.dump(ast.parse("x = 1 + 2"), indent=4))

print(ast.dump(ast.parse("""
def foo(x, y):
    return x + y
"""), indent=4))
