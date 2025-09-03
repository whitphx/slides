#!/usr/bin/env python3
import sys
import ast

with open(sys.argv[1]) as f:
    code = f.read()

tree = ast.parse(code)


class AddToMulTransformer(ast.NodeTransformer):
    def visit_BinOp(self, node):
        self.generic_visit(node)
        if isinstance(node.op, ast.Add):
            node.op = ast.Mult()
        return node


ast_transformer = AddToMulTransformer()

transformed_tree = ast_transformer.visit(tree)

bytecode = compile(transformed_tree, filename="<ast>", mode="exec")

exec(bytecode)
