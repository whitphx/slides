import ast

#region transformer
class AsyncioRunTransformer(ast.NodeTransformer):
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
#endregion

tree = ast.parse("asyncio.run(main())")

transformer = AsyncioRunTransformer()
transformed_tree = transformer.visit(tree)

assert ast.dump(transformed_tree) == ast.dump(ast.parse("await main()"))
print(ast.dump(transformed_tree, indent=4))
