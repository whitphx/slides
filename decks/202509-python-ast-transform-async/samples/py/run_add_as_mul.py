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


def transform_tree(tree):
    transformer = AddToMulTransformer()
    return transformer.visit(tree)


transformed_tree = transform_tree(tree)

bytecode = compile(transformed_tree, filename="<ast>", mode="exec")

exec(bytecode)
