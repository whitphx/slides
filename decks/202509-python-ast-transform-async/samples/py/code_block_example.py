import asyncio
from asyncio import sleep

wait = sleep


def foo():
    from time import sleep

    wait = sleep

    wait(1)


asyncio.run(wait(1))
