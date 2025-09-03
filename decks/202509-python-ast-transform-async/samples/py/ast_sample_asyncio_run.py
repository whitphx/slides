import ast

asyncio_run_ast = ast.parse("asyncio.run(coro(arg))", "exec").body[0].value
print(ast.dump(asyncio_run_ast, indent=4))

await_coro_ast = ast.parse("await coro(arg)", "exec").body[0].value
print(ast.dump(await_coro_ast, indent=4))

def transform_asyncio_run(node):
    return ast.Await(
        value=node.args[0],
    )
assert ast.dump(transform_asyncio_run(asyncio_run_ast)) == ast.dump(await_coro_ast)


time_sleep_ast = ast.parse("time.sleep(arg)").body[0].value
print(ast.dump(time_sleep_ast, indent=4))

await_asyncio_sleep_ast = ast.parse("await asyncio.sleep(arg)").body[0].value
print(ast.dump(await_asyncio_sleep_ast, indent=4))

def transform_time_sleep(node):
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

assert ast.dump(transform_time_sleep(time_sleep_ast)) == ast.dump(await_asyncio_sleep_ast)
