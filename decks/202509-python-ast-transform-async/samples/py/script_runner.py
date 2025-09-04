import ast
from inspect import CO_COROUTINE

import codemod


async def run_script(code):
    tree = ast.parse(code, filename="<ast>", mode="exec")

    new_tree = codemod.patch(tree)

    try:
        bytecode = compile(new_tree, filename="<ast>", mode="exec", flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)
    except Exception as e:
        print(e)
        import traceback
        traceback.print_exc()
        exit(1)

    if bytecode.co_flags & CO_COROUTINE:
        await eval(bytecode)
    else:
        exec(bytecode)
