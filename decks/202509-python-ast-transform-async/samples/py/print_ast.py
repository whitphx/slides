import ast
import dis

print(ast.dump(ast.parse("x = 1 + 2"), indent=4))

print(ast.dump(ast.parse("""
def foo(x, y):
    return x + y
"""), indent=4))

print(ast.dump(ast.parse("""
a = 1
x = a * 2
print(x)
"""), indent=4))

bytecode = compile(ast.parse("""
a = 1
x = a * 2
print(x)
"""), filename="<ast>", mode="exec", optimize=0)
dis.dis(bytecode)

print(eval(bytecode))
