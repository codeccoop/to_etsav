#!/usr/bin/env python
from os import getcwd, path
import re
from http.server import HTTPServer, SimpleHTTPRequestHandler

class MyHTTPRequestHandler(SimpleHTTPRequestHandler):

    directory = getcwd() + "/dist"

    def end_headers(self):
        self.send_my_headers()
        SimpleHTTPRequestHandler.end_headers(self)

    def send_my_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")

    def do_GET (self):
        if re.search(r"^\/templates\/?.*", self.path):
            directory = path.join(self.directory, "templates")
            file = re.search(r"\/([^\/]*\.[a-zA-Z]{4})$", self.path)
            if not file:
                file = "index.html"
            else:
                file = file.group(0)[1:]

            file_path = path.join(directory, file)
            file_content = open(file_path, "rb").read()
            self.send_response(200)
            self.send_header("Content-type", "text/plain")
            self.send_header("Content-length", len(file_content))
            self.end_headers()
            self.wfile.write(file_content)
        else:
            SimpleHTTPRequestHandler.do_GET(self)


if __name__ == '__main__':
    print('running server on localhost:8000')
    httpd = HTTPServer(('', 8000), MyHTTPRequestHandler)
    httpd.serve_forever()