# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
import genlayer as gl
from genlayer import *

class Counter(gl.Contract):
    count: u256

    def __init__(self):
        self.count = u256(0)

    @gl.public.write
    def inc(self):
        self.count += u256(1)

    @gl.public.view
    def get_count(self) -> u256:
        return self.count
