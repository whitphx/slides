import ast


class PyodideTransformer(ast.NodeTransformer):
    def visit_Call(self, node):
        if (
            isinstance(node.func, ast.Attribute) and
            isinstance(node.func.value, ast.Name) and
            node.func.value.id == "asyncio" and
            node.func.attr == "run"
        ):
            return ast.Await(
                value=node.args[0],
            )

        return node


#region patch
def patch(tree):
    transformer = PyodideTransformer()
    new_tree = transformer.visit(tree)
    new_tree = ast.fix_missing_locations(new_tree)
    return new_tree
#endregion
