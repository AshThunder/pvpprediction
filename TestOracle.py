# v0.1.0
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

class TestOracle(gl.Contract):
    def __init__(self):
        pass

    @gl.public.view
    def ping(self) -> Address:
        try:
            return gl.get_sender()
        except:
            return Address("0x0000000000000000000000000000000000000001")

    @gl.public.view
    def ping2(self) -> Address:
        try:
            return gl.message.sender
        except:
            return Address("0x0000000000000000000000000000000000000002")
