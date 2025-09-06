import ast

#region transformer
class TimeSleepTransformer(ast.NodeTransformer):
    def visit_Call(self, node):
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
#endregion

tree = ast.parse("""
import time
time.sleep(1)
""")

transformer = TimeSleepTransformer()
new_tree = transformer.visit(tree)
#endregion
assert ast.dump(new_tree) == ast.dump(ast.parse("""
import asyncio
import time
await asyncio.sleep(1)
"""))
print(ast.dump(new_tree, indent=4))
