# v0.1.0
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

class Ping(gl.Contract):
    def __init__(self):
        pass

    @gl.public.view
    def pong(self) -> str:
        return "pong"
