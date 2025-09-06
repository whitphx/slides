import ast

#region visitor
class MyVisitor(ast.NodeVisitor):
    def visit_Call(self, node):
        print("Found a function call:", ast.dump(node))
        self.generic_visit(node)
#endregion


tree = ast.parse("""
def foo():
    bar()
""")
MyVisitor().visit(tree)
