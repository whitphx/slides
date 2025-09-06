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
        if (
            isinstance(node.func, ast.Attribute) and
            isinstance(node.func.value, ast.Name) and
            node.func.value.id == "time" and
            node.func.attr == "sleep"
        ):
            return ast.Await(
                value=ast.Call(
                    func=ast.Attribute(
                        value=ast.Name(id="asyncio", ctx=ast.Load()),
                        attr="sleep",
                        ctx=ast.Load(),
                    ),
                    args=node.args,
                    keywords=node.keywords,
                )
            )

        return node

    def visit_Module(self, node):
        self.generic_visit(node)
        node.body.insert(
            0,
            ast.Import(names=[ast.alias(name="asyncio", asname=None)])
        )
        return node


#region patch
def patch(tree):
    transformer = PyodideTransformer()
    new_tree = transformer.visit(tree)
    new_tree = ast.fix_missing_locations(new_tree)
    return new_tree
#endregion
