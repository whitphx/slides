import ast

class AsyncioRunTransformer(ast.NodeTransformer):
    def visit_Call(self, node):
        return ast.Await(
            value=node.args[0],
        )


tree = ast.parse("asyncio.run(main())")

transformer = AsyncioRunTransformer()
transformed_tree = transformer.visit(tree)

assert ast.dump(transformed_tree) == ast.dump(ast.parse("await main()"))
print(ast.dump(transformed_tree, indent=4))
