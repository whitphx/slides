import asyncio
import time

async def async_timer():
    print("Async time start", time.time())
    await asyncio.sleep(1)
    print("Async time end", time.time())


print("Script start", time.time())
# asyncio.run(async_timer())
asyncio.create_task(async_timer())
time.sleep(1)
